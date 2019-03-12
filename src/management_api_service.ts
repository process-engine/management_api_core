// tslint:disable:max-file-line-count
import {IEventAggregator, Subscription} from '@essential-projects/event_aggregator_contracts';
import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

import {IKpiApi} from '@process-engine/kpi_api_contracts';
import {ILoggingApi} from '@process-engine/logging_api_contracts';
import {ITokenHistoryApi} from '@process-engine/token_history_api_contracts';

import {DataModels as ConsumerApiTypes, IConsumerApi} from '@process-engine/consumer_api_contracts';
import {Correlation, ICorrelationService} from '@process-engine/correlation.contracts';
import {IDeploymentApi, ImportProcessDefinitionsRequestPayload} from '@process-engine/deployment_api_contracts';
import {DataModels, IManagementApi, Messages} from '@process-engine/management_api_contracts';
import {IProcessModelFacade, IProcessModelFacadeFactory} from '@process-engine/process_engine_contracts';
import {IProcessModelUseCases, Model, ProcessDefinitionFromRepository} from '@process-engine/process_model.contracts';

import * as Converters from './converters/index';

export class ManagementApiService implements IManagementApi {
  public config: any = undefined;

  private readonly _consumerApiService: IConsumerApi;
  private readonly _correlationService: ICorrelationService;
  private readonly _deploymentApiService: IDeploymentApi;
  private readonly _eventAggregator: IEventAggregator;
  private readonly _iamService: IIAMService;
  private readonly _kpiApiService: IKpiApi;
  private readonly _loggingApiService: ILoggingApi;
  private readonly _processModelFacadeFactory: IProcessModelFacadeFactory;
  private readonly _processModelUseCases: IProcessModelUseCases;
  private readonly _tokenHistoryApiService: ITokenHistoryApi;

  constructor(
    consumerApiService: IConsumerApi,
    correlationService: ICorrelationService,
    deploymentApiService: IDeploymentApi,
    eventAggregator: IEventAggregator,
    iamService: IIAMService,
    kpiApiService: IKpiApi,
    loggingApiService: ILoggingApi,
    processModelFacadeFactory: IProcessModelFacadeFactory,
    processModelUseCases: IProcessModelUseCases,
    tokenHistoryApiService: ITokenHistoryApi,
  ) {
    this._consumerApiService = consumerApiService;
    this._correlationService = correlationService;
    this._deploymentApiService = deploymentApiService;
    this._eventAggregator = eventAggregator;
    this._iamService = iamService;
    this._kpiApiService = kpiApiService;
    this._loggingApiService = loggingApiService;
    this._processModelFacadeFactory = processModelFacadeFactory;
    this._processModelUseCases = processModelUseCases;
    this._tokenHistoryApiService = tokenHistoryApiService;
  }

