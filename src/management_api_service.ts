import {IEventAggregator, Subscription} from '@essential-projects/event_aggregator_contracts';
import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

import {IKpiApi} from '@process-engine/kpi_api_contracts';
import {ILoggingApi} from '@process-engine/logging_api_contracts';
import {ITokenHistoryApi} from '@process-engine/token_history_api_contracts';

import {DataModels as ConsumerApiTypes, IConsumerApi} from '@process-engine/consumer_api_contracts';
import {ICorrelationService} from '@process-engine/correlation.contracts';
import {IDeploymentApi} from '@process-engine/deployment_api_contracts';
import {DataModels, IManagementApi, Messages} from '@process-engine/management_api_contracts';
import {IProcessModelFacadeFactory} from '@process-engine/process_engine_contracts';
import {IProcessModelUseCases} from '@process-engine/process_model.contracts';
import {FlowNodeInstance, IFlowNodeInstanceService} from '@process-engine/flow_node_instance.contracts';

import * as Converters from './converters/index';

export class ManagementApiService implements IManagementApi {

  private readonly consumerApiService: IConsumerApi;
  private readonly correlationService: ICorrelationService;
  private readonly deploymentApiService: IDeploymentApi;
  private readonly eventAggregator: IEventAggregator;
  private readonly flowNodeInstanceService: IFlowNodeInstanceService;
  private readonly iamService: IIAMService;
  private readonly kpiApiService: IKpiApi;
  private readonly loggingApiService: ILoggingApi;
  private readonly processModelFacadeFactory: IProcessModelFacadeFactory;
  private readonly processModelUseCases: IProcessModelUseCases;
  private readonly tokenHistoryApiService: ITokenHistoryApi;

  constructor(
    consumerApiService: IConsumerApi,
    correlationService: ICorrelationService,
    deploymentApiService: IDeploymentApi,
    eventAggregator: IEventAggregator,
    flowNodeInstanceService: IFlowNodeInstanceService,
    iamService: IIAMService,
    kpiApiService: IKpiApi,
    loggingApiService: ILoggingApi,
    processModelFacadeFactory: IProcessModelFacadeFactory,
    processModelUseCases: IProcessModelUseCases,
    tokenHistoryApiService: ITokenHistoryApi,
  ) {
    this.consumerApiService = consumerApiService;
    this.correlationService = correlationService;
    this.deploymentApiService = deploymentApiService;
    this.eventAggregator = eventAggregator;
    this.flowNodeInstanceService = flowNodeInstanceService;
    this.iamService = iamService;
    this.kpiApiService = kpiApiService;
    this.loggingApiService = loggingApiService;
    this.processModelFacadeFactory = processModelFacadeFactory;
    this.processModelUseCases = processModelUseCases;
    this.tokenHistoryApiService = tokenHistoryApiService;
  }

