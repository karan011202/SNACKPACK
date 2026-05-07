import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'payments'}}
})
export class Payments extends Entity {
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
    postgresql: {columnName: 'order_id', dataType: 'uuid', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  orderId?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'payment_method', dataType: 'USER-DEFINED', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  paymentMethod?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'transaction_id', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  transactionId?: string;

  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 2,
    generated: false,
    postgresql: {columnName: 'amount', dataType: 'numeric', dataLength: null, dataPrecision: 10, dataScale: 2, nullable: 'NO', generated: false},
  })
  amount?: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'status', dataType: 'USER-DEFINED', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  status?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'provider_response', dataType: 'jsonb', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  providerResponse?: string;

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

  constructor(data?: Partial<Payments>) {
    super(data);
  }
}

export interface PaymentsRelations {
  // describe navigational properties here
}

export type PaymentsWithRelations = Payments & PaymentsRelations;
