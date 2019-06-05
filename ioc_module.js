'use strict';

const ManagementApiService = require('./dist/commonjs/index').ManagementApiService;

function registerInContainer(container) {

  container
    .register('ManagementApiService', ManagementApiService)
    .dependencies(
      'ConsumerApiService',
      'CorrelationService',
      'DeploymentApiService',
      'EventAggregator',
      'FlowNodeInstanceService',
      'IamService',
      'KpiApiService',
      'LoggingApiService',
      'ProcessModelFacadeFactory',
      'ProcessModelUseCases',
      'TokenHistoryApiService')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
