import {IIdentity} from '@essential-projects/iam_contracts';
import {
  FlowNodeInstance,
  FlowNodeInstanceState,
  IFlowNodeInstanceService,
} from '@process-engine/flow_node_instance.contracts';
import {APIs, DataModels} from '@process-engine/management_api_contracts';

import {EmptyActivityConverter, ManualTaskConverter, UserTaskConverter} from './converters/index';

export class TaskService implements APIs.ITaskManagementApi {

  private readonly flowNodeInstanceService: IFlowNodeInstanceService;

  private readonly userTaskConverter: UserTaskConverter;
  private readonly manualTaskConverter: ManualTaskConverter;
  private readonly emptyActivityConverter: EmptyActivityConverter;

  constructor(
    flowNodeInstanceService: IFlowNodeInstanceService,
    userTaskConverter: UserTaskConverter,
    manualTaskConverter: ManualTaskConverter,
    emptyActivityConverter: EmptyActivityConverter,
  ) {
    this.flowNodeInstanceService = flowNodeInstanceService;

    this.userTaskConverter = userTaskConverter;
    this.manualTaskConverter = manualTaskConverter;
    this.emptyActivityConverter = emptyActivityConverter;
  }

  public async getTasksForProcessModel(identity: IIdentity, processModelId: string): Promise<DataModels.Tasks.TaskList> {

    const suspendedFlowNodes = await this.flowNodeInstanceService.querySuspendedByProcessModel(processModelId);

    const userTaskList = await this.userTaskConverter.convert(identity, suspendedFlowNodes);
    const manualTaskList = await this.manualTaskConverter.convert(identity, suspendedFlowNodes);
    const emptyActivityList = await this.emptyActivityConverter.convert(identity, suspendedFlowNodes);

    const tasks: Array<DataModels.UserTasks.UserTask | DataModels.ManualTasks.ManualTask | DataModels.EmptyActivities.EmptyActivity> =
      [].concat(userTaskList.userTasks, manualTaskList.manualTasks, emptyActivityList.emptyActivities);

    const taskList: DataModels.Tasks.TaskList = {
      tasks: tasks,
    };

    return taskList;
  }

  public async getTasksForProcessInstance(identity: IIdentity, processInstanceId: string): Promise<DataModels.Tasks.TaskList> {

    const suspendedFlowNodes = await this.flowNodeInstanceService.querySuspendedByProcessInstance(processInstanceId);

    const userTaskList = await this.userTaskConverter.convert(identity, suspendedFlowNodes);
    const manualTaskList = await this.manualTaskConverter.convert(identity, suspendedFlowNodes);
    const emptyActivityList = await this.emptyActivityConverter.convert(identity, suspendedFlowNodes);

    const tasks: Array<DataModels.UserTasks.UserTask | DataModels.ManualTasks.ManualTask | DataModels.EmptyActivities.EmptyActivity> =
      [].concat(userTaskList.userTasks, manualTaskList.manualTasks, emptyActivityList.emptyActivities);

    const taskList: DataModels.Tasks.TaskList = {
      tasks: tasks,
    };

    return taskList;
  }

  public async getTasksForCorrelation(identity: IIdentity, correlationId: string): Promise<DataModels.Tasks.TaskList> {

    const suspendedFlowNodes = await this.flowNodeInstanceService.querySuspendedByCorrelation(correlationId);

    const userTaskList = await this.userTaskConverter.convert(identity, suspendedFlowNodes);
    const manualTaskList = await this.manualTaskConverter.convert(identity, suspendedFlowNodes);
    const emptyActivityList = await this.emptyActivityConverter.convert(identity, suspendedFlowNodes);

    const tasks: Array<DataModels.UserTasks.UserTask | DataModels.ManualTasks.ManualTask | DataModels.EmptyActivities.EmptyActivity> =
      [].concat(userTaskList.userTasks, manualTaskList.manualTasks, emptyActivityList.emptyActivities);

    const taskList: DataModels.Tasks.TaskList = {
      tasks: tasks,
    };

    return taskList;
  }

  public async getTasksForProcessModelInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
  ): Promise<DataModels.Tasks.TaskList> {

    const flowNodeInstances = await this.flowNodeInstanceService.queryActiveByCorrelationAndProcessModel(correlationId, processModelId);

    const suspendedFlowNodeInstances = flowNodeInstances.filter((flowNodeInstance: FlowNodeInstance): boolean => {
      return flowNodeInstance.state === FlowNodeInstanceState.suspended;
    });

    const noSuspendedFlowNodesFound = !suspendedFlowNodeInstances || suspendedFlowNodeInstances.length === 0;
    if (noSuspendedFlowNodesFound) {
      return <DataModels.Tasks.TaskList> {
        tasks: [],
      };
    }

    const userTaskList = await this.userTaskConverter.convert(identity, suspendedFlowNodeInstances);
    const manualTaskList = await this.manualTaskConverter.convert(identity, suspendedFlowNodeInstances);
    const emptyActivityList = await this.emptyActivityConverter.convert(identity, suspendedFlowNodeInstances);

    const tasks: Array<DataModels.UserTasks.UserTask | DataModels.ManualTasks.ManualTask | DataModels.EmptyActivities.EmptyActivity> =
      [].concat(userTaskList.userTasks, manualTaskList.manualTasks, emptyActivityList.emptyActivities);

    const taskList: DataModels.Tasks.TaskList = {
      tasks: tasks,
    };

    return taskList;
  }

}
