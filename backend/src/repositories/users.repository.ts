import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {Users, UsersRelations} from '../models';

export class UsersRepository extends DefaultCrudRepository<
  Users,
  typeof Users.prototype.user_id,
  UsersRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(Users, dataSource);
  }
}
