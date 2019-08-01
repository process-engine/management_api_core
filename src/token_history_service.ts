import {IIdentity} from '@essential-projects/iam_contracts';

import {ITokenHistoryApi} from '@process-engine/token_history_api_contracts';

import {APIs, DataModels} from '@process-engine/management_api_contracts';

export class TokenHistoryService implements APIs.ITokenHistoryManagementApi {

  private readonly tokenHistoryApiService: ITokenHistoryApi;

  constructor(tokenHistoryApiService: ITokenHistoryApi) {
    this.tokenHistoryApiService = tokenHistoryApiService;
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

}
