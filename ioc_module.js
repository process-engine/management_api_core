'use strict';

const ManagementApiService = require('./dist/commonjs/index').ManagementApiService;

function registerInContainer(container) {

  container
    .register('ManagementApiService', ManagementApiService)
    .dependencies(
      'ConsumerApiService',
      'CorrelationService',
      'DeploymentApiService',
      'FlowNodeInstanceService',
      'IamService',
      'KpiApiService',
      'LoggingApiService',
      'ProcessModelFacadeFactory',
      'ProcessModelService',
      'TokenHistoryApiService')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
