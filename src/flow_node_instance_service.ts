import {IIdentity} from '@essential-projects/iam_contracts';

import {APIs, DataModels} from '@process-engine/management_api_contracts';
import {IFlowNodeInstanceService} from '@process-engine/flow_node_instance.contracts';

export class FlowNodeInstanceService implements APIs.IFlowNodeInstanceManagementApi {

  private readonly flowNodeInstanceService: IFlowNodeInstanceService;

  constructor(flowNodeInstanceService: IFlowNodeInstanceService) {
    this.flowNodeInstanceService = flowNodeInstanceService;
  }

  public async getFlowNodeInstancesForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
  ): Promise<Array<DataModels.FlowNodeInstances.FlowNodeInstance>> {
    return this.flowNodeInstanceService.queryByProcessInstance(processInstanceId);
  }

}
