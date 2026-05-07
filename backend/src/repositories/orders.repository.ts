import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {Orders, OrdersRelations} from '../models';

export class OrdersRepository extends DefaultCrudRepository<
  Orders,
  typeof Orders.prototype.id,
  OrdersRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(Orders, dataSource);
  }
}
