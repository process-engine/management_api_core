const {
  EmptyActivityConverter,
  EventConverter,
  ManualTaskConverter,
  NotificationAdapter,
  UserTaskConverter,
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

  container
    .register('ManagementApiEmptyActivityConverter', EmptyActivityConverter)
    .dependencies('CorrelationService', 'ProcessModelFacadeFactory', 'ProcessModelUseCases')
    .singleton();

  container
    .register('ManagementApiEventConverter', EventConverter)
    .dependencies('CorrelationService', 'ProcessModelFacadeFactory', 'ProcessModelUseCases')
    .singleton();

  container
    .register('ManagementApiUserTaskConverter', UserTaskConverter)
    .dependencies('CorrelationService', 'FlowNodeInstanceService', 'ProcessModelFacadeFactory', 'ProcessModelUseCases', 'ProcessTokenFacadeFactory')
    .singleton();

  container
    .register('ManagementApiManualTaskConverter', ManualTaskConverter)
    .dependencies('CorrelationService', 'ProcessModelFacadeFactory', 'ProcessModelUseCases')
    .singleton();
}

function registerServices(container) {

  container
    .register('ManagementApiCorrelationService', CorrelationService)
    .dependencies('CorrelationService')
    .singleton();

  container
    .register('ManagementApiCronjobService', CronjobService)
    .dependencies('CronjobService', 'CronjobHistoryService', 'IamService', 'ManagementApiNotificationAdapter')
    .singleton();

  container
    .register('ManagementApiEmptyActivityService', EmptyActivityService)
    .dependencies(
      'EventAggregator',
      'FlowNodeInstanceService',
      'IamService',
      'ManagementApiNotificationAdapter',
      'ManagementApiEmptyActivityConverter',
    )
    .singleton();

  container
    .register('ManagementApiEventService', EventService)
    .dependencies(
      'EventAggregator',
      'FlowNodeInstanceService',
      'IamService',
      'ProcessModelUseCases',
      'ManagementApiEventConverter',
    )
    .singleton();

  container
    .register('ManagementApiFlowNodeInstanceService', FlowNodeInstanceService)
    .dependencies(
      'FlowNodeInstanceService',
      'ManagementApiEmptyActivityConverter',
      'ManagementApiManualTaskConverter',
      'ManagementApiUserTaskConverter',
    )
    .singleton();

  container
    .register('ManagementApiKpiService', KpiService)
    .dependencies('FlowNodeInstanceRepository', 'IamService', 'MetricsApiService')
    .singleton();

  container
    .register('ManagementApiLoggingService', LoggingService)
    .dependencies('LoggingApiService')
    .singleton();

  container
    .register('ManagementApiManualTaskService', ManualTaskService)
    .dependencies(
      'EventAggregator',
      'FlowNodeInstanceService',
      'IamService',
      'ManagementApiNotificationAdapter',
      'ManagementApiManualTaskConverter',
    )
    .singleton();

  container
    .register('ManagementApiNotificationService', NotificationService)
    .dependencies('IamService', 'ManagementApiNotificationAdapter')
    .singleton();

  container
    .register('ManagementApiProcessModelService', ProcessModelService)
    .dependencies(
      'CronjobService',
      'EventAggregator',
      'ExecuteProcessService',
      'IamService',
      'ProcessModelFacadeFactory',
      'ProcessModelUseCases',
      'ManagementApiNotificationAdapter',
    )
    .singleton();

  container
    .register('ManagementApiTokenHistoryService', TokenHistoryService)
    .dependencies('IamService', 'FlowNodeInstanceRepository')
    .singleton();

  container
    .register('ManagementApiUserTaskService', UserTaskService)
    .dependencies(
      'EventAggregator',
      'FlowNodeInstanceService',
      'IamService',
      'ManagementApiNotificationAdapter',
      'ManagementApiUserTaskConverter',
    )
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
