import * as clone from 'clone';

import {DataModels as ConsumerApiTypes} from '@process-engine/consumer_api_contracts';
import {DataModels} from '@process-engine/management_api_contracts';

export function convertProcessModel(
  consumerApiProcessModel: ConsumerApiTypes.ProcessModels.ProcessModel,
  processModelRaw: string,
): DataModels.ProcessModels.ProcessModel {

  const processModel: DataModels.ProcessModels.ProcessModel = <DataModels.ProcessModels.ProcessModel> clone(consumerApiProcessModel);
  processModel.xml = processModelRaw;

  return processModel;
}
