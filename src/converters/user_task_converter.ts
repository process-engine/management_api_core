/* eslint-disable @typescript-eslint/no-explicit-any */
import {IIdentity} from '@essential-projects/iam_contracts';

import {ICorrelationService} from '@process-engine/correlation.contracts';
import {
  FlowNodeInstance, IFlowNodeInstanceService, ProcessToken, ProcessTokenType,
} from '@process-engine/flow_node_instance.contracts';
import {DataModels} from '@process-engine/management_api_contracts';
import {
  IFlowNodeInstanceResult,
  IProcessModelFacade,
  IProcessModelFacadeFactory,
  IProcessTokenFacadeFactory,
} from '@process-engine/process_engine_contracts';
import {BpmnType, IProcessModelUseCases, Model} from '@process-engine/process_model.contracts';

import * as ProcessModelCache from './process_model_cache';

export class UserTaskConverter {

  private readonly correlationService: ICorrelationService;
  private readonly flowNodeInstanceService: IFlowNodeInstanceService;
  private readonly processModelFacadeFactory: IProcessModelFacadeFactory;
  private readonly processModelUseCase: IProcessModelUseCases;
  private readonly processTokenFacadeFactory: IProcessTokenFacadeFactory;

  constructor(
    correlationRepository: ICorrelationService,
    flowNodeInstanceService: IFlowNodeInstanceService,
    processModelFacadeFactory: IProcessModelFacadeFactory,
    processModelUse: IProcessModelUseCases,
    processTokenFacadeFactory: IProcessTokenFacadeFactory,
  ) {
    this.correlationService = correlationRepository;
    this.processModelUseCase = processModelUse;
    this.flowNodeInstanceService = flowNodeInstanceService;
    this.processModelFacadeFactory = processModelFacadeFactory;
    this.processTokenFacadeFactory = processTokenFacadeFactory;
  }

  public async convert(
    identity: IIdentity,
    suspendedFlowNodes: Array<FlowNodeInstance>,
  ): Promise<DataModels.UserTasks.UserTaskList> {

    const suspendedUserTasks: Array<DataModels.UserTasks.UserTask> = [];

    for (const suspendedFlowNode of suspendedFlowNodes) {

      // Note that UserTasks are not the only types of FlowNodes that can be suspended.
      // So we must make sure that what we have here is actually a UserTask and not, for example, a TimerEvent.
      const flowNodeIsNotAUserTask = suspendedFlowNode.flowNodeType !== BpmnType.userTask;
      if (flowNodeIsNotAUserTask) {
        continue;
      }

      const processModelFacade = await this.getProcessModelForFlowNodeInstance(identity, suspendedFlowNode);

      const flowNodeModel = processModelFacade.getFlowNodeById(suspendedFlowNode.flowNodeId);

      const userTask = await this.convertToManagementApiUserTask(flowNodeModel as Model.Activities.UserTask, suspendedFlowNode);

      suspendedUserTasks.push(userTask);
    }

    const userTaskList: DataModels.UserTasks.UserTaskList = {
      userTasks: suspendedUserTasks,
    };

    return userTaskList;
  }

  private async getProcessModelForFlowNodeInstance(
    identity: IIdentity,
    flowNodeInstance: FlowNodeInstance,
  ): Promise<IProcessModelFacade> {

    let processModel: Model.Process;

    // We must store the ProcessModel for each user, to account for lane-restrictions.
    // Some users may not be able to see some lanes that are visible to others.
    const cacheKeyToUse = `${flowNodeInstance.processInstanceId}-${identity.userId}`;

    const cacheHasMatchingEntry = ProcessModelCache.hasEntry(cacheKeyToUse);
    if (cacheHasMatchingEntry) {
      processModel = ProcessModelCache.get(cacheKeyToUse);
    } else {
      const processModelHash = await this.getProcessModelHashForProcessInstance(identity, flowNodeInstance.processInstanceId);
      processModel = await this.processModelUseCase.getByHash(identity, flowNodeInstance.processModelId, processModelHash);
      ProcessModelCache.add(cacheKeyToUse, processModel);
    }

    const processModelFacade = this.processModelFacadeFactory.create(processModel);

    return processModelFacade;
  }

  private async getProcessModelHashForProcessInstance(identity: IIdentity, processInstanceId: string): Promise<string> {
    const correlationForProcessInstance = await this.correlationService.getByProcessInstanceId(identity, processInstanceId);

    // Note that ProcessInstances will only ever have one processModel and therefore only one hash attached to them.
    return correlationForProcessInstance.processInstances[0].hash;
  }

