import {Event, ProcessModelExecution} from '@process-engine/management_api_contracts';
import {IProcessModelFacade, IProcessModelFacadeFactory, Model} from '@process-engine/process_engine_contracts';

export function createProcessModelConverter(processModelFacadeFactory: IProcessModelFacadeFactory): Function {

  return (processModel: Model.Types.Process, processModelRaw: string): ProcessModelExecution.ProcessModel => {

    const processModelFacade: IProcessModelFacade = processModelFacadeFactory.create(processModel);

    function managementApiEventConverter(event: Model.Events.Event): Event {
      const managementApiEvent: Event = new Event();
      managementApiEvent.key = event.id;
      managementApiEvent.id = event.id;

      return managementApiEvent;
    }

    let managementApiStartEvents: Array<Event> = [];
    let managementApiEndEvents: Array<Event> = [];

    const processModelIsExecutable: boolean = processModelFacade.getIsExecutable();

    if (processModelIsExecutable) {
      const startEvents: Array<Model.Events.StartEvent> = processModelFacade.getStartEvents();
      managementApiStartEvents = startEvents.map(managementApiEventConverter);

      const endEvents: Array<Model.Events.EndEvent> = processModelFacade.getEndEvents();
      managementApiEndEvents = endEvents.map(managementApiEventConverter);
    }

    const processModelResponse: ProcessModelExecution.ProcessModel = {
      key: processModel.id,
      xml: processModelRaw,
      startEvents: managementApiStartEvents,
      endEvents: managementApiEndEvents,
    };

    return processModelResponse;
  };
}
