import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {Stores, StoresRelations} from '../models';

export class StoresRepository extends DefaultCrudRepository<
  Stores,
  typeof Stores.prototype.id,
  StoresRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(Stores, dataSource);
  }
}
