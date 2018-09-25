import {Correlation, CorrelationState, ProcessModelExecution} from '@process-engine/management_api_contracts';
import {Runtime} from '@process-engine/process_engine_contracts';

export function managementApiCorrelationConverter(runtimeCorrelation: Runtime.Types.Correlation): Correlation {

  const managementApiCorrelation: Correlation = new Correlation();
  managementApiCorrelation.id = runtimeCorrelation.id;
  managementApiCorrelation.state = CorrelationState[runtimeCorrelation.state];
  managementApiCorrelation.createdAt = runtimeCorrelation.createdAt;

  managementApiCorrelation.processModels =
    runtimeCorrelation.processModels.map((runtimeProcessModel: any): any => {
      const managementApiProcessModel: ProcessModelExecution.ProcessModel = new ProcessModelExecution.ProcessModel();
      managementApiProcessModel.id = runtimeProcessModel.name;
      managementApiProcessModel.xml = runtimeProcessModel.xml;

      return managementApiProcessModel;
    });

  return managementApiCorrelation;
}
