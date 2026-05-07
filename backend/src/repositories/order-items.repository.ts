import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {OrderItems, OrderItemsRelations} from '../models';

export class OrderItemsRepository extends DefaultCrudRepository<
  OrderItems,
  typeof OrderItems.prototype.id,
  OrderItemsRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(OrderItems, dataSource);
  }
}
