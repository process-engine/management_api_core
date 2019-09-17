import {IIdentity} from '@essential-projects/iam_contracts';

import {Correlation, CorrelationProcessInstance, ICorrelationService} from '@process-engine/correlation.contracts';
import {APIs, DataModels} from '@process-engine/management_api_contracts';

import {applyPagination} from './paginator';

export class CorrelationService implements APIs.ICorrelationManagementApi {

  private readonly correlationService: ICorrelationService;

  constructor(correlationService: ICorrelationService) {
    this.correlationService = correlationService;
  }

  public async getAllCorrelations(
    identity: IIdentity,
    offset: number = 0,
    limit: number = 0,
  ): Promise<DataModels.Correlations.CorrelationList> {

    const correlations = await this.correlationService.getAll(identity);

    const managementApiCorrelations = correlations.map(this.mapToPublicCorrelation);

    const paginizedCorrelations = applyPagination(managementApiCorrelations, offset, limit);

    return {correlations: paginizedCorrelations, totalCount: managementApiCorrelations.length};
  }

  public async getActiveCorrelations(
    identity: IIdentity,
    offset: number = 0,
    limit: number = 0,
  ): Promise<DataModels.Correlations.CorrelationList> {

    const activeCorrelations = await this.correlationService.getActive(identity);

    const managementApiCorrelations = activeCorrelations.map(this.mapToPublicCorrelation);

    const paginizedCorrelations = applyPagination(managementApiCorrelations, offset, limit);

    return {correlations: paginizedCorrelations, totalCount: managementApiCorrelations.length};
  }

  public async getCorrelationById(identity: IIdentity, correlationId: string): Promise<DataModels.Correlations.Correlation> {

    const correlationFromProcessEngine = await this.correlationService.getByCorrelationId(identity, correlationId);

    const managementApiCorrelation = this.mapToPublicCorrelation(correlationFromProcessEngine);

    return managementApiCorrelation;
  }

  public async getCorrelationsByProcessModelId(
    identity: IIdentity,
    processModelId: string,
    offset: number = 0,
    limit: number = 0,
  ): Promise<DataModels.Correlations.CorrelationList> {

    const correlations = await this.correlationService.getByProcessModelId(identity, processModelId);

    const managementApiCorrelations = correlations.map(this.mapToPublicCorrelation);

    const paginizedCorrelations = applyPagination(managementApiCorrelations, offset, limit);

    return {correlations: paginizedCorrelations, totalCount: managementApiCorrelations.length};
  }

  public async getCorrelationByProcessInstanceId(identity: IIdentity, processInstanceId: string): Promise<DataModels.Correlations.Correlation> {

    const correlation = await this.correlationService.getByProcessInstanceId(identity, processInstanceId);

    const managementApiCorrelation = this.mapToPublicCorrelation(correlation);

    return managementApiCorrelation;
  }

  private mapToPublicCorrelation(runtimeCorrelation: Correlation): DataModels.Correlations.Correlation {

    const managementApiCorrelation = new DataModels.Correlations.Correlation();
    managementApiCorrelation.id = runtimeCorrelation.id;
    managementApiCorrelation.state = DataModels.Correlations.CorrelationState[runtimeCorrelation.state];
    managementApiCorrelation.error = runtimeCorrelation.error;
    managementApiCorrelation.createdAt = runtimeCorrelation.createdAt;

    managementApiCorrelation.processInstances = runtimeCorrelation
      .processInstances
      .map((runtimeProcessModel: CorrelationProcessInstance): DataModels.Correlations.CorrelationProcessInstance => {

        const managementApiProcessModel = new DataModels.Correlations.CorrelationProcessInstance();

        managementApiProcessModel.processDefinitionName = runtimeProcessModel.processDefinitionName;
        managementApiProcessModel.hash = runtimeProcessModel.hash;
        managementApiProcessModel.xml = runtimeProcessModel.xml;
        managementApiProcessModel.processModelId = runtimeProcessModel.processModelId;
        managementApiProcessModel.processInstanceId = runtimeProcessModel.processInstanceId;
        managementApiProcessModel.parentProcessInstanceId = runtimeProcessModel.parentProcessInstanceId;
        managementApiProcessModel.state = DataModels.Correlations.CorrelationState[runtimeProcessModel.state];
        managementApiProcessModel.error = runtimeProcessModel.error;
        managementApiProcessModel.identity = runtimeProcessModel.identity;
        managementApiProcessModel.createdAt = runtimeProcessModel.createdAt;

        return managementApiProcessModel;
      });

    return managementApiCorrelation;
  }

}
