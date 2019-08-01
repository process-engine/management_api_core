'use strict';

const {
  CorrelationService,
  CronjobService,
  EventService,
  EmptyActivityService,
  FlowNodeInstanceService,
  KpiService,
  LoggingService,
  NotificationService,
  ManualTaskService,
  ProcessModelService,
  TokenHistoryService,
  UserTaskService,
} = require('./dist/commonjs/index');

function registerInContainer(container) {

  container
    .register('ManagementApiCorrelationService', CorrelationService)
    .dependencies('CorrelationService')
    .singleton();

  container
    .register('ManagementApiCronjobService', CronjobService)
    .dependencies('CronjobService', 'CronjobHistoryService')
    .singleton();

  container
    .register('ManagementApiEventService', EventService)
    .dependencies('ConsumerApiService')
    .singleton();

  container
    .register('ManagementApiEmptyActivityService', EmptyActivityService)
    .dependencies('ConsumerApiService')
    .singleton();

  container
    .register('ManagementApiFlowNodeInstanceService', FlowNodeInstanceService)
    .dependencies('FlowNodeInstanceService')
    .singleton();

  container
    .register('ManagementApiKpiService', KpiService)
    .dependencies('KpiApiService')
    .singleton();

  container
    .register('ManagementApiLoggingService', LoggingService)
    .dependencies('LoggingApiService')
    .singleton();

  container
    .register('ManagementApiNotificationService', NotificationService)
    .dependencies('ConsumerApiService')
    .singleton();

  container
    .register('ManagementApiManualTaskService', ManualTaskService)
    .dependencies('ConsumerApiService')
    .singleton();

  container
    .register('ManagementApiProcessModelService', ProcessModelService)
    .dependencies(
      'ConsumerApiService',
      'CronjobService',
      'EventAggregator',
      'IamService',
      'ProcessModelFacadeFactory',
      'ProcessModelUseCases')
    .singleton();

  container
    .register('ManagementApiTokenHistoryService', TokenHistoryService)
    .dependencies('TokenHistoryApiService')
    .singleton();

  container
    .register('ManagementApiUserTaskService', UserTaskService)
    .dependencies('ConsumerApiService')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
