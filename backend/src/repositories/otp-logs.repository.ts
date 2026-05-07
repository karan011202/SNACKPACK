import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SnackpackDataSource} from '../datasources';
import {OtpLogs, OtpLogsRelations} from '../models';


export class OtpLogsRepository extends DefaultCrudRepository<
  OtpLogs,
  typeof OtpLogs.prototype.otpId,
  OtpLogsRelations
> {
  constructor(
    @inject('datasources.snackpack') dataSource: SnackpackDataSource,
  ) {
    super(OtpLogs, dataSource);
  }
  async findByPhone(phoneNumber: string): Promise<OtpLogs | null> {
      const otps = await this.find({
        where: {phoneNumber},
        order: ['createdOnServer DESC'],
        limit: 1,
      });
      return otps.length > 0 ? otps[0] : null;
    }
   
   
    async deleteExpiredOtps(): Promise<void> {
    await this.deleteAll({
      otpExpiry: {lt: new Date().toISOString()},
    });
  }
}
