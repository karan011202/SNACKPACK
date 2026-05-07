import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'daily_sales'}}
})
export class DailySales extends Entity {
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
    postgresql: {columnName: 'store_id', dataType: 'uuid', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  storeId?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'date', dataType: 'date', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  date?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'total_orders', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  totalOrders?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 2,
    generated: false,
    postgresql: {columnName: 'total_revenue', dataType: 'numeric', dataLength: null, dataPrecision: 10, dataScale: 2, nullable: 'YES', generated: false},
  })
  totalRevenue?: number;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'created_on_server', dataType: 'timestamp without time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  createdOnServer?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'created_on_client', dataType: 'timestamp without time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  createdOnClient?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    postgresql: {columnName: 'created_by', dataType: 'character varying', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  createdBy?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'modified_on_server', dataType: 'timestamp without time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  modifiedOnServer?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'modified_on_client', dataType: 'timestamp without time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  modifiedOnClient?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    postgresql: {columnName: 'modified_by', dataType: 'character varying', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  modifiedBy?: string;

  @property({
    type: 'boolean',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'used_flag', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  usedFlag?: boolean;

  @property({
    type: 'boolean',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'valid_flag', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  validFlag?: boolean;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 1,
    generated: false,
    postgresql: {columnName: 'stages', dataType: 'character', dataLength: 1, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  stages?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<DailySales>) {
    super(data);
  }
}

export interface DailySalesRelations {
  // describe navigational properties here
}

export type DailySalesWithRelations = DailySales & DailySalesRelations;
