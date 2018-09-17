import {IIdentity} from '@essential-projects/iam_contracts';

import {IKpiApi} from '@process-engine/kpi_api_contracts';
import {ILoggingApi} from '@process-engine/logging_api_contracts';
import {ITokenHistoryApi} from '@process-engine/token_history_api_contracts';

import {
  IConsumerApi,
  ProcessModel as ConsumerApiProcessModel,
  ProcessModelList as ConsumerApiProcessModelList,
} from '@process-engine/consumer_api_contracts';

import {IDeploymentApi, ImportProcessDefinitionsRequestPayload} from '@process-engine/deployment_api_contracts';

import {
  ActiveToken,
  Correlation,
  Event,
  EventList,
  FlowNodeRuntimeInformation,
  IManagementApi,
  LogEntry,
  ProcessModelExecution,
  TokenHistoryEntry,
  UserTaskList,
  UserTaskResult,
} from '@process-engine/management_api_contracts';

import {
  ICorrelationService,
  IProcessModelFacade,
  IProcessModelFacadeFactory,
  IProcessModelService,
  ProcessEndedMessage,
  UserTaskFinishedMessage,
  UserTaskWaitingMessage,
  Model,
  Runtime,
} from '@process-engine/process_engine_contracts';

import * as Converters from './converters/index';

import * as BluebirdPromise from 'bluebird';

export class ManagementApiService implements IManagementApi {
  public config: any = undefined;

  private readonly _consumerApiService: IConsumerApi;
  private readonly _correlationService: ICorrelationService;
  private readonly _deploymentApiService: IDeploymentApi;
  private readonly _kpiApiService: IKpiApi;
  private readonly _loggingApiService: ILoggingApi;
  private readonly _processModelFacadeFactory: IProcessModelFacadeFactory;
  private readonly _processModelService: IProcessModelService;
  private readonly _tokenHistoryApiService: ITokenHistoryApi;

  constructor(consumerApiService: IConsumerApi,
              correlationService: ICorrelationService,
              deploymentApiService: IDeploymentApi,
              kpiApiService: IKpiApi,
              loggingApiService: ILoggingApi,
              processModelFacadeFactory: IProcessModelFacadeFactory,
              processModelService: IProcessModelService,
              tokenHistoryApiService: ITokenHistoryApi) {

    this._consumerApiService = consumerApiService;
    this._correlationService = correlationService;
    this._deploymentApiService = deploymentApiService;
    this._kpiApiService = kpiApiService;
    this._loggingApiService = loggingApiService;
    this._processModelFacadeFactory = processModelFacadeFactory;
    this._processModelService = processModelService;
    this._tokenHistoryApiService = tokenHistoryApiService;
  }

