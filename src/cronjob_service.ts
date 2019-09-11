import {IIdentity} from '@essential-projects/iam_contracts';

import {ICronjobHistoryService} from '@process-engine/cronjob_history.contracts';
import {APIs, DataModels} from '@process-engine/management_api_contracts';
import {ICronjobService} from '@process-engine/process_engine_contracts';

import {applyPagination} from './paginator';

export class CronjobService implements APIs.ICronjobManagementApi {

  private readonly cronjobService: ICronjobService;
  private readonly cronjobHistoryService: ICronjobHistoryService;

  constructor(
    cronjobService: ICronjobService,
    cronjobHistoryService: ICronjobHistoryService,
  ) {
    this.cronjobHistoryService = cronjobHistoryService;
    this.cronjobService = cronjobService;
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

}
