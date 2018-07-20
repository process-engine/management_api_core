import {Event} from '@process-engine/management_api_contracts';
import {Model} from '@process-engine/process_engine_contracts';

export function managementApiEventConverter(event: Model.Events.Event): Event {
  const managementApiEvent: Event = new Event();
  managementApiEvent.key = event.id;
  managementApiEvent.id = event.id;

  return managementApiEvent;
}
