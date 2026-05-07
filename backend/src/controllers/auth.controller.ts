import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {UsersRepository, OtpLogsRepository} from '../repositories';
import {EmailService} from '../services/email.service';
import {JwtService} from '../services/jwt.service';
import {OtpService} from '../services/otp.service';
import {service} from '@loopback/core';
export interface SendOtpRequest {
  phone: string;
  email: string;
  name: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otpCode: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
}

export class AuthController {
  private otpService: OtpService;
  private jwtService: JwtService;

  constructor(
     @repository(UsersRepository)
    private usersRepository: UsersRepository,
    @repository(OtpLogsRepository)
    private otpLogsRepository: OtpLogsRepository,
  ) {
    const emailService = new EmailService({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER ?? '',
        pass: process.env.EMAIL_PASSWORD ?? '',
      },
      from: process.env.EMAIL_FROM || 'karansingh06949@gmail.com',
    });

    this.otpService = new OtpService(otpLogsRepository, usersRepository, emailService);
    this.jwtService = new JwtService();
  }

  @post('/auth/send-otp', {
    responses: {
      '200': {
        description: 'OTP sent successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {type: 'boolean'},
                message: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async sendOtp(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['phone', 'email', 'name'],
            properties: {
              phone: {
                type: 'string',
                pattern: '^[0-9+\\-\\s()]+$',
                description: 'Phone number in any standard format',
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'Email address',
              },
              name: {
                type: 'string',
                description: 'User name',
              },
            },
          },
        },
      },
    })
    request: SendOtpRequest,
  ): Promise<AuthResponse> {
    return this.otpService.sendOtp(request.phone, request.email, request.name);
  }

  @post('/auth/verify-otp', {
    responses: {
      '200': {
        description: 'OTP verified successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {type: 'boolean'},
                message: {type: 'string'},
                token: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async verifyOtp(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['phone', 'otpCode'],
            properties: {
              phone: {
                type: 'string',
                description: 'Phone number',
              },
              otpCode: {
                type: 'string',
                pattern: '^[0-9]{6}$',
                description: '6-digit OTP code',
              },
            },
          },
        },
      },
    })
    request: VerifyOtpRequest,
  ): Promise<AuthResponse> {
    const result = await this.otpService.verifyOtp(request.phone, request.otpCode);
    if (!result.success) {
      return result;
    }

    return {
      ...result,
      token: this.jwtService.generateToken({phone: request.phone}),
    };
  }
}
