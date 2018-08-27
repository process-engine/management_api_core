import {IIdentity} from '@essential-projects/iam_contracts';

import {ActiveToken, FlowNodeRuntimeInformation, IKpiApiService} from '@process-engine/kpi_api_contracts';
import {ILoggingApiService, LogEntry} from '@process-engine/logging_api_contracts';
import {ITokenHistoryApiService, TokenHistoryEntry} from '@process-engine/token_history_api_contracts';

import {
  IConsumerApiService,
  ProcessModel as ConsumerApiProcessModel,
  ProcessModelList as ConsumerApiProcessModelList,
} from '@process-engine/consumer_api_contracts';
import {DeploymentContext, IDeploymentApiService, ImportProcessDefinitionsRequestPayload} from '@process-engine/deployment_api_contracts';
import {
  Correlation,
  Event,
  EventList,
  IManagementApiService,
  ManagementContext,
  ProcessModelExecution,
  UserTaskList,
  UserTaskResult,
} from '@process-engine/management_api_contracts';
import {
  ExecutionContext,
  ICorrelationService,
  IExecutionContextFacade,
  IExecutionContextFacadeFactory,
  IProcessModelFacade,
  IProcessModelFacadeFactory,
  IProcessModelService,
  Model,
  ProcessDefinitionRaw,
  Runtime,
} from '@process-engine/process_engine_contracts';

import * as Converters from './converters/index';

import * as BluebirdPromise from 'bluebird';

export class ManagementApiService implements IManagementApiService {
  public config: any = undefined;

  private _consumerApiService: IConsumerApiService;
  private _correlationService: ICorrelationService;
  private _deploymentApiService: IDeploymentApiService;
  private _executionContextFacadeFactory: IExecutionContextFacadeFactory;
  private _kpiApiService: IKpiApiService;
  private _loggingApiService: ILoggingApiService;
  private _processModelFacadeFactory: IProcessModelFacadeFactory;
  private _processModelService: IProcessModelService;
  private _tokenHistoryApiService: ITokenHistoryApiService;

  constructor(consumerApiService: IConsumerApiService,
              correlationService: ICorrelationService,
              deploymentApiService: IDeploymentApiService,
              executionContextFacadeFactory: IExecutionContextFacadeFactory,
              kpiApiService: IKpiApiService,
              loggingApiService: ILoggingApiService,
              processModelFacadeFactory: IProcessModelFacadeFactory,
              processModelService: IProcessModelService,
              tokenHistoryApiService: ITokenHistoryApiService) {

    this._consumerApiService = consumerApiService;
    this._correlationService = correlationService;
    this._deploymentApiService = deploymentApiService;
    this._executionContextFacadeFactory = executionContextFacadeFactory;
    this._kpiApiService = kpiApiService;
    this._loggingApiService = loggingApiService;
    this._processModelFacadeFactory = processModelFacadeFactory;
    this._processModelService = processModelService;
    this._tokenHistoryApiService = tokenHistoryApiService;
  }

  private get consumerApiService(): IConsumerApiService {
    return this._consumerApiService;
  }

  private get correlationService(): ICorrelationService {
    return this._correlationService;
  }

  private get deploymentApiService(): IDeploymentApiService {
    return this._deploymentApiService;
  }

  private get executionContextFacadeFactory(): IExecutionContextFacadeFactory {
    return this._executionContextFacadeFactory;
  }

  private get kpiApiService(): IKpiApiService {
    return this._kpiApiService;
  }

  private get loggingApiService(): ILoggingApiService {
    return this._loggingApiService;
  }

  private get processModelFacadeFactory(): IProcessModelFacadeFactory {
    return this._processModelFacadeFactory;
  }

  private get processModelService(): IProcessModelService {
    return this._processModelService;
  }

  private get tokenHistoryApiService(): ITokenHistoryApiService {
    return this._tokenHistoryApiService;
  }

  // Correlations
  public async getAllActiveCorrelations(context: ManagementContext): Promise<Array<Correlation>> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const activeCorrelations: Array<Runtime.Types.Correlation> = await this.correlationService.getAllActiveCorrelations(executionContextFacade);

    const managementApiCorrelations: Array<Correlation> = activeCorrelations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  // Process models
  public async getProcessModels(context: ManagementContext): Promise<ProcessModelExecution.ProcessModelList> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const consumerApiProcessModels: ConsumerApiProcessModelList = await this.consumerApiService.getProcessModels(context);

    const managementApiProcessModels: Array<ProcessModelExecution.ProcessModel> =
      await BluebirdPromise.map(consumerApiProcessModels.processModels, async(processModel: ConsumerApiProcessModel) => {
        const processModelRaw: string = await this._getRawXmlForProcessModelById(executionContextFacade, processModel.id);

        return Converters.convertProcessModel(processModel, processModelRaw);
      });