  private async convertToManagementApiUserTask(
    userTaskModel: Model.Activities.UserTask,
    userTaskInstance: FlowNodeInstance,
  ): Promise<DataModels.UserTasks.UserTask> {

    const currentUserTaskToken = userTaskInstance.getTokenByType(ProcessTokenType.onSuspend);

    const userTaskTokenOldFormat = await this.getUserTaskTokenInOldFormat(currentUserTaskToken);

    const userTaskFormFields =
      userTaskModel.formFields.map((formField: Model.Activities.Types.UserTaskFormField): DataModels.UserTasks.UserTaskFormField => {
        return this.convertToManagementApiFormField(formField, userTaskTokenOldFormat);
      });

    const userTaskConfig: DataModels.UserTasks.UserTaskConfig = {
      formFields: userTaskFormFields,
      preferredControl: this.evaluateExpressionWithOldToken(userTaskModel.preferredControl, userTaskTokenOldFormat),
      description: userTaskModel.description,
      finishedMessage: userTaskModel.finishedMessage,
    };

    const managementApiUserTask: DataModels.UserTasks.UserTask = {
      id: userTaskInstance.flowNodeId,
      flowNodeInstanceId: userTaskInstance.id,
      name: userTaskModel.name,
      correlationId: userTaskInstance.correlationId,
      processModelId: userTaskInstance.processModelId,
      processInstanceId: userTaskInstance.processInstanceId,
      data: userTaskConfig,
      tokenPayload: currentUserTaskToken.payload,
    };

    return managementApiUserTask;
  }

  private convertToManagementApiFormField(
    formField: Model.Activities.Types.UserTaskFormField,
    oldTokenFormat: any,
  ): DataModels.UserTasks.UserTaskFormField {

    const userTaskFormField = new DataModels.UserTasks.UserTaskFormField();
    userTaskFormField.id = formField.id;
    userTaskFormField.label = this.evaluateExpressionWithOldToken(formField.label, oldTokenFormat);
    userTaskFormField.type = DataModels.UserTasks.UserTaskFormFieldType[formField.type];
    userTaskFormField.enumValues = formField.enumValues;
    userTaskFormField.defaultValue = this.evaluateExpressionWithOldToken(formField.defaultValue, oldTokenFormat);
    userTaskFormField.preferredControl = this.evaluateExpressionWithOldToken(formField.preferredControl, oldTokenFormat);

    return userTaskFormField;
  }

  private evaluateExpressionWithOldToken(expression: string, oldTokenFormat: any): string | null {

    let result: any = expression;

    if (!expression) {
      return result;
    }

    const expressionStartsOn = '${';
    const expressionEndsOn = '}';

    const isExpression = expression.charAt(0) === '$';
    if (isExpression === false) {
      return result;
    }

    const finalExpressionLength = expression.length - expressionStartsOn.length - expressionEndsOn.length;
    const expressionBody = expression.substr(expressionStartsOn.length, finalExpressionLength);

    const functionString = `return ${expressionBody}`;
    const scriptFunction = new Function('token', functionString);

    result = scriptFunction.call(undefined, oldTokenFormat);

    return result;
  }

  private async getUserTaskTokenInOldFormat(currentProcessToken: ProcessToken): Promise<any> {

    const {
      processInstanceId, processModelId, correlationId, identity,
    } = currentProcessToken;

    const processInstanceTokens = await this.flowNodeInstanceService.queryProcessTokensByProcessInstanceId(processInstanceId);

    const filteredInstanceTokens = processInstanceTokens.filter((token: ProcessToken): boolean => {
      return token.type === ProcessTokenType.onExit;
    });

    const processTokenFacade = this.processTokenFacadeFactory.create(processInstanceId, processModelId, correlationId, identity);

    const processTokenResultPromises = filteredInstanceTokens.map(async (processToken: ProcessToken): Promise<IFlowNodeInstanceResult> => {
      const processTokenFlowNodeInstance = await this.flowNodeInstanceService.queryByInstanceId(processToken.flowNodeInstanceId);

      return {
        flowNodeInstanceId: processTokenFlowNodeInstance.id,
        flowNodeId: processTokenFlowNodeInstance.flowNodeId,
        result: processToken.payload,
      };
    });

    const processTokenResults = await Promise.all(processTokenResultPromises);

    processTokenFacade.importResults(processTokenResults);

    return processTokenFacade.getOldTokenFormat();
  }

}
