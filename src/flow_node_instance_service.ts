import {IIdentity} from '@essential-projects/iam_contracts';

import {APIs, DataModels} from '@process-engine/management_api_contracts';
import {
  FlowNodeInstance, FlowNodeInstanceState, IFlowNodeInstanceService,
} from '@process-engine/flow_node_instance.contracts';
import {applyPagination} from './paginator';

import {EmptyActivityConverter, ManualTaskConverter, UserTaskConverter} from './index';

export class FlowNodeInstanceService implements APIs.IFlowNodeInstanceManagementApi {

  private readonly flowNodeInstanceService: IFlowNodeInstanceService;

  private readonly userTaskConverter: UserTaskConverter;
  private readonly manualTaskConverter: ManualTaskConverter;
  private readonly emptyActivityConverter: EmptyActivityConverter;

  constructor(
    flowNodeInstanceService: IFlowNodeInstanceService,
    emptyActivityConverter: EmptyActivityConverter,
    manualTaskConverter: ManualTaskConverter,
    userTaskConverter: UserTaskConverter,
  ) {
    this.flowNodeInstanceService = flowNodeInstanceService;
    this.userTaskConverter = userTaskConverter;
    this.manualTaskConverter = manualTaskConverter;
    this.emptyActivityConverter = emptyActivityConverter;
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

  public async getAllSuspendedTasks(
    identity: IIdentity,
    offset: number = 0,
    limit: number = 0,
  ): Promise<DataModels.FlowNodeInstances.TaskList> {

    const suspendedFlowNodes = await this.flowNodeInstanceService.queryByState(
      FlowNodeInstanceState.suspended,
      offset,
      limit,
    );

    const userTaskList = await this.userTaskConverter.convert(identity, suspendedFlowNodes);
    const manualTaskList = await this.manualTaskConverter.convert(identity, suspendedFlowNodes);
    const emptyActivityList = await this.emptyActivityConverter.convert(identity, suspendedFlowNodes);

    const taskList: DataModels.FlowNodeInstances.TaskList = {
      emptyActivities: emptyActivityList.emptyActivities,
      userTasks: userTaskList.userTasks,
      manualTasks: manualTaskList.manualTasks,
    };

    return taskList;
  }

  public async getSuspendedTasksForProcessModel(
    identity: IIdentity,
    processModelId: string,
    offset: number = 0,
    limit: number = 0,
  ): Promise<DataModels.FlowNodeInstances.TaskList> {

    const suspendedFlowNodes = await this.flowNodeInstanceService.querySuspendedByProcessModel(
      processModelId,
      offset,
      limit,
    );

    const userTaskList = await this.userTaskConverter.convert(identity, suspendedFlowNodes);
    const manualTaskList = await this.manualTaskConverter.convert(identity, suspendedFlowNodes);
    const emptyActivityList = await this.emptyActivityConverter.convert(identity, suspendedFlowNodes);

    const taskList: DataModels.FlowNodeInstances.TaskList = {
      emptyActivities: emptyActivityList.emptyActivities,
      userTasks: userTaskList.userTasks,
      manualTasks: manualTaskList.manualTasks,
    };

    return taskList;
  }

  public async getSuspendedTasksForProcessInstance(
    identity: IIdentity,
    processInstanceId: string,
    offset: number = 0,
    limit: number = 0,
  ): Promise<DataModels.FlowNodeInstances.TaskList> {

    const suspendedFlowNodes = await this.flowNodeInstanceService.querySuspendedByProcessInstance(
      processInstanceId,
      offset,
      limit,
    );

    const userTaskList = await this.userTaskConverter.convert(identity, suspendedFlowNodes);
    const manualTaskList = await this.manualTaskConverter.convert(identity, suspendedFlowNodes);
    const emptyActivityList = await this.emptyActivityConverter.convert(identity, suspendedFlowNodes);

    const taskList: DataModels.FlowNodeInstances.TaskList = {
      emptyActivities: emptyActivityList.emptyActivities,
      userTasks: userTaskList.userTasks,
      manualTasks: manualTaskList.manualTasks,
    };

    return taskList;
  }

  public async getSuspendedTasksForCorrelation(
    identity: IIdentity,
    correlationId: string,
    offset: number = 0,
    limit: number = 0,
  ): Promise<DataModels.FlowNodeInstances.TaskList> {

    const suspendedFlowNodes = await this.flowNodeInstanceService.querySuspendedByCorrelation(
      correlationId,
      offset,
      limit,
    );

    const userTaskList = await this.userTaskConverter.convert(identity, suspendedFlowNodes);
    const manualTaskList = await this.manualTaskConverter.convert(identity, suspendedFlowNodes);
    const emptyActivityList = await this.emptyActivityConverter.convert(identity, suspendedFlowNodes);

    const taskList: DataModels.FlowNodeInstances.TaskList = {
      emptyActivities: emptyActivityList.emptyActivities,
      userTasks: userTaskList.userTasks,
      manualTasks: manualTaskList.manualTasks,
    };

    return taskList;
  }

  public async getSuspendedTasksForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
    offset: number = 0,
    limit: number = 0,
  ): Promise<DataModels.FlowNodeInstances.TaskList> {

    const flowNodeInstances = await this.flowNodeInstanceService.queryActiveByCorrelationAndProcessModel(
      correlationId,
      processModelId,
      offset,
      limit,
    );

    const suspendedFlowNodeInstances = flowNodeInstances.filter((flowNodeInstance: FlowNodeInstance): boolean => {
      return flowNodeInstance.state === FlowNodeInstanceState.suspended;
    });

    const noSuspendedFlowNodesFound = !suspendedFlowNodeInstances || suspendedFlowNodeInstances.length === 0;
    if (noSuspendedFlowNodesFound) {
      return <DataModels.FlowNodeInstances.TaskList> {
        manualTasks: [],
        userTasks: [],
        emptyActivities: [],
      };
    }

    const userTaskList = await this.userTaskConverter.convert(identity, suspendedFlowNodeInstances);
    const manualTaskList = await this.manualTaskConverter.convert(identity, suspendedFlowNodeInstances);
    const emptyActivityList = await this.emptyActivityConverter.convert(identity, suspendedFlowNodeInstances);

    const taskList: DataModels.FlowNodeInstances.TaskList = {
      emptyActivities: emptyActivityList.emptyActivities,
      userTasks: userTaskList.userTasks,
      manualTasks: manualTaskList.manualTasks,
    };

    return taskList;
  }

}
