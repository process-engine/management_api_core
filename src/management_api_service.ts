import * as EssentialProjectErrors from '@essential-projects/errors_ts';
import {IEventAggregator} from '@essential-projects/event_aggregator_contracts';
import {IIdentity} from '@essential-projects/iam_contracts';
import {
  Event,
  EventList,
  IManagementApiService,
  ManagementContext,
  ProcessModelExecution,
  UserTask,
  UserTaskList,
  UserTaskResult,
} from '@process-engine/management_api_contracts';
import {
  ExecutionContext,
  IExecutionContextFacade,
  IExecutionContextFacadeFactory,
  IFlowNodeInstanceService,
  IProcessModelFacade,
  IProcessModelFacadeFactory,
  IProcessModelService,
  Model,
  Runtime,
} from '@process-engine/process_engine_contracts';

import * as Converters from './converters/index';
import {IProcessModelExecutionAdapter} from './process_model_execution/index';

export class ManagementApiService implements IManagementApiService {
  public config: any = undefined;

  private _eventAggregator: IEventAggregator;
  private _executionContextFacadeFactory: IExecutionContextFacadeFactory;
  private _flowNodeInstanceService: IFlowNodeInstanceService;
  private _processModelFacadeFactory: IProcessModelFacadeFactory;
  private _processModelExecutionAdapter: IProcessModelExecutionAdapter;
  private _processModelService: IProcessModelService;

  private convertProcessModel: Function;
  private convertUserTasks: Function;

  constructor(eventAggregator: IEventAggregator,
              executionContextFacadeFactory: IExecutionContextFacadeFactory,
              flowNodeInstanceService: IFlowNodeInstanceService,
              processModelFacadeFactory: IProcessModelFacadeFactory,
              processModelExecutionAdapter: IProcessModelExecutionAdapter,
              processModelService: IProcessModelService) {

    this._eventAggregator = eventAggregator;
    this._executionContextFacadeFactory = executionContextFacadeFactory;
    this._flowNodeInstanceService = flowNodeInstanceService;
    this._processModelExecutionAdapter = processModelExecutionAdapter;
    this._processModelFacadeFactory = processModelFacadeFactory;
    this._processModelService = processModelService;
  }

  private get eventAggregator(): IEventAggregator {
    return this._eventAggregator;
  }

  private get executionContextFacadeFactory(): IExecutionContextFacadeFactory {
    return this._executionContextFacadeFactory;
  }

  private get flowNodeInstanceService(): IFlowNodeInstanceService {
    return this._flowNodeInstanceService;
  }

  private get processModelExecutionAdapter(): IProcessModelExecutionAdapter {
    return this._processModelExecutionAdapter;
  }

  private get processModelFacadeFactory(): IProcessModelFacadeFactory {
    return this._processModelFacadeFactory;
  }

  private get processModelService(): IProcessModelService {
    return this._processModelService;
  }

  public async initialize(): Promise<void> {

    this.convertProcessModel = Converters.createProcessModelConverter(this.processModelFacadeFactory);
    this.convertUserTasks = Converters.createUserTaskConverter(this.processModelFacadeFactory, this.processModelService);

    return Promise.resolve();
  }

  // Process models
  public async getProcessModels(context: ManagementContext): Promise<ProcessModelExecution.ProcessModelList> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const processModels: Array<Model.Types.Process> = await this.processModelService.getProcessModels(executionContextFacade);
    const managementApiProcessModels: Array<ProcessModelExecution.ProcessModel> = processModels.map((processModel: Model.Types.Process) => {
      return this.convertProcessModel(processModel);
    });

