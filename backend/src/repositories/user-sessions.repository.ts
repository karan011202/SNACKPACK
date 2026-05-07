import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {UserSessions, UserSessionsRelations} from '../models';

export class UserSessionsRepository extends DefaultCrudRepository<
  UserSessions,
  typeof UserSessions.prototype.id,
  UserSessionsRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(UserSessions, dataSource);
  }
}
