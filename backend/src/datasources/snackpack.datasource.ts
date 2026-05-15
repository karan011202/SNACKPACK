import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'snackpack',
  connector: 'postgresql',
  host: 'snackpack-database.cfuau40w2blx.ap-south-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'Ka7ee466b2',
  database: 'SNACKPACK'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class SnackpackDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'snackpack';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.snackpack', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
