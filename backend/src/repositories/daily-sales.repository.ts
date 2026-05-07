import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {DailySales, DailySalesRelations} from '../models';

export class DailySalesRepository extends DefaultCrudRepository<
  DailySales,
  typeof DailySales.prototype.id,
  DailySalesRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(DailySales, dataSource);
  }
}
