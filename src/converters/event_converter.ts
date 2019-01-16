import {DataModels as ManagementApiTypes} from '@process-engine/management_api_contracts';
import {Model} from '@process-engine/process_engine_contracts';

export function managementApiEventConverter(event: Model.Events.Event): ManagementApiTypes.Events.Event {
  const managementApiEvent: ManagementApiTypes.Events.Event = new ManagementApiTypes.Events.Event();
  managementApiEvent.id = event.id;

  return managementApiEvent;
}
