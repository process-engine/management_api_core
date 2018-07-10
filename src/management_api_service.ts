import * as EssentialProjectErrors from '@essential-projects/errors_ts';
import {IIdentity} from '@essential-projects/iam_contracts';
import {
  IManagementApiService,
  ManagementContext,
  ProcessModelExecution,
} from '@process-engine/management_api_contracts';
import {
  ExecutionContext,
  IExecutionContextFacade,
  IExecutionContextFacadeFactory,
  IProcessModelService,
  Model,
} from '@process-engine/process_engine_contracts';

import {IProcessModelExecutionAdapter} from './process_model_execution/index';

export class ManagementApiService implements IManagementApiService {
  public config: any = undefined;

  private _executionContextFacadeFactory: IExecutionContextFacadeFactory;
  private _processModelExecutionAdapter: IProcessModelExecutionAdapter;
  private _processModelService: IProcessModelService;

  constructor(executionContextFacadeFactory: IExecutionContextFacadeFactory,
              processModelExecutionAdapter: IProcessModelExecutionAdapter,
              processModelService: IProcessModelService) {

    this._executionContextFacadeFactory = executionContextFacadeFactory;
    this._processModelExecutionAdapter = processModelExecutionAdapter;
    this._processModelService = processModelService;
  }

  private get executionContextFacadeFactory(): IExecutionContextFacadeFactory {
    return this._executionContextFacadeFactory;
  }

  private get processModelExecutionAdapter(): IProcessModelExecutionAdapter {
    return this._processModelExecutionAdapter;
  }

  private get processModelService(): IProcessModelService {
    return this._processModelService;
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

}
