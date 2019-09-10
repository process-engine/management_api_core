import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

import {ICronjobHistoryService} from '@process-engine/cronjob_history.contracts';
import {APIs, DataModels, Messages} from '@process-engine/management_api_contracts';
import {ICronjobService} from '@process-engine/process_engine_contracts';
import {Subscription} from '@essential-projects/event_aggregator_contracts';
import {NotificationAdapter} from '.';

import {applyPagination} from './paginator';

export class CronjobService implements APIs.ICronjobManagementApi {

  private readonly iamService: IIAMService;
  private readonly notificationAdapter: NotificationAdapter;
  private readonly cronjobService: ICronjobService;
  private readonly cronjobHistoryService: ICronjobHistoryService;

  private readonly canSubscribeToEventsClaim = 'can_subscribe_to_events';

  constructor(
    cronjobService: ICronjobService,
    cronjobHistoryService: ICronjobHistoryService,
    iamService: IIAMService,
    notificationAdapter: NotificationAdapter,
  ) {
    this.cronjobHistoryService = cronjobHistoryService;
    this.cronjobService = cronjobService;
    this.iamService = iamService;
    this.notificationAdapter = notificationAdapter;
  }

  public async getAllActiveCronjobs(
    identity: IIdentity,
    offset: number = 0,
    limit: number = 0,
  ): Promise<Array<DataModels.Cronjobs.CronjobConfiguration>> {

    const cronjobs = this.cronjobService.getActive();

    const paginizedCronjobs = applyPagination(cronjobs, offset, limit);

    return paginizedCronjobs;
  }

  public async getCronjobExecutionHistoryForProcessModel(
    identity: IIdentity,
    processModelId: string,
    startEventId?: string,
    offset: number = 0,
    limit: number = 0,
  ): Promise<Array<DataModels.Cronjobs.CronjobHistoryEntry>> {
    return this.cronjobHistoryService.getByProcessModelId(identity, processModelId, startEventId, offset, limit);
  }

  public async getCronjobExecutionHistoryForCrontab(
    identity: IIdentity,
    crontab: string,
    offset: number = 0,
    limit: number = 0,
  ): Promise<Array<DataModels.Cronjobs.CronjobHistoryEntry>> {
    return this.cronjobHistoryService.getByCrontab(identity, crontab, offset, limit);
  }

  public async onCronjobCreated(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnProcessErrorCallback,
    subscribeOnce = false,
  ): Promise<Subscription> {
    await this.iamService.ensureHasClaim(identity, this.canSubscribeToEventsClaim);

    return this.notificationAdapter.onCronjobCreated(identity, callback, subscribeOnce);
  }

  public async onCronjobExecuted(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnCronjobExecutedCallback,
    subscribeOnce = false,
  ): Promise<Subscription> {
    await this.iamService.ensureHasClaim(identity, this.canSubscribeToEventsClaim);

    return this.notificationAdapter.onCronjobExecuted(identity, callback, subscribeOnce);
  }

  public async onCronjobStopped(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnCronjobStoppedCallback,
    subscribeOnce = false,
  ): Promise<Subscription> {
    await this.iamService.ensureHasClaim(identity, this.canSubscribeToEventsClaim);

    return this.notificationAdapter.onCronjobStopped(identity, callback, subscribeOnce);
  }

  public async onCronjobUpdated(
    identity: IIdentity,
    callback: Messages.CallbackTypes.OnCronjobUpdatedCallback,
    subscribeOnce = false,
  ): Promise<Subscription> {
    await this.iamService.ensureHasClaim(identity, this.canSubscribeToEventsClaim);

    return this.notificationAdapter.onCronjobUpdated(identity, callback, subscribeOnce);
  }

}
