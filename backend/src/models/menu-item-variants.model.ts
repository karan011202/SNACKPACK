import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'menu_item_variants'}
  }
})
export class MenuItemVariants extends Entity {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    id: 1,
    postgresql: {columnName: 'id', dataType: 'uuid', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  id?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'menu_item_id', dataType: 'uuid', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  menuItemId?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    postgresql: {columnName: 'name', dataType: 'character varying', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  name?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 2,
    generated: false,
    postgresql: {columnName: 'price', dataType: 'numeric', dataLength: null, dataPrecision: 10, dataScale: 2, nullable: 'YES', generated: false},
  })
  price?: number;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'created_on_server', dataType: 'timestamp without time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  createdOnServer?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    postgresql: {columnName: 'created_by', dataType: 'character varying', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  createdBy?: string;

  @property({
    type: 'boolean',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'valid_flag', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  validFlag?: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<MenuItemVariants>) {
    super(data);
  }
}

export interface MenuItemVariantsRelations {
  // describe navigational properties here
}

export type MenuItemVariantsWithRelations = MenuItemVariants & MenuItemVariantsRelations;
