import {IEventAggregator, Subscription} from '@essential-projects/event_aggregator_contracts';
import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

import {DataModels as ConsumerApiTypes, APIs as ConsumerApis} from '@process-engine/consumer_api_contracts';
import {APIs, DataModels, Messages} from '@process-engine/management_api_contracts';
import {ICronjobService, IProcessModelFacadeFactory} from '@process-engine/process_engine_contracts';
import {IProcessModelUseCases, Model} from '@process-engine/process_model.contracts';

export class ProcessModelService implements APIs.IProcessModelManagementApi {

  private readonly consumerApiProcessModelService: ConsumerApis.IProcessModelConsumerApi;
  private readonly cronjobService: ICronjobService;
  private readonly eventAggregator: IEventAggregator;
  private readonly iamService: IIAMService;
  private readonly processModelFacadeFactory: IProcessModelFacadeFactory;
  private readonly processModelUseCases: IProcessModelUseCases;

  constructor(
    consumerApiProcessModelService: ConsumerApis.IProcessModelConsumerApi,
    cronjobService: ICronjobService,
    eventAggregator: IEventAggregator,
    iamService: IIAMService,
    processModelFacadeFactory: IProcessModelFacadeFactory,
    processModelUseCases: IProcessModelUseCases,
  ) {
    this.consumerApiProcessModelService = consumerApiProcessModelService;
    this.cronjobService = cronjobService;
    this.eventAggregator = eventAggregator;
    this.iamService = iamService;
    this.processModelFacadeFactory = processModelFacadeFactory;
    this.processModelUseCases = processModelUseCases;
  }

  public async getProcessModels(identity: IIdentity): Promise<DataModels.ProcessModels.ProcessModelList> {

    const consumerApiProcessModels = await this.consumerApiProcessModelService.getProcessModels(identity);

    const managementApiProcessModels =
      await Promise.map(
        consumerApiProcessModels.processModels,
        async (processModel: ConsumerApiTypes.ProcessModels.ProcessModel): Promise<DataModels.ProcessModels.ProcessModel> => {
          const processModelRaw = await this.getRawXmlForProcessModelById(identity, processModel.id);

          return this.attachXmlToProcessModel(processModel, processModelRaw);
        },
      );

    return {
      processModels: managementApiProcessModels,
    };
  }

  public async getProcessModelById(identity: IIdentity, processModelId: string): Promise<DataModels.ProcessModels.ProcessModel> {

    const consumerApiProcessModel = await this.consumerApiProcessModelService.getProcessModelById(identity, processModelId);

    const processModelRaw = await this.getRawXmlForProcessModelById(identity, consumerApiProcessModel.id);

    const managementApiProcessModel = this.attachXmlToProcessModel(consumerApiProcessModel, processModelRaw);

    return managementApiProcessModel;
  }

  public async getProcessModelByProcessInstanceId(identity: IIdentity, processInstanceId: string): Promise<DataModels.ProcessModels.ProcessModel> {

    const consumerApiProcessModel = await this.consumerApiProcessModelService.getProcessModelByProcessInstanceId(identity, processInstanceId);

    const processModelRaw = await this.getRawXmlForProcessModelById(identity, consumerApiProcessModel.id);

    const managementApiProcessModel = this.attachXmlToProcessModel(consumerApiProcessModel, processModelRaw);

    return managementApiProcessModel;
  }

  public async getStartEventsForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.Events.EventList> {

    const processModel = await this.processModelUseCases.getProcessModelById(identity, processModelId);
    const processModelFacade = this.processModelFacadeFactory.create(processModel);

    const startEvents = processModelFacade
      .getStartEvents()
      .map(this.convertToPublicEvent);

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
    return this.consumerApiProcessModelService.startProcessInstance(identity, processModelId, payload, startCallbackType, startEventId, endEventId);
  }

  public async updateProcessDefinitionsByName(
    identity: IIdentity,
    name: string,
    payload: DataModels.ProcessModels.UpdateProcessDefinitionsRequestPayload,
  ): Promise<void> {
    await this.processModelUseCases.persistProcessDefinitions(identity, name, payload.xml, payload.overwriteExisting);

    // NOTE: This will only work as long as ProcessDefinitionName and ProcessModelId remain the same.
    // As soon as we refactor the ProcessEngine core to allow different names for each, this will have to be refactored accordingly.
    const processModel = await this.processModelUseCases.getProcessModelById(identity, name);

    await this.cronjobService.addOrUpdate(processModel);
  }

  public async deleteProcessDefinitionsByProcessModelId(identity: IIdentity, processModelId: string): Promise<void> {
    await this.processModelUseCases.deleteProcessModel(identity, processModelId);

    await this.cronjobService.remove(processModelId);
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

  // Notifications
  public async onProcessStarted(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessEndedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiProcessModelService.onProcessStarted(identity, callback, subscribeOnce);
  }

  public async onProcessWithProcessModelIdStarted(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessEndedCallback,
    processModelId: string,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiProcessModelService.onProcessWithProcessModelIdStarted(identity, callback, processModelId, subscribeOnce);
  }

  public async onProcessEnded(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessEndedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiProcessModelService.onProcessEnded(identity, callback, subscribeOnce);
  }

  public async onProcessTerminated(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessTerminatedCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiProcessModelService.onProcessTerminated(identity, callback, subscribeOnce);
  }

  public async onProcessError(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessErrorCallback,
    subscribeOnce?: boolean,
  ): Promise<Subscription> {
    return this.consumerApiProcessModelService.onProcessError(identity, callback, subscribeOnce);
  }

  private async getRawXmlForProcessModelById(identity: IIdentity, processModelId: string): Promise<string> {
    const processModelRaw = await this.processModelUseCases.getProcessDefinitionAsXmlByName(identity, processModelId);

    return processModelRaw.xml;
  }

  private attachXmlToProcessModel(
    consumerApiProcessModel: ConsumerApiTypes.ProcessModels.ProcessModel,
    processModelRaw: string,
  ): DataModels.ProcessModels.ProcessModel {

    const processModel = <DataModels.ProcessModels.ProcessModel> consumerApiProcessModel;
    processModel.xml = processModelRaw;

    return processModel;
  }

  private convertToPublicEvent(event: Model.Events.StartEvent): DataModels.Events.Event {
    const managementApiEvent = new DataModels.Events.Event();
    managementApiEvent.id = event.id;
    managementApiEvent.eventName = event.name;
    managementApiEvent.bpmnType = event.bpmnType;
    managementApiEvent.eventType = event.eventType;

    return managementApiEvent;
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

}