  // Correlations
  public async getAllCorrelations(identity: IIdentity): Promise<Array<Correlation>> {

    const correlations: Array<Runtime.Types.Correlation> = await this._correlationService.getAll();

    const managementApiCorrelations: Array<Correlation> = correlations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  public async getActiveCorrelations(identity: IIdentity): Promise<Array<Correlation>> {

    const activeCorrelations: Array<Runtime.Types.Correlation> = await this._correlationService.getActive();

    const managementApiCorrelations: Array<Correlation> = activeCorrelations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  public async getCorrelationById(identity: IIdentity, correlationId: string): Promise<Correlation> {

    const correlationFromProcessEngine: Runtime.Types.Correlation = await this._correlationService.getByCorrelationId(correlationId);

    const managementApiCorrelation: Correlation = Converters.managementApiCorrelationConverter(correlationFromProcessEngine);

    return managementApiCorrelation;
  }

  public async getCorrelationsByProcessModelId(identity: IIdentity, processModelId: string): Promise<Array<Correlation>> {

    const correlations: Array<Runtime.Types.Correlation> = await this._correlationService.getByProcessModelId(processModelId);

    const managementApiCorrelations: Array<Correlation> = correlations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  public async getCorrelationByProcessInstanceId(identity: IIdentity, processInstanceId: string): Promise<Correlation> {

    const correlation: Runtime.Types.Correlation = await this._correlationService.getByProcessInstanceId(processInstanceId);

    const managementApiCorrelation: Correlation = Converters.managementApiCorrelationConverter(correlation);

    return managementApiCorrelation;
  }

  // Process models
  public async getProcessModels(identity: IIdentity): Promise<ProcessModelExecution.ProcessModelList> {

    const consumerApiProcessModels: ConsumerApiProcessModelList = await this._consumerApiService.getProcessModels(identity);

    const managementApiProcessModels: Array<ProcessModelExecution.ProcessModel> =
      await BluebirdPromise.map(consumerApiProcessModels.processModels, async(processModel: ConsumerApiProcessModel) => {
        const processModelRaw: string = await this._getRawXmlForProcessModelById(identity, processModel.id);

        return Converters.convertProcessModel(processModel, processModelRaw);
      });

    return <ProcessModelExecution.ProcessModelList> {
      processModels: managementApiProcessModels,
    };
  }

  public async getProcessModelById(identity: IIdentity, processModelId: string): Promise<ProcessModelExecution.ProcessModel> {

    const consumerApiProcessModel: ConsumerApiProcessModel = await this._consumerApiService.getProcessModelById(identity, processModelId);
    const processModelRaw: string = await this._getRawXmlForProcessModelById(identity, consumerApiProcessModel.id);

    const managementApiProcessModel: ProcessModelExecution.ProcessModel = Converters.convertProcessModel(consumerApiProcessModel, processModelRaw);

    return managementApiProcessModel;
  }

  public async getEventsForProcessModel(identity: IIdentity, processModelId: string): Promise<EventList> {

    const processModel: Model.Types.Process = await this._processModelService.getProcessModelById(identity, processModelId);
    const processModelFacade: IProcessModelFacade = this._processModelFacadeFactory.create(processModel);

    const startEvents: Array<Event> = processModelFacade.getStartEvents()
                                                        .map(Converters.managementApiEventConverter);

    const eventList: EventList = {
      events: startEvents,
    };

    return eventList;
  }

  public async startProcessInstance(identity: IIdentity,
                                    processModelId: string,
                                    startEventId: string,
                                    payload: ProcessModelExecution.ProcessStartRequestPayload,
                                    startCallbackType: ProcessModelExecution.StartCallbackType =
                                    ProcessModelExecution.StartCallbackType.CallbackOnProcessInstanceCreated,
                                    endEventId?: string,
                                  ): Promise<ProcessModelExecution.ProcessStartResponsePayload> {

    return this._consumerApiService.startProcessInstance(identity, processModelId, startEventId, payload, startCallbackType, endEventId);
  }

  public async updateProcessDefinitionsByName(identity: IIdentity,
                                              name: string,
                                              payload: ProcessModelExecution.UpdateProcessDefinitionsRequestPayload,
                                            ): Promise<void> {

    const deploymentApiPayload: ImportProcessDefinitionsRequestPayload = {
      name: name,
      xml: payload.xml,
      overwriteExisting: payload.overwriteExisting,
    };

    return this._deploymentApiService.importBpmnFromXml(identity, deploymentApiPayload);
  }

  // UserTasks
  public async getUserTasksForProcessModel(identity: IIdentity, processModelId: string): Promise<UserTaskList> {

    return this._consumerApiService.getUserTasksForProcessModel(identity, processModelId);
  }

  public async getUserTasksForCorrelation(identity: IIdentity, correlationId: string): Promise<UserTaskList> {

    return this._consumerApiService.getUserTasksForCorrelation(identity, correlationId);
  }

  public async getUserTasksForProcessModelInCorrelation(identity: IIdentity,
                                                        processModelId: string,
                                                        correlationId: string): Promise<UserTaskList> {

    return this._consumerApiService.getUserTasksForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async finishUserTask(identity: IIdentity,
                              processModelId: string,
                              correlationId: string,
                              userTaskId: string,
                              userTaskResult: UserTaskResult): Promise<void> {

    return this._consumerApiService.finishUserTask(identity, processModelId, correlationId, userTaskId, userTaskResult);
  }

  public async getRuntimeInformationForProcessModel(identity: IIdentity, processModelId: string): Promise<Array<FlowNodeRuntimeInformation>> {

    return this._kpiApiService.getRuntimeInformationForProcessModel(identity, processModelId);
  }

  public async getRuntimeInformationForFlowNode(identity: IIdentity,
                                                processModelId: string,
                                                flowNodeId: string): Promise<FlowNodeRuntimeInformation> {

    return this._kpiApiService.getRuntimeInformationForFlowNode(identity, processModelId, flowNodeId);
  }

  public async getActiveTokensForProcessModel(identity: IIdentity, processModelId: string): Promise<Array<ActiveToken>> {

    return this._kpiApiService.getActiveTokensForProcessModel(identity, processModelId);
  }

  public async getActiveTokensForFlowNode(identity: IIdentity, flowNodeId: string): Promise<Array<ActiveToken>> {

    return this._kpiApiService.getActiveTokensForFlowNode(identity, flowNodeId);
  }

  public async getProcessModelLog(identity: IIdentity, processModelId: string): Promise<Array<LogEntry>> {

    return this._loggingApiService.readLogForProcessModel(identity, processModelId);
  }

  public async getTokensForFlowNodeInstance(identity: IIdentity,
                                            processModelId: string,
                                            correlationId: string,
                                            flowNodeId: string): Promise<Array<TokenHistoryEntry>> {

    return this._tokenHistoryApiService.getTokensForFlowNode(identity, correlationId, processModelId, flowNodeId);
  }

  private async _getRawXmlForProcessModelById(identity: IIdentity, processModelId: string): Promise<string> {

    const processModelRaw: Runtime.Types.ProcessDefinitionFromRepository =
      await this._processModelService.getProcessDefinitionAsXmlByName(identity, processModelId);

    return processModelRaw.xml;
  }

  public onUserTaskWaiting(callback: (userTaskWaiting: UserTaskWaitingMessage) => void|Promise<void>): void {
    this.consumerApiService.onUserTaskWaiting(callback);
  }

  public onUserTaskFinished(callback: (userTaskFinished: UserTaskFinishedMessage) => void|Promise<void>): void {
    this.consumerApiService.onUserTaskFinished(callback);
  }

  public onProcessTerminated(callback: (processTerminated: ProcessEndedMessage) => void|Promise<void>): void {
    this.consumerApiService.onProcessTerminated(callback);
  }

  public onProcessEnded(callback: (processEnded: ProcessEndedMessage) => void|Promise<void>): void {
    this.consumerApiService.onProcessEnded(callback);
  }

}
