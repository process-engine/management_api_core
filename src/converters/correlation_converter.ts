import {Correlation, CorrelationProcessInstance} from '@process-engine/correlation.contracts';
import {DataModels as ManagementApiTypes} from '@process-engine/management_api_contracts';

export function managementApiCorrelationConverter(runtimeCorrelation: Correlation): ManagementApiTypes.Correlations.Correlation {

  const managementApiCorrelation = new ManagementApiTypes.Correlations.Correlation();
  managementApiCorrelation.id = runtimeCorrelation.id;
  managementApiCorrelation.state = ManagementApiTypes.Correlations.CorrelationState[runtimeCorrelation.state];
  managementApiCorrelation.error = runtimeCorrelation.error;
  managementApiCorrelation.createdAt = runtimeCorrelation.createdAt;

  managementApiCorrelation.processInstances = runtimeCorrelation
    .processInstances
    .map((runtimeProcessModel: CorrelationProcessInstance): ManagementApiTypes.Correlations.CorrelationProcessInstance => {

      const managementApiProcessModel = new ManagementApiTypes.Correlations.CorrelationProcessInstance();

      managementApiProcessModel.processDefinitionName = runtimeProcessModel.processDefinitionName;
      managementApiProcessModel.hash = runtimeProcessModel.hash;
      managementApiProcessModel.xml = runtimeProcessModel.xml;
      managementApiProcessModel.processModelId = runtimeProcessModel.processModelId;
      managementApiProcessModel.processInstanceId = runtimeProcessModel.processInstanceId;
      managementApiProcessModel.parentProcessInstanceId = runtimeProcessModel.parentProcessInstanceId;
      managementApiProcessModel.state = ManagementApiTypes.Correlations.CorrelationState[runtimeProcessModel.state];
      managementApiProcessModel.error = runtimeProcessModel.error;
      managementApiProcessModel.identity = runtimeProcessModel.identity;
      managementApiProcessModel.createdAt = runtimeProcessModel.createdAt;

      return managementApiProcessModel;
    });

  return managementApiCorrelation;
}
