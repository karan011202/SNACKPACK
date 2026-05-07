// import {inject} from '@loopback/core';
// import {DefaultCrudRepository} from '@loopback/repository';
// import {SnackpackDataSource} from '../datasources';
// // import {Otp, OtpRelations} from '../models';

// export class OtpRepository extends DefaultCrudRepository<
//   Otp,
//   typeof Otp.prototype.id,
//   OtpRelations
// > {
//   constructor(
//     @inject('datasources.snackpack') dataSource: SnackpackDataSource,
//   ) {
//     super(Otp, dataSource);
//   }

//   async findByPhone(phone: string): Promise<Otp | null> {
//     const otps = await this.find({
//       where: {phone},
//       order: ['createdAt DESC'],
//       limit: 1,
//     });
//     return otps.length > 0 ? otps[0] : null;
//   }

//   async deleteExpiredOtps(): Promise<void> {
//     await this.deleteAll({
//       expiresAt: {lt: new Date().toISOString()},
//     });
//   }
// }
