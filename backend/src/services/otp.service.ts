import {OtpLogsRepository, UsersRepository} from '../repositories';
import {EmailService} from './email.service';

import {repository} from '@loopback/repository';

export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    private otpLogsRepository: OtpLogsRepository,
    private usersRepository: UsersRepository, // ✅ NEW
    private emailService: EmailService,
  ) {}

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateOtpId(): number {
    return Math.floor(Math.random() * 2147483647);
  }

  /**
   * ✅ SEND OTP + STORE USER
   */
  async sendOtp(
    phone: string,
    email: string,
    name: string,
  ): Promise<{success: boolean; message: string}> {
    try {
      // 🔹 1. CHECK / CREATE USER
      let user = await this.usersRepository.findOne({
        where: {phoneNumber: phone},
      });

      if (!user) {
        // ✅ Create user
        user = await this.usersRepository.create({
          fullName: name,
          email: email,
          phoneNumber: phone,

          isVerified: false,
          isActive: true,
          validFlag: true,
          stages: 'N',

          createdOnServer: new Date(),
          createdBy: 'system',
        });
      }
      else {
        // ✅ Update user (if info changed)
        await this.usersRepository.updateById(user.userId, {
          fullName: name,
          email: email,
          modifiedOnServer: new Date(),
          modifiedBy: 'system',
        });
      }

      // 🔹 2. DELETE OLD OTP
      const existingOtp = await this.otpLogsRepository.findByPhone(phone);
      if (existingOtp?.otpId !== undefined) {
        await this.otpLogsRepository.deleteById(existingOtp.otpId);
      }

      // 🔹 3. GENERATE OTP
      const otpCode = this.generateOtpCode();
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + this.OTP_EXPIRY_MINUTES * 60000,
      );

      // 🔹 4. SAVE OTP
      await this.otpLogsRepository.create({
        otpId: this.generateOtpId(),
        phoneNumber: phone,
        otpCode,
        otpExpiry: expiresAt.toISOString(),
        isUsed: false,
        isActive: true,
        validFlag: true,
        createdOnServer: now.toISOString(),
        createdBy: 'system',
      });

      // 🔹 5. SEND EMAIL
      await this.emailService.sendMail({
        from: 'karansingh06949@gmail.com',
        to: email,
        subject: 'Your OTP for SNACKPACK Login',
        html: this.generateOtpHtml(name, otpCode, phone),
      });

      return {
        success: true,
        message: 'OTP sent & user stored successfully',
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  }

  /**
   * ✅ VERIFY OTP + MARK USER VERIFIED
   */
  async verifyOtp(
    phone: string,
    otpCode: string,
  ): Promise<{success: boolean; message: string}> {
    try {
      const otpRecord = await this.otpLogsRepository.findByPhone(phone);

      if (!otpRecord) {
        return {success: false, message: 'OTP not found'};
      }

      if (
        otpRecord.otpExpiry &&
        new Date(otpRecord.otpExpiry) < new Date()
      ) {
        await this.otpLogsRepository.deleteById(otpRecord.otpId!);
        return {success: false, message: 'OTP expired'};
      }

      if (otpRecord.otpCode !== otpCode) {
        return {success: false, message: 'Invalid OTP'};
      }

      // 🔹 Mark OTP used
      await this.otpLogsRepository.updateById(otpRecord.otpId!, {
        isUsed: true,
        isActive: false,
      });

      // 🔹 Mark user verified
      const user = await this.usersRepository.findOne({
        where: {phone_number: phone},
      });
      if (!user || !user.userId) {
  throw new Error('User not found');
}
      if (user) {
        await this.usersRepository.updateById(user.userId, {
          isVerified: true,
          stages: 'V',
          modifiedOnServer: new Date(),
          modifiedBy: 'system',
        });
      }

      return {
        success: true,
        message: 'OTP verified & user logged in',
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP',
      };
    }
  }


  /**
   * Generate OTP email HTML
   */
  private generateOtpHtml(name: string, otpCode: string, phone: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1f1308;
          background: linear-gradient(180deg, #fffaf4 0%, #f8f1e8 100%);
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-content {
          background: white;
          border-radius: 12px;
          padding: 32px;
          border: 1px solid rgba(120, 74, 20, 0.08);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: #b91018;
          font-style: italic;
        }
        .greeting {
          margin: 16px 0;
          font-size: 16px;
          color: #1f1308;
        }
        .otp-section {
          margin: 28px 0;
          padding: 24px;
          background: linear-gradient(135deg, #f5ede4 0%, #ede3d7 100%);
          border-radius: 12px;
          text-align: center;
        }
        .otp-label {
          font-size: 12px;
          color: #8b5a3a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          color: #c1440a;
          letter-spacing: 0.1em;
          font-family: 'Monaco', 'Courier New', monospace;
        }
        .otp-validity {
          margin-top: 12px;
          font-size: 12px;
          color: #8b5a3a;
        }
        .info-text {
          margin: 24px 0;
          padding: 16px;
          background: #f9f5f0;
          border-left: 4px solid #c1440a;
          border-radius: 4px;
          color: #5a4a3a;
          font-size: 14px;
        }
        .footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #ecdac8;
          text-align: center;
          color: #8b5a3a;
          font-size: 12px;
        }
        .footer a {
          color: #c1440a;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-content">
          <div class="header">
            <h1>SNACKPACK WOODFIRE PIZZA</h1>
          </div>

          <p class="greeting">Hi ${name},</p>
          
          <p>Your One-Time Password (OTP) for login to SNACKPACK is ready. Use this code within the next 10 minutes to complete your login:</p>

          <div class="otp-section">
            <div class="otp-label">Your One-Time Password</div>
            <div class="otp-code">${otpCode}</div>
            <div class="otp-validity">Valid for 10 minutes</div>
          </div>

          <div class="info-text">
            <strong>Security Notice:</strong> Never share your OTP with anyone. SNACKPACK staff will never ask for your OTP.
          </div>

          <p>Phone verified: ${phone}</p>

          <div class="footer">
            <p>
              If you didn't request this OTP, you can safely ignore this email.
              <br>
              Need help? <a href="mailto:karansingh06949@gmail.com">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}
