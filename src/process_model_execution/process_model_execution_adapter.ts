import {
  EndEventReachedMessage,
  IExecuteProcessService,
  IExecutionContextFacade,
  IProcessModelService,
  Model,
} from '@process-engine/process_engine_contracts';

import {ProcessModelExecution} from '@process-engine/management_api_contracts';

import * as uuid from 'uuid';

export interface IProcessModelExecutionAdapter {
  startProcessInstance(executionContextFacade: IExecutionContextFacade,
                       processModelId: string,
                       startEventId: string,
                       payload: ProcessModelExecution.ProcessStartRequestPayload,
                       startCallbackType: ProcessModelExecution.StartCallbackType,
                       endEventId?: string): Promise<ProcessModelExecution.ProcessStartResponsePayload>;
}

// TODO: When running processes, we need to pass full process model to the ExecuteProcessService.
// Right now, this can only be achieved, if all claim checks against the persistence service pass, regardless of who makes the request.
// To that end, this adapter - and this adapter ONLY! - will have to use a mock for the IAM facade,
// until the consumer api is able to authenticate itself against the external authority.
export class ProcessModelExecutionAdapter implements IProcessModelExecutionAdapter {

  private _executeProcessService: IExecuteProcessService;
  private _processModelService: IProcessModelService;

  constructor(executeProcessService: IExecuteProcessService,
              processModelService: IProcessModelService) {

    this._executeProcessService = executeProcessService;
    this._processModelService = processModelService;
  }

  private get executeProcessService(): IExecuteProcessService {
    return this._executeProcessService;
  }

  private get processModelService(): IProcessModelService {
    return this._processModelService;
  }

  public async startProcessInstance(executionContextFacade: IExecutionContextFacade,
                                    processModelId: string,
                                    startEventId: string,
                                    payload: ProcessModelExecution.ProcessStartRequestPayload,
                                    startCallbackType: ProcessModelExecution.StartCallbackType =
                                      ProcessModelExecution.StartCallbackType.CallbackOnProcessInstanceCreated,
                                    endEventId?: string): Promise<ProcessModelExecution.ProcessStartResponsePayload> {

    const correlationId: string = payload.correlationId || uuid.v4();

    // Uses the mock IAM facade with the processModelService => The process model will always be complete.
    const processModel: Model.Types.Process = await this.processModelService.getProcessModelById(executionContextFacade, processModelId);

    const response: ProcessModelExecution.ProcessStartResponsePayload = await this._startProcessInstance(executionContextFacade,
                                                                                   correlationId,
                                                                                   processModel,
                                                                                   startEventId,
                                                                                   payload,
                                                                                   startCallbackType,
                                                                                   endEventId);

    return response;
  }

  private async _startProcessInstance(executionContextFacade: IExecutionContextFacade,
                                      correlationId: string,
                                      processModel: Model.Types.Process,
                                      startEventId: string,
                                      payload: ProcessModelExecution.ProcessStartRequestPayload,
                                      startCallbackType: ProcessModelExecution.StartCallbackType =
                                        ProcessModelExecution.StartCallbackType.CallbackOnProcessInstanceCreated,
                                      endEventId?: string,
                                    ): Promise<ProcessModelExecution.ProcessStartResponsePayload> {

    const response: ProcessModelExecution.ProcessStartResponsePayload = {
      correlationId: correlationId,
    };

    // Only start the process instance and return
    const resolveImmediatelyAfterStart: boolean = startCallbackType === ProcessModelExecution.StartCallbackType.CallbackOnProcessInstanceCreated;
    if (resolveImmediatelyAfterStart) {
      this.executeProcessService.start(executionContextFacade, processModel, startEventId, correlationId, payload.inputValues);

      return response;
    }

    let endEventReachedMessage: EndEventReachedMessage;

    // Start the process instance and wait for a specific end event result
    const resolveAfterReachingSpecificEndEvent: boolean = startCallbackType === ProcessModelExecution.StartCallbackType.CallbackOnEndEventReached;
    if (resolveAfterReachingSpecificEndEvent) {
      endEventReachedMessage = await this.executeProcessService.startAndAwaitSpecificEndEvent(executionContextFacade,
                                                                                              processModel,
                                                                                              startEventId,
                                                                                              correlationId,
                                                                                              endEventId,
                                                                                              payload.inputValues);

      response.endEventId = endEventReachedMessage.endEventId;
      response.tokenPayload = endEventReachedMessage.tokenPayload;

      return response;
    }

    // Start the process instance and wait for the first end event result
    endEventReachedMessage = await this.executeProcessService.startAndAwaitEndEvent(executionContextFacade,
                                                                                    processModel,
                                                                                    startEventId,
                                                                                    correlationId,
                                                                                    payload.inputValues);

    response.endEventId = endEventReachedMessage.endEventId;
    response.tokenPayload = endEventReachedMessage.tokenPayload;

    return response;
  }
}