    return <ProcessModelExecution.ProcessModelList> {
      processModels: managementApiProcessModels,
    };
  }

  public async getProcessModelById(context: ManagementContext, processModelId: string): Promise<ProcessModelExecution.ProcessModel> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);

    const consumerApiProcessModel: ConsumerApiProcessModel = await this.consumerApiService.getProcessModelById(context, processModelId);
    const processModelRaw: string = await this._getRawXmlForProcessModelById(executionContextFacade, consumerApiProcessModel.id);

    const managementApiProcessModel: ProcessModelExecution.ProcessModel = Converters.convertProcessModel(consumerApiProcessModel, processModelRaw);

    return managementApiProcessModel;
  }

  public async startProcessInstance(context: ManagementContext,
                                    processModelId: string,
                                    startEventId: string,
                                    payload: ProcessModelExecution.ProcessStartRequestPayload,
                                    startCallbackType: ProcessModelExecution.StartCallbackType =
                                      ProcessModelExecution.StartCallbackType.CallbackOnProcessInstanceCreated,
                                    endEventId?: string,
                                  ): Promise<ProcessModelExecution.ProcessStartResponsePayload> {

    return this.consumerApiService.startProcessInstance(context, processModelId, startEventId, payload, startCallbackType, endEventId);
  }

  public async getEventsForProcessModel(context: ManagementContext, processModelId: string): Promise<EventList> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);

    const processModel: Model.Types.Process = await this.processModelService.getProcessModelById(executionContextFacade, processModelId);
    const processModelFacade: IProcessModelFacade = this.processModelFacadeFactory.create(processModel);

    const startEvents: Array<Event> = processModelFacade.getStartEvents()
                                                        .map(Converters.managementApiEventConverter);

    const eventList: EventList = {
      events: startEvents,
    };

    return eventList;
  }

  public async updateProcessDefinitionsByName(context: ManagementContext,
                                              name: string,
                                              payload: ProcessModelExecution.UpdateProcessDefinitionsRequestPayload,
                                            ): Promise<void> {

    const deploymentApiPayload: ImportProcessDefinitionsRequestPayload = {
      name: name,
      xml: payload.xml,
      overwriteExisting: payload.overwriteExisting,
    };

    const deploymentContext: DeploymentContext = new DeploymentContext();
    deploymentContext.identity = context.identity;

    return this.deploymentApiService.importBpmnFromXml(deploymentContext, deploymentApiPayload);
  }

  // UserTasks
  public async getUserTasksForProcessModel(context: ManagementContext, processModelId: string): Promise<UserTaskList> {

    return this.consumerApiService.getUserTasksForProcessModel(context, processModelId);
  }

  public async getUserTasksForCorrelation(context: ManagementContext, correlationId: string): Promise<UserTaskList> {

    return this.consumerApiService.getUserTasksForCorrelation(context, correlationId);
  }

  public async getUserTasksForProcessModelInCorrelation(context: ManagementContext,
                                                        processModelId: string,
                                                        correlationId: string): Promise<UserTaskList> {

    return this.consumerApiService.getUserTasksForProcessModelInCorrelation(context, processModelId, correlationId);
  }

  public async finishUserTask(context: ManagementContext,
                              processModelId: string,
                              correlationId: string,
                              userTaskId: string,
                              userTaskResult: UserTaskResult): Promise<void> {

    return this.consumerApiService.finishUserTask(context, processModelId, correlationId, userTaskId, userTaskResult);
  }

  public async getRuntimeInformationForProcessModel(context: ManagementContext, processModelId: string): Promise<Array<FlowNodeRuntimeInformation>> {
    const exectutionContext: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const identity: IIdentity = exectutionContext.getIdentity();

    return this.kpiApiService.getRuntimeInformationForProcessModel(identity, processModelId);
  }

  public async getRuntimeInformationForFlowNode(context: ManagementContext,
                                                processModelId: string,
                                                flowNodeId: string): Promise<FlowNodeRuntimeInformation> {
    const exectutionContext: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const identity: IIdentity = exectutionContext.getIdentity();

    return this.kpiApiService.getRuntimeInformationForFlowNode(identity, processModelId, flowNodeId);
  }

  public async getActiveTokensForProcessModel(context: ManagementContext, processModelId: string): Promise<Array<ActiveToken>> {
    const exectutionContext: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const identity: IIdentity = exectutionContext.getIdentity();

    return this.kpiApiService.getActiveTokensForProcessModel(identity, processModelId);
  }

  public async getActiveTokensForFlowNode(context: ManagementContext, flowNodeId: string): Promise<Array<ActiveToken>> {
    const exectutionContext: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const identity: IIdentity = exectutionContext.getIdentity();

    return this.kpiApiService.getActiveTokensForFlowNode(identity, flowNodeId);
  }

  public async getLogsForProcessModel(context: ManagementContext, correlationId: string, processModelId: string): Promise<Array<LogEntry>> {
    const exectutionContext: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const identity: IIdentity = exectutionContext.getIdentity();

    return this.loggingApiService.readLogForProcessModel(identity, correlationId, processModelId);
  }

  public async getTokensForFlowNodeInstance(context: ManagementContext,
                                            processModelId: string,
                                            correlationId: string,
                                            flowNodeId: string): Promise<Array<TokenHistoryEntry>> {
    const exectutionContext: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const identity: IIdentity = exectutionContext.getIdentity();

    return this.tokenHistoryApiService.getTokensForFlowNode(identity, correlationId, processModelId, flowNodeId);
  }

  private async _createExecutionContextFacadeFromManagementContext(managementContext: ManagementContext): Promise<IExecutionContextFacade> {
    const identity: IIdentity = {
      token: managementContext.identity,
    };
    const executionContext: ExecutionContext = new ExecutionContext(identity);

    return this.executionContextFacadeFactory.create(executionContext);
  }

  private async _getRawXmlForProcessModelById(executionContextFacade: IExecutionContextFacade, processModelId: string): Promise<string> {

    const processModelRaw: ProcessDefinitionRaw =
      await this.processModelService.getProcessDefinitionAsXmlByName(executionContextFacade, processModelId);

    return processModelRaw.xml;
  }

}