  // Notifications
  public async onEmptyActivityWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnEmptyActivityWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onEmptyActivityWaiting(identity, callback, subscribeOnce);
  }

  public async onEmptyActivityFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnEmptyActivityFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onEmptyActivityFinished(identity, callback, subscribeOnce);
  }

  public async onEmptyActivityForIdentityWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnEmptyActivityWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onEmptyActivityForIdentityWaiting(identity, callback, subscribeOnce);
  }

  public async onEmptyActivityForIdentityFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnEmptyActivityFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onEmptyActivityForIdentityFinished(identity, callback, subscribeOnce);
  }

  public async onUserTaskWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnUserTaskWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onUserTaskWaiting(identity, callback, subscribeOnce);
  }

  public async onUserTaskFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnUserTaskFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onUserTaskFinished(identity, callback, subscribeOnce);
  }

  public async onUserTaskForIdentityWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnUserTaskWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onUserTaskForIdentityWaiting(identity, callback, subscribeOnce);
  }

  public async onUserTaskForIdentityFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnUserTaskFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onUserTaskForIdentityFinished(identity, callback, subscribeOnce);
  }

  public async onManualTaskWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnManualTaskWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onManualTaskWaiting(identity, callback, subscribeOnce);
  }

  public async onManualTaskFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnManualTaskFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onManualTaskFinished(identity, callback, subscribeOnce);
  }

  public async onManualTaskForIdentityWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnManualTaskWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onManualTaskForIdentityWaiting(identity, callback, subscribeOnce);
  }

  public async onManualTaskForIdentityFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnManualTaskFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onManualTaskForIdentityFinished(identity, callback, subscribeOnce);
  }

  public async onProcessStarted(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessEndedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onProcessStarted(identity, callback, subscribeOnce);
  }

  public async onProcessWithProcessModelIdStarted(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessEndedCallback,
    processModelId: string,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onProcessWithProcessModelIdStarted(identity, callback, processModelId, subscribeOnce);
  }

  public async onProcessTerminated(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessTerminatedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onProcessTerminated(identity, callback, subscribeOnce);
  }

  public async onProcessEnded(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessEndedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this._consumerApiService.onProcessEnded(identity, callback, subscribeOnce);
  }

  public async removeSubscription(identity: IIdentity, subscription: Subscription): Promise<void> {
    return this._consumerApiService.removeSubscription(identity, subscription);
  }

  // Correlations
  public async getAllCorrelations(identity: IIdentity): Promise<Array<DataModels.Correlations.Correlation>> {

    const correlations: Array<Correlation> = await this._correlationService.getAll(identity);

    const managementApiCorrelations: Array<DataModels.Correlations.Correlation> = correlations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  public async getActiveCorrelations(identity: IIdentity): Promise<Array<DataModels.Correlations.Correlation>> {

    const activeCorrelations: Array<Correlation> = await this._correlationService.getActive(identity);

    const managementApiCorrelations: Array<DataModels.Correlations.Correlation> =
      activeCorrelations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  public async getCorrelationById(identity: IIdentity  , correlationId: string): Promise<DataModels.Correlations.Correlation> {

    const correlationFromProcessEngine: Correlation = await this._correlationService.getByCorrelationId(identity, correlationId);

    const managementApiCorrelation: DataModels.Correlations.Correlation = Converters.managementApiCorrelationConverter(correlationFromProcessEngine);

    return managementApiCorrelation;
  }

  public async getCorrelationsByProcessModelId(identity: IIdentity, processModelId: string): Promise<Array<DataModels.Correlations.Correlation>> {

    const correlations: Array<Correlation> = await this._correlationService.getByProcessModelId(identity, processModelId);

    const managementApiCorrelations: Array<DataModels.Correlations.Correlation> = correlations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  public async getCorrelationByProcessInstanceId(identity: IIdentity, processInstanceId: string): Promise<DataModels.Correlations.Correlation> {

    const correlation: Correlation = await this._correlationService.getByProcessInstanceId(identity, processInstanceId);

    const managementApiCorrelation: DataModels.Correlations.Correlation = Converters.managementApiCorrelationConverter(correlation);

    return managementApiCorrelation;
  }

  // Process models
  public async getProcessModels(identity: IIdentity): Promise<DataModels.ProcessModels.ProcessModelList> {

    const consumerApiProcessModels: ConsumerApiTypes.ProcessModels.ProcessModelList = await this._consumerApiService.getProcessModels(identity);

    const managementApiProcessModels: Array<DataModels.ProcessModels.ProcessModel> =
      await Promise.map(consumerApiProcessModels.processModels, async(processModel: ConsumerApiTypes.ProcessModels.ProcessModel) => {
        const processModelRaw: string = await this._getRawXmlForProcessModelById(identity, processModel.id);

        return Converters.convertProcessModel(processModel, processModelRaw);
      });

    return <DataModels.ProcessModels.ProcessModelList> {
      processModels: managementApiProcessModels,
    };
  }

  public async getProcessModelById(identity: IIdentity, processModelId: string): Promise<DataModels.ProcessModels.ProcessModel> {

    const consumerApiProcessModel: ConsumerApiTypes.ProcessModels.ProcessModel =
      await this._consumerApiService.getProcessModelById(identity, processModelId);

    const processModelRaw: string = await this._getRawXmlForProcessModelById(identity, consumerApiProcessModel.id);

    const managementApiProcessModel: DataModels.ProcessModels.ProcessModel = Converters.convertProcessModel(consumerApiProcessModel, processModelRaw);

    return managementApiProcessModel;
  }

  public async getProcessModelByProcessInstanceId(identity: IIdentity, processInstanceId: string): Promise<DataModels.ProcessModels.ProcessModel> {

    const consumerApiProcessModel: ConsumerApiTypes.ProcessModels.ProcessModel =
      await this._consumerApiService.getProcessModelByProcessInstanceId(identity, processInstanceId);

    const processModelRaw: string = await this._getRawXmlForProcessModelById(identity, consumerApiProcessModel.id);

    const managementApiProcessModel: DataModels.ProcessModels.ProcessModel = Converters.convertProcessModel(consumerApiProcessModel, processModelRaw);

    return managementApiProcessModel;
  }

  public async getStartEventsForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.Events.EventList> {

    const processModel: Model.Process = await this._processModelUseCases.getProcessModelById(identity, processModelId);
    const processModelFacade: IProcessModelFacade = this._processModelFacadeFactory.create(processModel);

    const startEvents: Array<DataModels.Events.Event> = processModelFacade.getStartEvents()
                                                        .map(Converters.managementApiEventConverter);

    const eventList: DataModels.Events.EventList = {
      events: startEvents,
    };

    return eventList;
  }

  public async startProcessInstance(
    identity: IIdentity,
    processModelId: string,
    payload: DataModels.ProcessModels.ProcessStartRequestPayload,
    startCallbackType: DataModels.ProcessModels.StartCallbackType =
    DataModels.ProcessModels.StartCallbackType.CallbackOnProcessInstanceCreated,
    startEventId?: string,
    endEventId?: string,
  ): Promise<DataModels.ProcessModels.ProcessStartResponsePayload> {
    return this._consumerApiService.startProcessInstance(identity, processModelId, payload, startCallbackType, startEventId, endEventId);
  }

  public async updateProcessDefinitionsByName(
    identity: IIdentity,
    name: string,
    payload: DataModels.ProcessModels.UpdateProcessDefinitionsRequestPayload,
  ): Promise<void> {

    const deploymentApiPayload: ImportProcessDefinitionsRequestPayload = {
      name: name,
      xml: payload.xml,
      overwriteExisting: payload.overwriteExisting,
    };

    return this._deploymentApiService.importBpmnFromXml(identity, deploymentApiPayload);
  }

  public async deleteProcessDefinitionsByProcessModelId(identity: IIdentity, processModelId: string): Promise<void> {
    return this._processModelUseCases.deleteProcessModel(identity, processModelId);
  }

  // Events
  public async getWaitingEventsForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.Events.EventList> {
    return this._consumerApiService.getEventsForProcessModel(identity, processModelId);
  }

  public async getWaitingEventsForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.Events.EventList> {
    return this._consumerApiService.getEventsForCorrelation(identity, correlationId);
  }

  public async getWaitingEventsForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.Events.EventList> {

    return this._consumerApiService.getEventsForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async triggerMessageEvent(identity: IIdentity, messageName: string, payload?: DataModels.Events.EventTriggerPayload): Promise<void> {
    return this._consumerApiService.triggerMessageEvent(identity, messageName, payload);
  }

  public async triggerSignalEvent(identity: IIdentity, signalName: string, payload?: DataModels.Events.EventTriggerPayload): Promise<void> {
    return this._consumerApiService.triggerSignalEvent(identity, signalName, payload);
  }

  // EmptyActivities
  public async getEmptyActivitiesForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.EmptyActivities.EmptyActivityList> {
    return this._consumerApiService.getEmptyActivitiesForProcessModel(identity, processModelId);
  }

  public async getEmptyActivitiesForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<DataModels.EmptyActivities.EmptyActivityList> {
    return this._consumerApiService.getEmptyActivitiesForProcessInstance(identity, processInstanceId);
  }

  public async getEmptyActivitiesForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.EmptyActivities.EmptyActivityList> {
    return this._consumerApiService.getEmptyActivitiesForCorrelation(identity, correlationId);
  }

  public async getEmptyActivitiesForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.EmptyActivities.EmptyActivityList> {
    return this._consumerApiService.getEmptyActivitiesForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async getWaitingEmptyActivitiesByIdentity(identity: IIdentity): Promise<DataModels.EmptyActivities.EmptyActivityList> {
    return this._consumerApiService.getWaitingEmptyActivitiesByIdentity(identity);
  }

  public async finishEmptyActivity(
    identity: IIdentity,
    processInstanceId: string,
    correlationId: string,
    emptyActivityInstanceId: string,
  ): Promise<void> {
    return this._consumerApiService.finishEmptyActivity(identity, processInstanceId, correlationId, emptyActivityInstanceId);
  }

  // UserTasks
  public async getUserTasksForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.UserTasks.UserTaskList> {
    return this._consumerApiService.getUserTasksForProcessModel(identity, processModelId);
  }

  public async getUserTasksForProcessInstance(identity: IIdentity, processInstanceId: string): Promise<DataModels.UserTasks.UserTaskList> {
    return this._consumerApiService.getUserTasksForProcessInstance(identity, processInstanceId);
  }

  public async getUserTasksForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.UserTasks.UserTaskList> {
    return this._consumerApiService.getUserTasksForCorrelation(identity, correlationId);
  }

  public async getUserTasksForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.UserTasks.UserTaskList> {
    return this._consumerApiService.getUserTasksForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async finishUserTask(
    identity: IIdentity,
    processInstanceId: string,
    correlationId: string,
    userTaskInstanceId: string,
    userTaskResult: DataModels.UserTasks.UserTaskResult,
  ): Promise<void> {
    return this._consumerApiService.finishUserTask(identity, processInstanceId, correlationId, userTaskInstanceId, userTaskResult);
  }

  // ManualTasks
  public async getManualTasksForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.ManualTasks.ManualTaskList> {
    return this._consumerApiService.getManualTasksForProcessModel(identity, processModelId);
  }

  public async getManualTasksForProcessInstance(identity: IIdentity, processInstanceId: string): Promise<DataModels.ManualTasks.ManualTaskList> {
    return this._consumerApiService.getManualTasksForProcessInstance(identity, processInstanceId);
  }

  public async getManualTasksForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.ManualTasks.ManualTaskList> {
    return this._consumerApiService.getManualTasksForCorrelation(identity, correlationId);
  }

  public async getManualTasksForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.ManualTasks.ManualTaskList> {
    return this._consumerApiService.getManualTasksForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async finishManualTask(
    identity: IIdentity,
    processInstanceId: string,
    correlationId: string,
    manualTaskInstanceId: string,
  ): Promise<void> {
    return this._consumerApiService.finishManualTask(identity, processInstanceId, correlationId, manualTaskInstanceId);
  }

  public async getRuntimeInformationForProcessModel(
    identity: IIdentity,
    processModelId: string,
  ): Promise<Array<DataModels.Kpi.FlowNodeRuntimeInformation>> {

    return this._kpiApiService.getRuntimeInformationForProcessModel(identity, processModelId);
  }

  public async getRuntimeInformationForFlowNode(
    identity: IIdentity,
    processModelId: string,
    flowNodeId: string,
  ): Promise<DataModels.Kpi.FlowNodeRuntimeInformation> {
    return this._kpiApiService.getRuntimeInformationForFlowNode(identity, processModelId, flowNodeId);
  }

  public async getActiveTokensForProcessModel(identity: IIdentity, processModelId: string): Promise<Array<DataModels.Kpi.ActiveToken>> {
    return this._kpiApiService.getActiveTokensForProcessModel(identity, processModelId);
  }

  public async getActiveTokensForCorrelationAndProcessModel(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
  ): Promise<Array<DataModels.Kpi.ActiveToken>> {
    return this._kpiApiService.getActiveTokensForCorrelationAndProcessModel(identity, correlationId, processModelId);
  }

  public async getActiveTokensForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<Array<DataModels.Kpi.ActiveToken>> {
    return this._kpiApiService.getActiveTokensForProcessInstance(identity, processInstanceId);
  }

  public async getActiveTokensForFlowNode(identity: IIdentity, flowNodeId: string): Promise<Array<DataModels.Kpi.ActiveToken>> {
    return this._kpiApiService.getActiveTokensForFlowNode(identity, flowNodeId);
  }

  public async getProcessModelLog(identity: IIdentity, processModelId: string, correlationId?: string): Promise<Array<DataModels.Logging.LogEntry>> {

    let logs: Array<DataModels.Logging.LogEntry> = await this._loggingApiService.readLogForProcessModel(identity, processModelId);

    if (correlationId) {
      logs = logs.filter((entry: DataModels.Logging.LogEntry): boolean => {
        return entry.correlationId === correlationId;
      });
    }

    return logs;
  }

  public async getTokensForFlowNodeInstance(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
    flowNodeId: string,
  ): Promise<Array<DataModels.TokenHistory.TokenHistoryEntry>> {
    return this._tokenHistoryApiService.getTokensForFlowNode(identity, correlationId, processModelId, flowNodeId);
  }

  public async getTokensForCorrelationAndProcessModel(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
  ): Promise<DataModels.TokenHistory.TokenHistoryGroup> {
    return this._tokenHistoryApiService.getTokensForCorrelationAndProcessModel(identity, correlationId, processModelId);
  }

  public async getTokensForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<DataModels.TokenHistory.TokenHistoryGroup> {
    return this._tokenHistoryApiService.getTokensForProcessInstance(identity, processInstanceId);
  }

  public async terminateProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<void> {
    await this._iamService.ensureHasClaim(identity, 'can_terminate_process');

    const terminateEvent: string = Messages.EventAggregatorSettings.messagePaths.terminateProcessInstance
      .replace(Messages.EventAggregatorSettings.messageParams.processInstanceId, processInstanceId);

    this._eventAggregator.publish(terminateEvent);
  }

  private async _getRawXmlForProcessModelById(identity: IIdentity, processModelId: string): Promise<string> {
    const processModelRaw: ProcessDefinitionFromRepository =
      await this._processModelUseCases.getProcessDefinitionAsXmlByName(identity, processModelId);

    return processModelRaw.xml;
  }
}
