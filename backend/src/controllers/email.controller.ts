import {post, requestBody} from '@loopback/rest';
import {EmailService, OrderConfirmationEmail} from '../services/email.service';

export interface OrderConfirmationRequest extends OrderConfirmationEmail {}

export interface EmailResponse {
  success: boolean;
  message: string;
}

export class EmailController {
  private emailService: EmailService;
  private readonly emailUser: string;
  private readonly emailPassword: string;

  constructor() {
    this.emailUser = process.env.EMAIL_USER ?? '';
    this.emailPassword = process.env.EMAIL_PASSWORD ?? '';

    this.emailService = new EmailService({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: this.emailUser,
        pass: this.emailPassword,
      },
      from: process.env.EMAIL_FROM || 'karansingh06949@gmail.com',
    });
  }

  @post('/send-order-confirmation', {
    responses: {
      '200': {
        description: 'Order confirmation email sent successfully',
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
  async sendOrderConfirmation(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: [
              'customerEmail',
              'customerName',
              'customerPhone',
              'orderNumber',
              'tableNumber',
              'estimatedTime',
              'redeemedPoints',
              'items',
              'total',
            ],
            properties: {
              customerEmail: {type: 'string', format: 'email'},
              customerName: {type: 'string'},
              customerPhone: {type: 'string'},
              orderNumber: {type: 'string'},
              tableNumber: {type: 'string'},
              estimatedTime: {type: 'string'},
              redeemedPoints: {type: 'number'},
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {type: 'string'},
                    variant: {type: 'string'},
                    price: {type: 'number'},
                  },
                },
              },
              total: {type: 'number'},
            },
          },
        },
      },
    })
    orderData: OrderConfirmationRequest,
  ): Promise<EmailResponse> {
    if (this.emailUser && this.emailPassword) {
      try {
        await this.emailService.sendOrderConfirmation(orderData);
        return {
          success: true,
          message: 'Order confirmation email sent successfully.',
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          success: false,
          message: `Email failed: ${errorMessage}`,
        };
      }
    }

    return {
      success: false,
      message: 'Email skipped: SMTP credentials are missing.',
    };
  }
}
