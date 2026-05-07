// import {post, requestBody} from '@loopback/rest';
// import {repository} from '@loopback/repository';
// import {UsersRepository, OtpLogsRepository} from '../repositories';
// import {OtpService} from '../services/otp.service';

// export class AuthController {
//   constructor(
//     @repository(UsersRepository)
//     public usersRepo: UsersRepository,

//     @repository(OtpLogsRepository)
//     public otpRepo: OtpLogsRepository,

//     public otpService: OtpService
//   ) {}

//   @post('/send-otp')
//   async sendOtp(
//     @requestBody() data: {
//       full_name: string;
//       email: string;
//       phone_number: string;
//     }
//   ) {
//     const otp = this.otpService.generateOtp();

//     // 1️⃣ Check user
//     let user = await this.usersRepo.findOne({
//       where: {phone_number: data.phone_number},
//     });

//     // 2️⃣ Create if not exists
//     if (!user) {
//       user = await this.usersRepo.create({
//         ...data,
//         is_verified: false,
//         created_by: 'system',
//         stages: 'N',
//       });
//     }

//     // 3️⃣ Save OTP
//     await this.otpRepo.create({
//       phone_number: data.phone_number,
//       otp_code: otp,
//       otp_expiry: new Date(Date.now() + 5 * 60 * 1000),
//       is_used: false,
//       created_by: 'system',
//     });

//     // 4️⃣ Send OTP
//     await this.otpService.sendSms(data.phone_number, otp);
//     await this.otpService.sendEmail(data.email, otp);

//     return {
//       message: 'OTP sent successfully',
//     };
//   }