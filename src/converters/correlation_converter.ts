import {DataModels as ManagementApiTypes} from '@process-engine/management_api_contracts';
import {Runtime} from '@process-engine/process_engine_contracts';

export function managementApiCorrelationConverter(runtimeCorrelation: Runtime.Types.Correlation): ManagementApiTypes.Correlations.Correlation {

  const managementApiCorrelation: ManagementApiTypes.Correlations.Correlation = new ManagementApiTypes.Correlations.Correlation();
  managementApiCorrelation.id = runtimeCorrelation.id;
  managementApiCorrelation.state = ManagementApiTypes.Correlations.CorrelationState[runtimeCorrelation.state];
  managementApiCorrelation.error = runtimeCorrelation.error;
  managementApiCorrelation.identity = runtimeCorrelation.identity;
  managementApiCorrelation.createdAt = runtimeCorrelation.createdAt;

  managementApiCorrelation.processModels =
    runtimeCorrelation.processModels.map((runtimeProcessModel: Runtime.Types.CorrelationProcessInstance): any => {

      const managementApiProcessModel: ManagementApiTypes.Correlations.CorrelationProcessModel =
        new ManagementApiTypes.Correlations.CorrelationProcessModel();

      managementApiProcessModel.processDefinitionName = runtimeProcessModel.processDefinitionName;
      managementApiProcessModel.hash = runtimeProcessModel.hash;
      managementApiProcessModel.xml = runtimeProcessModel.xml;
      managementApiProcessModel.processModelId = runtimeProcessModel.processModelId;
      managementApiProcessModel.processInstanceId = runtimeProcessModel.processInstanceId;
      managementApiProcessModel.parentProcessInstanceId = runtimeProcessModel.parentProcessInstanceId;
      managementApiProcessModel.state = ManagementApiTypes.Correlations.CorrelationState[runtimeProcessModel.state];
      managementApiProcessModel.error = managementApiProcessModel.error;
      managementApiProcessModel.createdAt = runtimeProcessModel.createdAt;

      return managementApiProcessModel;
    });

  return managementApiCorrelation;
}
