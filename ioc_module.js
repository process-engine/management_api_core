'use strict';

const ManagementApiService = require('./dist/commonjs/index').ManagementApiService;
const ProcessModelExecution = require('./dist/commonjs/index').ManagementApi.ProcessModelExecution;

function registerInContainer(container) {

  container
    .register('ManagementApiProcessModelExecutionAdapter', ProcessModelExecution.ProcessModelExecutionAdapter)
    .dependencies('ExecuteProcessService', 'ProcessModelService')
    .singleton();

  container
    .register('ManagementApiService', ManagementApiService)
    .dependencies(
      'CorrelationService',
      'EventAggregator',
      'ExecutionContextFacadeFactory',
      'FlowNodeInstanceService',
      'ProcessModelFacadeFactory',
      'ManagementApiProcessModelExecutionAdapter',
      'ProcessModelService')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
