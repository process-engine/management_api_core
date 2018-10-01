import {Correlation, CorrelationProcessModel, CorrelationState} from '@process-engine/management_api_contracts';
import {Runtime} from '@process-engine/process_engine_contracts';

export function managementApiCorrelationConverter(runtimeCorrelation: Runtime.Types.Correlation): Correlation {

  const managementApiCorrelation: Correlation = new Correlation();
  managementApiCorrelation.id = runtimeCorrelation.id;
  managementApiCorrelation.state = CorrelationState[runtimeCorrelation.state];
  managementApiCorrelation.identity = runtimeCorrelation.identity;
  managementApiCorrelation.createdAt = runtimeCorrelation.createdAt;

  managementApiCorrelation.processModels =
    runtimeCorrelation.processModels.map((runtimeProcessModel: any): any => {

      const managementApiProcessModel: CorrelationProcessModel = new CorrelationProcessModel();
      managementApiProcessModel.name = runtimeProcessModel.name;
      managementApiProcessModel.hash = runtimeProcessModel.hash;
      managementApiProcessModel.xml = runtimeProcessModel.xml;
      managementApiProcessModel.processInstanceId = runtimeProcessModel.processInstanceId;
      managementApiProcessModel.createdAt = runtimeProcessModel.createdAt;

      return managementApiProcessModel;
    });

  return managementApiCorrelation;
}
