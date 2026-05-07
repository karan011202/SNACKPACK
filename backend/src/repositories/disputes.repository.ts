import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {Disputes, DisputesRelations} from '../models';

export class DisputesRepository extends DefaultCrudRepository<
  Disputes,
  typeof Disputes.prototype.id,
  DisputesRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(Disputes, dataSource);
  }
}
