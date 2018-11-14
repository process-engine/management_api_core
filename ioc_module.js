'use strict';

const ManagementApiService = require('./dist/commonjs/index').ManagementApiService;

function registerInContainer(container) {

  container
    .register('ManagementApiService', ManagementApiService)
    .dependencies(
      'ConsumerApiService',
      'CorrelationService',
      'DeploymentApiService',
      'KpiApiService',
      'LoggingApiService',
      'ProcessModelFacadeFactory',
      'ProcessModelService',
      'TokenHistoryApiService',
      'FlowNodeInstanceService',
      'IamService')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
