'use strict';

const ManagementApiService = require('./dist/commonjs/index').ManagementApiService;

function registerInContainer(container) {

  container
    .register('ManagementApiService', ManagementApiService)
    .dependencies(
      'ConsumerApiService',
      'CorrelationService',
      'DeploymentApiService',
      'ExecutionContextFacadeFactory',
      'ProcessModelFacadeFactory',
      'ProcessModelService')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
