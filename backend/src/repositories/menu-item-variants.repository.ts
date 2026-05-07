import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {MenuItemVariants, MenuItemVariantsRelations} from '../models';

export class MenuItemVariantsRepository extends DefaultCrudRepository<
  MenuItemVariants,
  typeof MenuItemVariants.prototype.id,
  MenuItemVariantsRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(MenuItemVariants, dataSource);
  }
}
