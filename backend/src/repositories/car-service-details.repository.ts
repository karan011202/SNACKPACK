import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {CarServiceDetails, CarServiceDetailsRelations} from '../models';

export class CarServiceDetailsRepository extends DefaultCrudRepository<
  CarServiceDetails,
  typeof CarServiceDetails.prototype.id,
  CarServiceDetailsRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(CarServiceDetails, dataSource);
  }
}
