import * as clone from 'clone';

import {ProcessModel as ConsumerApiProcessModel} from '@process-engine/consumer_api_contracts';
import {ProcessModelExecution} from '@process-engine/management_api_contracts';

export function convertProcessModel(consumerApiProcessModel: ConsumerApiProcessModel, processModelRaw: string): ProcessModelExecution.ProcessModel {

  const processModel: ProcessModelExecution.ProcessModel = <ProcessModelExecution.ProcessModel> clone(consumerApiProcessModel);
  processModel.xml = processModelRaw;

  return processModel;
}