    return <ProcessModelExecution.ProcessModelList> {
      processModels: managementApiProcessModels,
    };
  }

  public async getProcessModelById(context: ManagementContext, processModelId: string): Promise<ProcessModelExecution.ProcessModel> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);
    const processModel: Model.Types.Process = await this.processModelService.getProcessModelById(executionContextFacade, processModelId);
    const managementApiProcessModel: ProcessModelExecution.ProcessModel = this.convertProcessModel(processModel);

    return managementApiProcessModel;
  }

  public async startProcessInstance(context: ManagementContext,
                                    processModelId: string,
                                    startEventId: string,
                                    payload: ProcessModelExecution.ProcessStartRequestPayload,
                                    startCallbackType: ProcessModelExecution.StartCallbackType =
                                      ProcessModelExecution.StartCallbackType.CallbackOnProcessInstanceCreated,
                                    endEventId?: string,
                                  ): Promise<ProcessModelExecution.ProcessStartResponsePayload> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);

    // Uses the standard IAM facade with the processModelService => The process model gets filtered.
    const processModel: Model.Types.Process = await this.processModelService.getProcessModelById(executionContextFacade, processModelId);

    this._validateStartRequest(processModel, startEventId, endEventId, startCallbackType);

    return this.processModelExecutionAdapter
      .startProcessInstance(executionContextFacade, processModelId, startEventId, payload, startCallbackType, endEventId);
  }

  public async getEventsForProcessModel(context: ManagementContext, processModelId: string): Promise<EventList> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);

    const processModel: Model.Types.Process = await this.processModelService.getProcessModelById(executionContextFacade, processModelId);
    const processModelFacade: IProcessModelFacade = this.processModelFacadeFactory.create(processModel);

    const startEvents: Array<Event> = processModelFacade.getStartEvents()
                                                        .map(Converters.managementApiEventConverter);

    const eventList: EventList = {
      events: startEvents,
    };

    return eventList;
  }

  // UserTasks
  public async getUserTasksForProcessModel(context: ManagementContext, processModelId: string): Promise<UserTaskList> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);

    await this._checkIfProcessModelInstanceExists(executionContextFacade, processModelId);

    const suspendedFlowNodes: Array<Runtime.Types.FlowNodeInstance> =
      await this.flowNodeInstanceService.querySuspendedByProcessModel(executionContextFacade, processModelId);

    const userTaskList: UserTaskList = await this.convertUserTasks(executionContextFacade, suspendedFlowNodes);

    return userTaskList;
  }

  public async getUserTasksForCorrelation(context: ManagementContext, correlationId: string): Promise<UserTaskList> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);

    await this._checkIfCorrelationExists(executionContextFacade, correlationId);

    const suspendedFlowNodes: Array<Runtime.Types.FlowNodeInstance> =
      await this.flowNodeInstanceService.querySuspendedByCorrelation(executionContextFacade, correlationId);

    const userTaskList: UserTaskList = await this.convertUserTasks(executionContextFacade, suspendedFlowNodes);

    return userTaskList;
  }

  public async getUserTasksForProcessModelInCorrelation(context: ManagementContext,
                                                        processModelId: string,
                                                        correlationId: string): Promise<UserTaskList> {

    const executionContextFacade: IExecutionContextFacade = await this._createExecutionContextFacadeFromManagementContext(context);

    await this._checkIfCorrelationExists(executionContextFacade, correlationId);
    await this._checkIfProcessModelInstanceExists(executionContextFacade, processModelId);

    const suspendedFlowNodes: Array<Runtime.Types.FlowNodeInstance> =
      await this.flowNodeInstanceService.querySuspendedByCorrelation(executionContextFacade, correlationId);

    const userTaskList: UserTaskList =
      await this.convertUserTasks(executionContextFacade, suspendedFlowNodes, processModelId);

    return userTaskList;
  }

  public async finishUserTask(context: ManagementContext,
                              processModelId: string,
                              correlationId: string,
                              userTaskId: string,
                              userTaskResult: UserTaskResult): Promise<void> {

    const userTasks: UserTaskList = await this.getUserTasksForProcessModelInCorrelation(context, processModelId, correlationId);

    const userTask: UserTask = userTasks.userTasks.find((task: UserTask) => {
      return task.key === userTaskId;
    });

    if (userTask === undefined) {
      const errorMessage: string = `Process model '${processModelId}' in correlation '${correlationId}' does not have a user task '${userTaskId}'`;
      throw new EssentialProjectErrors.NotFoundError(errorMessage);
    }

    const resultForProcessEngine: any = this._getUserTaskResultFromUserTaskConfig(userTaskResult);

    return new Promise<void>((resolve: Function, reject: Function): void => {
      this.eventAggregator.subscribeOnce(`/processengine/node/${userTask.id}/finished`, (event: any) => {
        resolve();
      });

      this.eventAggregator.publish(`/processengine/node/${userTask.id}/finish`, {
        data: {
          token: resultForProcessEngine,
        },
      });
    });
  }

  private async _createExecutionContextFacadeFromManagementContext(managementContext: ManagementContext): Promise<IExecutionContextFacade> {
    const identity: IIdentity = {
      token: managementContext.identity,
    };
    const executionContext: ExecutionContext = new ExecutionContext(identity);

    return this.executionContextFacadeFactory.create(executionContext);
  }

  private _validateStartRequest(processModel: Model.Types.Process,
                                startEventId: string,
                                endEventId: string,
                                startCallbackType: ProcessModelExecution.StartCallbackType,
                               ): void {

    if (!Object.values(ProcessModelExecution.StartCallbackType).includes(startCallbackType)) {
      throw new EssentialProjectErrors.BadRequestError(`${startCallbackType} is not a valid return option!`);
    }

    if (!processModel.isExecutable) {
      throw new EssentialProjectErrors.BadRequestError('The process model is not executable!');
    }

    const hasMatchingStartEvent: boolean = processModel.flowNodes.some((flowNode: Model.Base.FlowNode): boolean => {
      return flowNode.id === startEventId;
    });

    if (!hasMatchingStartEvent) {
      throw new EssentialProjectErrors.NotFoundError(`StartEvent with ID '${startEventId}' not found!`);
    }

    if (startCallbackType === ProcessModelExecution.StartCallbackType.CallbackOnEndEventReached) {

      if (!endEventId) {
        throw new EssentialProjectErrors.BadRequestError(`Must provide an EndEventId, when using callback type 'CallbackOnEndEventReached'!`);
      }

      const hasMatchingEndEvent: boolean = processModel.flowNodes.some((flowNode: Model.Base.FlowNode): boolean => {
        return flowNode.id === endEventId;
      });

      if (!hasMatchingEndEvent) {
        throw new EssentialProjectErrors.NotFoundError(`EndEvent with ID '${startEventId}' not found!`);
      }
    }
  }

  private async _checkIfCorrelationExists(executionContextFacade: IExecutionContextFacade, correlationId: string): Promise<void> {
    const flowNodeInstances: Array<Runtime.Types.FlowNodeInstance> =
      await this.flowNodeInstanceService.queryByCorrelation(executionContextFacade, correlationId);

    if (!flowNodeInstances || flowNodeInstances.length === 0) {
      throw new EssentialProjectErrors.NotFoundError(`No Correlation with id '${correlationId}' found.`);
    }
  }

  private async _checkIfProcessModelInstanceExists(executionContextFacade: IExecutionContextFacade, processInstanceId: string): Promise<void> {
    const flowNodeInstances: Array<Runtime.Types.FlowNodeInstance> =
      await this.flowNodeInstanceService.queryByProcessModel(executionContextFacade, processInstanceId);

    if (!flowNodeInstances || flowNodeInstances.length === 0) {
      throw new EssentialProjectErrors.NotFoundError(`No process instance with id '${processInstanceId}' found.`);
    }
  }

  private _getUserTaskResultFromUserTaskConfig(finishedTask: UserTaskResult): any {
    const userTaskIsNotAnObject: boolean = finishedTask === undefined
                                        || finishedTask.formFields === undefined
                                        || typeof finishedTask.formFields !== 'object'
                                        || Array.isArray(finishedTask.formFields);

    if (userTaskIsNotAnObject) {
      throw new EssentialProjectErrors.BadRequestError('The UserTasks formFields is not an object.');
    }

    const noFormfieldsSubmitted: boolean = Object.keys(finishedTask.formFields).length === 0;
    if (noFormfieldsSubmitted) {
      throw new EssentialProjectErrors.BadRequestError('The UserTasks formFields are empty.');
    }

    return finishedTask.formFields;
  }

}
