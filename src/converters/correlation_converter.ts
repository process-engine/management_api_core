import {Correlation} from '@process-engine/management_api_contracts';
import {Runtime} from '@process-engine/process_engine_contracts';

export function managementApiCorrelationConverter(runtimeCorrelation: Runtime.Types.Correlation): Correlation {
  const managementApiCorrelation: Correlation = new Correlation();
  managementApiCorrelation.id = runtimeCorrelation.id;
  managementApiCorrelation.processModelId = runtimeCorrelation.processModelId;

  return managementApiCorrelation;
}
