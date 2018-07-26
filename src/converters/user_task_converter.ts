import {UserTask, UserTaskConfig, UserTaskFormField, UserTaskFormFieldType, UserTaskList} from '@process-engine/management_api_contracts';
import {
  IExecutionContextFacade,
  IProcessModelFacade,
  IProcessModelFacadeFactory,
  IProcessModelService,
  Model,
  Runtime,
} from '@process-engine/process_engine_contracts';

let _processModelFacadeFactory: IProcessModelFacadeFactory;
let _processModelService: IProcessModelService;

export function createUserTaskConverter(processModelFacadeFactory: IProcessModelFacadeFactory,
                                        processModelService: IProcessModelService): Function {

  _processModelFacadeFactory = processModelFacadeFactory;
  _processModelService = processModelService;

  return async(executionContextFacade: IExecutionContextFacade,
               suspendedFlowNodes: Array<Runtime.Types.FlowNodeInstance>,
               processModelId?: string,
              ): Promise<UserTaskList> => {

    const suspendedUserTasks: Array<UserTask> = [];

    for (const suspendedFlowNode of suspendedFlowNodes) {

      if (processModelId && suspendedFlowNode.token.processModelId !== processModelId) {
        continue;
      }

      const userTask: UserTask = await convertSuspendedFlowNodeToUserTask(executionContextFacade, suspendedFlowNode);

      if (userTask === undefined) {
        continue;
      }

      suspendedUserTasks.push(userTask);
    }

    const userTaskList: UserTaskList = {
      userTasks: suspendedUserTasks,
    };

    return userTaskList;
  };
}

async function convertSuspendedFlowNodeToUserTask(executionContextFacade: IExecutionContextFacade,
                                                  flowNodeInstance: Runtime.Types.FlowNodeInstance): Promise<UserTask> {

  const processModel: Model.Types.Process =
    await _processModelService.getProcessModelById(executionContextFacade, flowNodeInstance.token.processModelId);

  const processModelFacade: IProcessModelFacade = _processModelFacadeFactory.create(processModel);
  const userTask: Model.Activities.UserTask = processModelFacade.getFlowNodeById(flowNodeInstance.flowNodeId) as Model.Activities.UserTask;

  return convertToManagementApiUserTask(userTask, flowNodeInstance);
}

function convertToManagementApiUserTask(userTask: Model.Activities.UserTask, flowNodeInstance: Runtime.Types.FlowNodeInstance): UserTask {

  const managementApiFormFields: Array<UserTaskFormField> = userTask.formFields.map((formField: Model.Types.FormField) => {
    return convertToManagementApiFormField(formField);
  });

  const userTaskConfig: UserTaskConfig = {
    formFields: managementApiFormFields,
  };

  const managementApiUserTask: UserTask = {
    key: flowNodeInstance.flowNodeId,
    id: flowNodeInstance.flowNodeId,
    processInstanceId: flowNodeInstance.token.processInstanceId,
    data: userTaskConfig,
    tokenPayload: flowNodeInstance.token.payload,
  };

  return managementApiUserTask;
}

function convertToManagementApiFormField(formField: Model.Types.FormField): UserTaskFormField {

  const userTaskFormField: UserTaskFormField = new UserTaskFormField();
  userTaskFormField.id = formField.id;
  userTaskFormField.label = formField.label;
  userTaskFormField.type = convertToManagementApiFormFieldType(formField.type);
  userTaskFormField.defaultValue = formField.defaultValue;
  userTaskFormField.preferredControl = formField.preferredControl;

  return userTaskFormField;
}

function convertToManagementApiFormFieldType(type: string): UserTaskFormFieldType {
  return UserTaskFormFieldType[type];
}
