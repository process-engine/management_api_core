import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

import {FlowNodeInstance, IFlowNodeInstanceRepository, ProcessToken} from '@process-engine/flow_node_instance.contracts';
import {APIs, DataModels} from '@process-engine/management_api_contracts';

import {applyPagination} from './paginator';

export class TokenHistoryService implements APIs.ITokenHistoryManagementApi {

  private iamService: IIAMService;
  private flowNodeInstanceRepository: IFlowNodeInstanceRepository;

  constructor(iamService: IIAMService, flowNodeInstanceRepository: IFlowNodeInstanceRepository) {
    this.iamService = iamService;
    this.flowNodeInstanceRepository = flowNodeInstanceRepository;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForFlowNode(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
    flowNodeId: string,
    offset: number = 0,
    limit: number = 0,
  ): Promise<Array<DataModels.TokenHistory.TokenHistoryEntry>> {

    const flowNodeInstance = await this.flowNodeInstanceRepository.querySpecificFlowNode(correlationId, processModelId, flowNodeId);

    const tokenHistory = this.getTokenHistoryForFlowNode(flowNodeInstance);

    const paginizedTokenHistory = applyPagination(tokenHistory, offset, limit);

    return paginizedTokenHistory;
  }

  public async getTokensForFlowNodeByProcessInstanceId(
    identity: IIdentity,
    processInstanceId: string,
    flowNodeId: string,
  ): Promise<DataModels.TokenHistory.TokenHistoryGroup> {

    const flowNodeInstances = await this.flowNodeInstanceRepository.queryFlowNodeInstancesByProcessInstanceId(processInstanceId, flowNodeId);

    const tokenHistories = this.createTokenHistories(flowNodeInstances);

    return tokenHistories;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForCorrelationAndProcessModel(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
  ): Promise<DataModels.TokenHistory.TokenHistoryGroup> {

    const flowNodeInstances = await this.flowNodeInstanceRepository.queryByCorrelationAndProcessModel(correlationId, processModelId);

    const tokenHistories = this.createTokenHistories(flowNodeInstances);

    return tokenHistories;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForProcessInstance(identity: IIdentity, processInstanceId: string): Promise<DataModels.TokenHistory.TokenHistoryGroup> {

    const flowNodeInstances = await this.flowNodeInstanceRepository.queryByProcessInstance(processInstanceId);

    const tokenHistories = this.createTokenHistories(flowNodeInstances);

    return tokenHistories;
  }

  private createTokenHistories(flowNodeInstances: Array<FlowNodeInstance>): DataModels.TokenHistory.TokenHistoryGroup {
    const tokenHistories: DataModels.TokenHistory.TokenHistoryGroup = {};

    flowNodeInstances.forEach((flowNodeInstance: FlowNodeInstance): void => {
      const tokenHistory = this.getTokenHistoryForFlowNode(flowNodeInstance);

      const flowNodeId = flowNodeInstance.flowNodeId;

      // eslint-disable-next-line no-null/no-null
      const flowNodeIdExist = tokenHistories[flowNodeId] !== null && tokenHistories[flowNodeId] !== undefined;

      if (flowNodeIdExist) {
        tokenHistories[flowNodeId].push(...tokenHistory);
      } else {
        tokenHistories[flowNodeId] = tokenHistory;
      }
    });

    return tokenHistories;
  }

  private getTokenHistoryForFlowNode(flowNodeInstance: FlowNodeInstance): Array<DataModels.TokenHistory.TokenHistoryEntry> {
    const tokenHistory = flowNodeInstance.tokens.map((fniToken: ProcessToken): DataModels.TokenHistory.TokenHistoryEntry => {

      const tokenHistoryEntry = new DataModels.TokenHistory.TokenHistoryEntry();
      tokenHistoryEntry.flowNodeId = flowNodeInstance.flowNodeId;
      tokenHistoryEntry.flowNodeInstanceId = flowNodeInstance.id;
      tokenHistoryEntry.previousFlowNodeInstanceId = flowNodeInstance.previousFlowNodeInstanceId;
      tokenHistoryEntry.processInstanceId = fniToken.processInstanceId;
      tokenHistoryEntry.processModelId = fniToken.processModelId;
      tokenHistoryEntry.correlationId = fniToken.correlationId;
      tokenHistoryEntry.tokenEventType = DataModels.TokenHistory.TokenEventType[fniToken.type];
      tokenHistoryEntry.identity = fniToken.identity;
      tokenHistoryEntry.createdAt = fniToken.createdAt;
      tokenHistoryEntry.caller = fniToken.caller;
      tokenHistoryEntry.payload = fniToken.payload;

      return tokenHistoryEntry;
    });

    return tokenHistory;
  }

}
