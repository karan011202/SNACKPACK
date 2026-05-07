import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {MenuItems, MenuItemsRelations} from '../models';

export class MenuItemsRepository extends DefaultCrudRepository<
  MenuItems,
  typeof MenuItems.prototype.id,
  MenuItemsRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(MenuItems, dataSource);
  }
}
