import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'otp_logs'}}
})
export class OtpLogs extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'otp_id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO', generated: false},
  })
  otpId?: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 15,
    generated: false,
    postgresql: {columnName: 'phone_number', dataType: 'character varying', dataLength: 15, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  phoneNumber?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 6,
    generated: false,
    postgresql: {columnName: 'otp_code', dataType: 'character varying', dataLength: 6, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  otpCode?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'otp_expiry', dataType: 'timestamp without time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  otpExpiry?: string;

  @property({
    type: 'boolean',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'is_used', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  isUsed?: boolean;

  @property({
    type: 'boolean',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'is_active', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  isActive?: boolean;

  @property({
    type: 'boolean',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'valid_flag', dataType: 'boolean', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  validFlag?: boolean;

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

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<OtpLogs>) {
    super(data);
  }
}

export interface OtpLogsRelations {
  // describe navigational properties here
}

export type OtpLogsWithRelations = OtpLogs & OtpLogsRelations;
