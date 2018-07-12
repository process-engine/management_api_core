import {Event} from '@process-engine/management_api_contracts';
import {Model} from '@process-engine/process_engine_contracts';

export function managementApiEventConverter(event: Model.Events.Event): Event {
  const consumerApiEvent: Event = new Event();
  consumerApiEvent.key = event.id;
  consumerApiEvent.id = event.id;

  return consumerApiEvent;
}
