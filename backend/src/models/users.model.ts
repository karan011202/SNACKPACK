import {Entity, model, property} from '@loopback/repository';

@model({settings: {idInjection: false, postgresql: {schema: 'public', table: 'users'}}})
export class Users extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'user_id'},
  })
  userId?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'full_name'},
  })
  fullName!: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'phone_number'},
  })
  phoneNumber!: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'email'},
  })
  email?: string;

  @property({
    type: 'boolean',
    default: false,
    postgresql: {columnName: 'is_verified'},
  })
  isVerified?: boolean;

  @property({
    type: 'boolean',
    default: true,
    postgresql: {columnName: 'is_active'},
  })
  isActive?: boolean;

  @property({
    type: 'boolean',
    default: true,
    postgresql: {columnName: 'valid_flag'},
  })
  validFlag?: boolean;

  @property({
    type: 'date',
    postgresql: {columnName: 'created_on_server'},
  })
  createdOnServer?: Date;
  @property({
  type: 'string',
  postgresql: {columnName: 'stages'},
})
stages?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'created_by'},
  })
  createdBy?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Users>) {
    super(data);
  }
}

export interface UsersRelations {
  // describe navigational properties here
}

export type UsersWithRelations = Users & UsersRelations;
