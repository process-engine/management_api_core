import {IIdentity} from '@essential-projects/iam_contracts';

import {APIs, DataModels} from '@process-engine/management_api_contracts';
import {IFlowNodeInstanceService} from '@process-engine/flow_node_instance.contracts';
import {applyPagination} from './paginator';

export class FlowNodeInstanceService implements APIs.IFlowNodeInstanceManagementApi {

  private readonly flowNodeInstanceService: IFlowNodeInstanceService;

  constructor(flowNodeInstanceService: IFlowNodeInstanceService) {
    this.flowNodeInstanceService = flowNodeInstanceService;
  }

  public async getFlowNodeInstancesForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
    offset: number = 0,
    limit: number = 0,
  ): Promise<DataModels.FlowNodeInstances.FlowNodeInstanceList> {
    const flowNodeInstances = await this.flowNodeInstanceService.queryByProcessInstance(processInstanceId);

    const paginizedFlowNodeInstances = applyPagination(flowNodeInstances, offset, limit);

    return {flowNodeInstances: paginizedFlowNodeInstances, totalCount: flowNodeInstances.length};
  }

}