  // Notifications
  public async onEmptyActivityWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnEmptyActivityWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onEmptyActivityWaiting(identity, callback, subscribeOnce);
  }

  public async onEmptyActivityFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnEmptyActivityFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onEmptyActivityFinished(identity, callback, subscribeOnce);
  }

  public async onEmptyActivityForIdentityWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnEmptyActivityWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onEmptyActivityForIdentityWaiting(identity, callback, subscribeOnce);
  }

  public async onEmptyActivityForIdentityFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnEmptyActivityFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onEmptyActivityForIdentityFinished(identity, callback, subscribeOnce);
  }

  public async onUserTaskWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnUserTaskWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onUserTaskWaiting(identity, callback, subscribeOnce);
  }

  public async onUserTaskFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnUserTaskFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onUserTaskFinished(identity, callback, subscribeOnce);
  }

  public async onUserTaskForIdentityWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnUserTaskWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onUserTaskForIdentityWaiting(identity, callback, subscribeOnce);
  }

  public async onUserTaskForIdentityFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnUserTaskFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onUserTaskForIdentityFinished(identity, callback, subscribeOnce);
  }

  public async onBoundaryEventTriggered(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnBoundaryEventTriggeredCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onBoundaryEventTriggered(identity, callback, subscribeOnce);
  }

  public async onIntermediateThrowEventTriggered(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnIntermediateThrowEventTriggeredCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onIntermediateThrowEventTriggered(identity, callback, subscribeOnce);
  }

  public async onIntermediateCatchEventReached(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnIntermediateCatchEventReachedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onIntermediateCatchEventReached(identity, callback, subscribeOnce);
  }

  public async onIntermediateCatchEventFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnIntermediateCatchEventFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onIntermediateCatchEventFinished(identity, callback, subscribeOnce);
  }

  public async onCallActivityWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnCallActivityWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onCallActivityWaiting(identity, callback, subscribeOnce);
  }

  public async onCallActivityFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnCallActivityFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onCallActivityFinished(identity, callback, subscribeOnce);
  }

  public async onManualTaskWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnManualTaskWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onManualTaskWaiting(identity, callback, subscribeOnce);
  }

  public async onManualTaskFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnManualTaskFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onManualTaskFinished(identity, callback, subscribeOnce);
  }

  public async onManualTaskForIdentityWaiting(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnManualTaskWaitingCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onManualTaskForIdentityWaiting(identity, callback, subscribeOnce);
  }

  public async onManualTaskForIdentityFinished(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnManualTaskFinishedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onManualTaskForIdentityFinished(identity, callback, subscribeOnce);
  }

  public async onProcessStarted(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessEndedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onProcessStarted(identity, callback, subscribeOnce);
  }

  public async onProcessWithProcessModelIdStarted(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessEndedCallback,
    processModelId: string,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onProcessWithProcessModelIdStarted(identity, callback, processModelId, subscribeOnce);
  }

  public async onProcessTerminated(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessTerminatedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onProcessTerminated(identity, callback, subscribeOnce);
  }

  public async onProcessError(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessErrorCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onProcessError(identity, callback, subscribeOnce);
  }

  public async onProcessEnded(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessEndedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiService.onProcessEnded(identity, callback, subscribeOnce);
  }

  public async removeSubscription(identity: IIdentity, subscription: Subscription): Promise<void> {
    return this.consumerApiService.removeSubscription(identity, subscription);
  }

  // Correlations
  public async getAllCorrelations(identity: IIdentity): Promise<Array<DataModels.Correlations.Correlation>> {

    const correlations = await this.correlationService.getAll(identity);

    const managementApiCorrelations = correlations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  public async getActiveCorrelations(identity: IIdentity): Promise<Array<DataModels.Correlations.Correlation>> {

    const activeCorrelations = await this.correlationService.getActive(identity);

    const managementApiCorrelations = activeCorrelations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  public async getCorrelationById(identity: IIdentity, correlationId: string): Promise<DataModels.Correlations.Correlation> {

    const correlationFromProcessEngine = await this.correlationService.getByCorrelationId(identity, correlationId);

    const managementApiCorrelation = Converters.managementApiCorrelationConverter(correlationFromProcessEngine);

    return managementApiCorrelation;
  }

  public async getCorrelationsByProcessModelId(identity: IIdentity, processModelId: string): Promise<Array<DataModels.Correlations.Correlation>> {

    const correlations = await this.correlationService.getByProcessModelId(identity, processModelId);

    const managementApiCorrelations = correlations.map(Converters.managementApiCorrelationConverter);

    return managementApiCorrelations;
  }

  public async getCorrelationByProcessInstanceId(identity: IIdentity, processInstanceId: string): Promise<DataModels.Correlations.Correlation> {

    const correlation = await this.correlationService.getByProcessInstanceId(identity, processInstanceId);

    const managementApiCorrelation = Converters.managementApiCorrelationConverter(correlation);

    return managementApiCorrelation;
  }

  // Process models
  public async getProcessModels(identity: IIdentity): Promise<DataModels.ProcessModels.ProcessModelList> {

    const consumerApiProcessModels = await this.consumerApiService.getProcessModels(identity);

    const managementApiProcessModels =
      await Promise.map(
        consumerApiProcessModels.processModels,
        async (processModel: ConsumerApiTypes.ProcessModels.ProcessModel): Promise<DataModels.ProcessModels.ProcessModel> => {
          const processModelRaw = await this.getRawXmlForProcessModelById(identity, processModel.id);

          return Converters.convertProcessModel(processModel, processModelRaw);
        },
      );

    return {
      processModels: managementApiProcessModels,
    };
  }

  public async getProcessModelById(identity: IIdentity, processModelId: string): Promise<DataModels.ProcessModels.ProcessModel> {

    const consumerApiProcessModel = await this.consumerApiService.getProcessModelById(identity, processModelId);

    const processModelRaw = await this.getRawXmlForProcessModelById(identity, consumerApiProcessModel.id);

    const managementApiProcessModel = Converters.convertProcessModel(consumerApiProcessModel, processModelRaw);

    return managementApiProcessModel;
  }

  public async getProcessModelByProcessInstanceId(identity: IIdentity, processInstanceId: string): Promise<DataModels.ProcessModels.ProcessModel> {

    const consumerApiProcessModel = await this.consumerApiService.getProcessModelByProcessInstanceId(identity, processInstanceId);

    const processModelRaw = await this.getRawXmlForProcessModelById(identity, consumerApiProcessModel.id);

    const managementApiProcessModel = Converters.convertProcessModel(consumerApiProcessModel, processModelRaw);

    return managementApiProcessModel;
  }

  public async getStartEventsForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.Events.EventList> {

    const processModel = await this.processModelUseCases.getProcessModelById(identity, processModelId);
    const processModelFacade = this.processModelFacadeFactory.create(processModel);

    const startEvents = processModelFacade
      .getStartEvents()
      .map(Converters.managementApiEventConverter);

    const eventList = {
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
    return this.consumerApiService.startProcessInstance(identity, processModelId, payload, startCallbackType, startEventId, endEventId);
  }

  public async updateProcessDefinitionsByName(
    identity: IIdentity,
    name: string,
    payload: DataModels.ProcessModels.UpdateProcessDefinitionsRequestPayload,
  ): Promise<void> {

    const deploymentApiPayload = {
      name: name,
      xml: payload.xml,
      overwriteExisting: payload.overwriteExisting,
    };

    return this.deploymentApiService.importBpmnFromXml(identity, deploymentApiPayload);
  }

  public async deleteProcessDefinitionsByProcessModelId(identity: IIdentity, processModelId: string): Promise<void> {
    return this.processModelUseCases.deleteProcessModel(identity, processModelId);
  }

  // Events
  public async getWaitingEventsForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.Events.EventList> {
    return this.consumerApiService.getEventsForProcessModel(identity, processModelId);
  }

  public async getWaitingEventsForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.Events.EventList> {
    return this.consumerApiService.getEventsForCorrelation(identity, correlationId);
  }

  public async getWaitingEventsForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.Events.EventList> {

    return this.consumerApiService.getEventsForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async triggerMessageEvent(identity: IIdentity, messageName: string, payload?: DataModels.Events.EventTriggerPayload): Promise<void> {
    return this.consumerApiService.triggerMessageEvent(identity, messageName, payload);
  }

  public async triggerSignalEvent(identity: IIdentity, signalName: string, payload?: DataModels.Events.EventTriggerPayload): Promise<void> {
    return this.consumerApiService.triggerSignalEvent(identity, signalName, payload);
  }

  // EmptyActivities
  public async getEmptyActivitiesForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.EmptyActivities.EmptyActivityList> {
    return this.consumerApiService.getEmptyActivitiesForProcessModel(identity, processModelId);
  }

  public async getEmptyActivitiesForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<DataModels.EmptyActivities.EmptyActivityList> {
    return this.consumerApiService.getEmptyActivitiesForProcessInstance(identity, processInstanceId);
  }

  public async getEmptyActivitiesForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.EmptyActivities.EmptyActivityList> {
    return this.consumerApiService.getEmptyActivitiesForCorrelation(identity, correlationId);
  }

  public async getEmptyActivitiesForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.EmptyActivities.EmptyActivityList> {
    return this.consumerApiService.getEmptyActivitiesForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async finishEmptyActivity(
    identity: IIdentity,
    processInstanceId: string,
    correlationId: string,
    emptyActivityInstanceId: string,
  ): Promise<void> {
    return this.consumerApiService.finishEmptyActivity(identity, processInstanceId, correlationId, emptyActivityInstanceId);
  }

  // UserTasks
  public async getUserTasksForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.UserTasks.UserTaskList> {
    return this.consumerApiService.getUserTasksForProcessModel(identity, processModelId);
  }

  public async getUserTasksForProcessInstance(identity: IIdentity, processInstanceId: string): Promise<DataModels.UserTasks.UserTaskList> {
    return this.consumerApiService.getUserTasksForProcessInstance(identity, processInstanceId);
  }

  public async getUserTasksForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.UserTasks.UserTaskList> {
    return this.consumerApiService.getUserTasksForCorrelation(identity, correlationId);
  }

  public async getUserTasksForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.UserTasks.UserTaskList> {
    return this.consumerApiService.getUserTasksForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async finishUserTask(
    identity: IIdentity,
    processInstanceId: string,
    correlationId: string,
    userTaskInstanceId: string,
    userTaskResult: DataModels.UserTasks.UserTaskResult,
  ): Promise<void> {
    return this.consumerApiService.finishUserTask(identity, processInstanceId, correlationId, userTaskInstanceId, userTaskResult);
  }

  // ManualTasks
  public async getManualTasksForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.ManualTasks.ManualTaskList> {
    return this.consumerApiService.getManualTasksForProcessModel(identity, processModelId);
  }

  public async getManualTasksForProcessInstance(identity: IIdentity, processInstanceId: string): Promise<DataModels.ManualTasks.ManualTaskList> {
    return this.consumerApiService.getManualTasksForProcessInstance(identity, processInstanceId);
  }

  public async getManualTasksForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.ManualTasks.ManualTaskList> {
    return this.consumerApiService.getManualTasksForCorrelation(identity, correlationId);
  }

  public async getManualTasksForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.ManualTasks.ManualTaskList> {
    return this.consumerApiService.getManualTasksForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async finishManualTask(
    identity: IIdentity,
    processInstanceId: string,
    correlationId: string,
    manualTaskInstanceId: string,
  ): Promise<void> {
    return this.consumerApiService.finishManualTask(identity, processInstanceId, correlationId, manualTaskInstanceId);
  }

  public async getRuntimeInformationForProcessModel(
    identity: IIdentity,
    processModelId: string,
  ): Promise<Array<DataModels.Kpi.FlowNodeRuntimeInformation>> {

    return this.kpiApiService.getRuntimeInformationForProcessModel(identity, processModelId);
  }

  public async getRuntimeInformationForFlowNode(
    identity: IIdentity,
    processModelId: string,
    flowNodeId: string,
  ): Promise<DataModels.Kpi.FlowNodeRuntimeInformation> {
    return this.kpiApiService.getRuntimeInformationForFlowNode(identity, processModelId, flowNodeId);
  }

  public async getActiveTokensForProcessModel(identity: IIdentity, processModelId: string): Promise<Array<DataModels.Kpi.ActiveToken>> {
    return this.kpiApiService.getActiveTokensForProcessModel(identity, processModelId);
  }

  public async getActiveTokensForCorrelationAndProcessModel(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
  ): Promise<Array<DataModels.Kpi.ActiveToken>> {
    return this.kpiApiService.getActiveTokensForCorrelationAndProcessModel(identity, correlationId, processModelId);
  }

  public async getActiveTokensForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<Array<DataModels.Kpi.ActiveToken>> {
    return this.kpiApiService.getActiveTokensForProcessInstance(identity, processInstanceId);
  }

  public async getActiveTokensForFlowNode(identity: IIdentity, flowNodeId: string): Promise<Array<DataModels.Kpi.ActiveToken>> {
    return this.kpiApiService.getActiveTokensForFlowNode(identity, flowNodeId);
  }

  public async getFlowNodeInstancesForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<Array<DataModels.FlowNodeInstances.FlowNodeInstance>> {
    return this.flowNodeInstanceService.queryByProcessInstance(processInstanceId);
  }

  public async getProcessModelLog(identity: IIdentity, processModelId: string, correlationId?: string): Promise<Array<DataModels.Logging.LogEntry>> {

    let logs = await this.loggingApiService.readLogForProcessModel(identity, processModelId);

    if (correlationId) {
      logs = logs.filter((entry: DataModels.Logging.LogEntry): boolean => {
        return entry.correlationId === correlationId;
      });
    }

    return logs;
  }

  public async getProcessInstanceLog(
    identity: IIdentity,
    processModelId: string,
    processInstanceId: string,
  ): Promise<Array<DataModels.Logging.LogEntry>> {

    const processModelLog = await this.loggingApiService.readLogForProcessModel(identity, processModelId);

    const processInstanceLog =
      processModelLog.filter((logEntry: DataModels.Logging.LogEntry): boolean => {
        return logEntry.processInstanceId === processInstanceId;
      });

    return processInstanceLog;
  }

  public async getTokensForFlowNode(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
    flowNodeId: string,
  ): Promise<Array<DataModels.TokenHistory.TokenHistoryEntry>> {
    return this.tokenHistoryApiService.getTokensForFlowNode(identity, correlationId, processModelId, flowNodeId);
  }

  public async getTokensForFlowNodeByProcessInstanceId(
    identity: IIdentity,
    processInstanceId: string,
    flowNodeId: string,
  ): Promise<DataModels.TokenHistory.TokenHistoryGroup> {
    return this.tokenHistoryApiService.getTokensForFlowNodeByProcessInstanceId(identity, processInstanceId, flowNodeId);
  }

  public async getTokensForCorrelationAndProcessModel(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
  ): Promise<DataModels.TokenHistory.TokenHistoryGroup> {
    return this.tokenHistoryApiService.getTokensForCorrelationAndProcessModel(identity, correlationId, processModelId);
  }

  public async getTokensForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<DataModels.TokenHistory.TokenHistoryGroup> {
    return this.tokenHistoryApiService.getTokensForProcessInstance(identity, processInstanceId);
  }

  public async terminateProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<void> {
    await this.ensureUserHasClaim(identity, 'can_terminate_process');

    const terminateEvent = Messages.EventAggregatorSettings.messagePaths.terminateProcessInstance
      .replace(Messages.EventAggregatorSettings.messageParams.processInstanceId, processInstanceId);

    this.eventAggregator.publish(terminateEvent);
  }

  private async ensureUserHasClaim(identity: IIdentity, claimName: string): Promise<void> {

    const userIsSuperAdmin = await this.checkIfUserIsSuperAdmin(identity);
    if (userIsSuperAdmin) {
      return;
    }

    await this.iamService.ensureHasClaim(identity, claimName);
  }

  private async checkIfUserIsSuperAdmin(identity: IIdentity): Promise<boolean> {
    try {
      const superAdminClaim = 'can_manage_process_instances';
      await this.iamService.ensureHasClaim(identity, superAdminClaim);

      return true;
    } catch (error) {
      return false;
    }
  }

  private async getRawXmlForProcessModelById(identity: IIdentity, processModelId: string): Promise<string> {
    const processModelRaw = await this.processModelUseCases.getProcessDefinitionAsXmlByName(identity, processModelId);

    return processModelRaw.xml;
  }

}
