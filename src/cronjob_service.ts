import {IIdentity} from '@essential-projects/iam_contracts';

import {ICronjobHistoryService} from '@process-engine/cronjob_history.contracts';
import {APIs, DataModels} from '@process-engine/management_api_contracts';
import {ICronjobService} from '@process-engine/process_engine_contracts';

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

  public async getAllActiveCronjobs(identity: IIdentity): Promise<Array<DataModels.Cronjobs.CronjobConfiguration>> {
    return this.cronjobService.getActive();
  }

  public async getCronjobExecutionHistoryForProcessModel(
    identity: IIdentity,
    processModelId: string,
    startEventId?: string,
  ): Promise<Array<DataModels.Cronjobs.CronjobHistoryEntry>> {
    return this.cronjobHistoryService.getByProcessModelId(identity, processModelId, startEventId);
  }

  public async getCronjobExecutionHistoryForCrontab(
    identity: IIdentity,
    crontab: string,
  ): Promise<Array<DataModels.Cronjobs.CronjobHistoryEntry>> {
    return this.cronjobHistoryService.getByCrontab(identity, crontab);
  }

}
