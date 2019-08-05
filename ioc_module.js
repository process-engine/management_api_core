'use strict';

const {
  NotificationAdapter,
} = require('./dist/commonjs/index');

const {
  CorrelationService,
  CronjobService,
  EmptyActivityService,
  EventService,
  FlowNodeInstanceService,
  KpiService,
  LoggingService,
  ManualTaskService,
  NotificationService,
  ProcessModelService,
  TokenHistoryService,
  UserTaskService,
} = require('./dist/commonjs/index');


function registerInContainer(container) {
  registerConvertersAndAdapters(container);
  registerServices(container);
}

function registerConvertersAndAdapters(container) {

  container
    .register('ManagementApiNotificationAdapter', NotificationAdapter)
    .dependencies('EventAggregator')
    .singleton();
}

function registerServices(container){

  container
    .register('ManagementApiCorrelationService', CorrelationService)
    .dependencies('CorrelationService')
    .singleton();

  container
    .register('ManagementApiCronjobService', CronjobService)
    .dependencies('CronjobService', 'CronjobHistoryService')
    .singleton();

  container
    .register('ManagementApiEmptyActivityService', EmptyActivityService)
    .dependencies('ConsumerApiEmptyActivityService')
    .singleton();

  container
    .register('ManagementApiEventService', EventService)
    .dependencies('ConsumerApiEventService')
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
    .register('ManagementApiManualTaskService', ManualTaskService)
    .dependencies('ConsumerApiManualTaskService')
    .singleton();

  container
    .register('ManagementApiNotificationService', NotificationService)
    .dependencies('IamService', 'ManagementApiNotificationAdapter')
    .singleton();

  container
    .register('ManagementApiProcessModelService', ProcessModelService)
    .dependencies(
      'ConsumerApiProcessModelService',
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
    .dependencies('ConsumerApiUserTaskService')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
