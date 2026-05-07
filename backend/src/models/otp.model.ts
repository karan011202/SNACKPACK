import {Entity, model, property} from '@loopback/repository';

@model({settings: {idInjection: false, postgresql: {schema: 'public', table: 'otps'}}})
export class Otp extends Entity {
  @property({
    type: 'string',
    required: true,
    id: 1,
    generated: false,
    postgresql: {columnName: 'id', dataType: 'uuid', nullable: 'NO'},
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    length: 15,
    generated: false,
    postgresql: {columnName: 'phone', dataType: 'character varying', dataLength: 15, nullable: 'NO'},
  })
  phone?: string;

  @property({
    type: 'string',
    required: true,
    length: 6,
    generated: false,
    postgresql: {columnName: 'otp_code', dataType: 'character varying', dataLength: 6, nullable: 'NO'},
  })
  otpCode?: string;

  @property({
    type: 'number',
    required: true,
    generated: false,
    postgresql: {columnName: 'attempts', dataType: 'integer', nullable: 'NO'},
  })
  attempts?: number;

  @property({
    type: 'boolean',
    required: true,
    generated: false,
    postgresql: {columnName: 'is_verified', dataType: 'boolean', nullable: 'NO'},
  })
  isVerified?: boolean;

  @property({
    type: 'date',
    required: true,
    generated: false,
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  createdAt?: string;

  @property({
    type: 'date',
    required: true,
    generated: false,
    postgresql: {columnName: 'expires_at', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  expiresAt?: string;

  constructor(data?: Partial<Otp>) {
    super(data);
  }
}

export interface OtpRelations {
  // describe navigational properties here
}

export type OtpWithRelations = Otp & OtpRelations;
