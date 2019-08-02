import {IIdentity} from '@essential-projects/iam_contracts';

import {APIs as ConsumerApis} from '@process-engine/consumer_api_contracts';
import {APIs, DataModels} from '@process-engine/management_api_contracts';

export class EventService implements APIs.IEventManagementApi {

  private readonly consumerApiEventService: ConsumerApis.IEventConsumerApi;

  constructor(consumerApiEventService: ConsumerApis.IEventConsumerApi) {
    this.consumerApiEventService = consumerApiEventService;
  }

  public async getWaitingEventsForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.Events.EventList> {
    return this.consumerApiEventService.getEventsForProcessModel(identity, processModelId);
  }

  public async getWaitingEventsForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.Events.EventList> {
    return this.consumerApiEventService.getEventsForCorrelation(identity, correlationId);
  }

  public async getWaitingEventsForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.Events.EventList> {

    return this.consumerApiEventService.getEventsForProcessModelInCorrelation(identity, processModelId, correlationId);
  }

  public async triggerMessageEvent(identity: IIdentity, messageName: string, payload?: DataModels.Events.EventTriggerPayload): Promise<void> {
    return this.consumerApiEventService.triggerMessageEvent(identity, messageName, payload);
  }

  public async triggerSignalEvent(identity: IIdentity, signalName: string, payload?: DataModels.Events.EventTriggerPayload): Promise<void> {
    return this.consumerApiEventService.triggerSignalEvent(identity, signalName, payload);
  }

}
