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
  EventTriggerPayload,
  FlowNodeRuntimeInformation,
  IManagementApi,
  LogEntry,
  ManualTaskList,
  Messages,
  ProcessModelExecution,
  TokenHistoryEntry,
  UserTaskList,
  UserTaskResult,
} from '@process-engine/management_api_contracts';

import {
  ICorrelationService,
  IDeleteProcessModelService,
  IProcessModelFacade,
  IProcessModelFacadeFactory,
  IProcessModelService,
  Model,
  Runtime,
} from '@process-engine/process_engine_contracts';

import * as Converters from './converters/index';

import * as BluebirdPromise from 'bluebird';

export class ManagementApiService implements IManagementApi {
  public config: any = undefined;

  private readonly _consumerApiService: IConsumerApi;
  private readonly _correlationService: ICorrelationService;
  private readonly _deleteProcessModelService: IDeleteProcessModelService;
  private readonly _deploymentApiService: IDeploymentApi;
  private readonly _kpiApiService: IKpiApi;
  private readonly _loggingApiService: ILoggingApi;
  private readonly _processModelFacadeFactory: IProcessModelFacadeFactory;
  private readonly _processModelService: IProcessModelService;
  private readonly _tokenHistoryApiService: ITokenHistoryApi;

  constructor(consumerApiService: IConsumerApi,
              correlationService: ICorrelationService,
              deleteProcessModelService: IDeleteProcessModelService,
              deploymentApiService: IDeploymentApi,
              kpiApiService: IKpiApi,
              loggingApiService: ILoggingApi,
              processModelFacadeFactory: IProcessModelFacadeFactory,
              processModelService: IProcessModelService,
              tokenHistoryApiService: ITokenHistoryApi) {

    this._consumerApiService = consumerApiService;
    this._correlationService = correlationService;
    this._deleteProcessModelService = deleteProcessModelService;
    this._deploymentApiService = deploymentApiService;
    this._kpiApiService = kpiApiService;
    this._loggingApiService = loggingApiService;
    this._processModelFacadeFactory = processModelFacadeFactory;
    this._processModelService = processModelService;
    this._tokenHistoryApiService = tokenHistoryApiService;
  }

  // Notifications
  public onUserTaskWaiting(identity: IIdentity, callback: Messages.CallbackTypes.OnUserTaskWaitingCallback): void {
    this._consumerApiService.onUserTaskWaiting(identity, callback);
  }

  public onUserTaskFinished(identity: IIdentity, callback: Messages.CallbackTypes.OnUserTaskFinishedCallback): void {
    this._consumerApiService.onUserTaskFinished(identity, callback);
  }

  public onManualTaskWaiting(identity: IIdentity, callback: Messages.CallbackTypes.OnManualTaskWaitingCallback): void {
    this._consumerApiService.onManualTaskWaiting(identity, callback);
  }

  public onManualTaskFinished(identity: IIdentity, callback: Messages.CallbackTypes.OnManualTaskFinishedCallback): void {
    this._consumerApiService.onManualTaskFinished(identity, callback);
  }

  public onProcessTerminated(identity: IIdentity, callback: Messages.CallbackTypes.OnProcessTerminatedCallback): void {
    this._consumerApiService.onProcessTerminated(identity, callback);
  }

  public onProcessEnded(identity: IIdentity, callback: Messages.CallbackTypes.OnProcessEndedCallback): void {
    this._consumerApiService.onProcessEnded(identity, callback);
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

  public async getStartEventsForProcessModel(identity: IIdentity, processModelId: string): Promise<EventList> {

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

  public async deleteProcessDefinitionsByProcessModelId(identity: IIdentity, processModelId: string): Promise<void> {
    this._deleteProcessModelService.deleteProcessModel(identity, processModelId);
  }

  // Events
  public async getWaitingEventsForProcessModel(identity: IIdentity, processModelId: string): Promise<EventList> {

    return this._consumerApiService.getEventsForProcessModel(identity, processModelId);
  }

  public async getWaitingEventsForCorrelation(identity: IIdentity, correlationId: string): Promise<EventList> {

    return this._consumerApiService.getEventsForCorrelation(identity, correlationId);
  }

  public async getWaitingEventsForProcessModelInCorrelation(identity: IIdentity, processModelId: string, correlationId: string): Promise<EventList> {

    return this._consumerApiService.getEventsForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async triggerMessageEvent(identity: IIdentity, messageName: string, payload?: EventTriggerPayload): Promise<void> {

    return this._consumerApiService.triggerMessageEvent(identity, messageName, payload);
  }

  public async triggerSignalEvent(identity: IIdentity, signalName: string, payload?: EventTriggerPayload): Promise<void> {

    return this._consumerApiService.triggerSignalEvent(identity, signalName, payload);
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
                              processInstanceId: string,
                              correlationId: string,
                              userTaskInstanceId: string,
                              userTaskResult: UserTaskResult): Promise<void> {

    return this._consumerApiService.finishUserTask(identity, processInstanceId, correlationId, userTaskInstanceId, userTaskResult);
  }

  // ManualTasks
  public async getManualTasksForProcessModel(identity: IIdentity, processModelId: string): Promise<ManualTaskList> {

    return this._consumerApiService.getManualTasksForProcessModel(identity, processModelId);
  }

  public async getManualTasksForCorrelation(identity: IIdentity, correlationId: string): Promise<ManualTaskList> {

    return this._consumerApiService.getManualTasksForCorrelation(identity, correlationId);
  }

  public async getManualTasksForProcessModelInCorrelation(identity: IIdentity,
                                                          processModelId: string,
                                                          correlationId: string): Promise<ManualTaskList> {

    return this._consumerApiService.getManualTasksForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async finishManualTask(identity: IIdentity,
                                processModelId: string,
                                correlationId: string,
                                manualTaskId: string): Promise<void> {

    return this._consumerApiService.finishManualTask(identity, processModelId, correlationId, manualTaskId);
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

  public async getProcessModelLog(identity: IIdentity, processModelId: string, correlationId?: string): Promise<Array<LogEntry>> {

    let logs: Array<LogEntry> = await this._loggingApiService.readLogForProcessModel(identity, processModelId);

    if (correlationId) {
      logs = logs.filter((entry: LogEntry): boolean => {
        return entry.correlationId === correlationId;
      });
    }

    return logs;
  }

  public async getTokensForFlowNodeInstance(identity: IIdentity,
                                            correlationId: string,
                                            processModelId: string,
                                            flowNodeId: string): Promise<Array<TokenHistoryEntry>> {

    return this._tokenHistoryApiService.getTokensForFlowNode(identity, correlationId, processModelId, flowNodeId);
  }

  private async _getRawXmlForProcessModelById(identity: IIdentity, processModelId: string): Promise<string> {

    const processModelRaw: Runtime.Types.ProcessDefinitionFromRepository =
      await this._processModelService.getProcessDefinitionAsXmlByName(identity, processModelId);

    return processModelRaw.xml;
  }

}
