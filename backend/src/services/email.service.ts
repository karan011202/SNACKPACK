import nodemailer, {SendMailOptions, Transporter} from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface OrderConfirmationEmail {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  tableNumber: string;
  estimatedTime: string;
  redeemedPoints: number;
  items: Array<{
    name: string;
    variant: string;
    price: number;
    selectedAddons?: string[];
  }>;
  total: number;
}

export class EmailService {
  private transporter: Transporter;
  private fallbackTransporter?: Transporter;
  private readonly fromAddress: string;
  private readonly host: string;
  private readonly port: number;
  private readonly secure: boolean;
  private readonly auth: EmailConfig['auth'];

  constructor(config: EmailConfig) {
    this.host = config.host;
    this.port = config.port;
    this.secure = config.secure;
    this.auth = {
      user: config.auth.user.trim(),
      pass: config.auth.pass.replace(/\s+/g, ''),
    };
    this.fromAddress = config.from;
    this.transporter = this.createTransporter(this.host, this.port, this.secure);

    const fallbackConfig = this.getFallbackConfig();
    if (fallbackConfig) {
      this.fallbackTransporter = this.createTransporter(
        fallbackConfig.host,
        fallbackConfig.port,
        fallbackConfig.secure,
      );
    }
  }

  async sendMail(mailOptions: SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      if (this.fallbackTransporter && this.shouldRetryWithFallback(error)) {
        await this.fallbackTransporter.sendMail(mailOptions);
        return;
      }

      console.error('Failed to send email:', error);
      throw new Error(`Email sending failed: ${error}`);
    }
  }

  async sendOrderConfirmation(data: OrderConfirmationEmail): Promise<void> {
    const htmlContent = this.generateOrderConfirmationHTML(data);

    const mailOptions = {
      from: this.fromAddress,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html: htmlContent,
    };

    try {
      await this.sendMail(mailOptions);
      console.log(`Order confirmation email sent to ${data.customerEmail}`);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      throw new Error(`Email sending failed: ${error}`);
    }
  }

  private createTransporter(host: string, port: number, secure: boolean): Transporter {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: this.auth,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      requireTLS: !secure,
      tls: {
        minVersion: 'TLSv1.2',
      },
    });
  }

  private getFallbackConfig(): EmailConfig | null {
    if (this.secure) {
      return null;
    }

    if (!/gmail/i.test(this.host)) {
      return null;
    }

    return {
      host: this.host,
      port: 465,
      secure: true,
      auth: this.auth,
      from: this.fromAddress,
    };
  }

  private shouldRetryWithFallback(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);

    return /Greeting never received|ETIMEDOUT|timeout/i.test(message);
  }

  private generateOrderConfirmationHTML(data: OrderConfirmationEmail): string {
    const itemsHTML = data.items
      .map(
        item => {
          const addonsText = item.selectedAddons && item.selectedAddons.length > 0
            ? `<br><span style="color: #a17347; font-size: 0.85em; font-style: italic;">Add-ons: ${item.selectedAddons.join(', ')}</span>`
            : '';
          return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e9d5c0;">
          <strong>${item.name}</strong><br>
          <span style="color: #8b5a3a; font-size: 0.9em;">${item.variant}</span>${addonsText}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e9d5c0; text-align: right;">
          ₹${item.price.toFixed(2)}
        </td>
      </tr>
    `;
        },
      )
      .join('');

    const redeemedAmount = Math.max(0, Math.floor(data.redeemedPoints ?? 0));

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
          max-width: 600px;
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
          margin: 0 0 8px;
          font-size: 28px;
          color: #1f1308;
        }
        .order-number {
          font-size: 14px;
          color: #6b4b2a;
          margin-bottom: 16px;
        }
        .table-badge {
          display: inline-block;
          padding: 8px 24px;
          border-radius: 20px;
          background: linear-gradient(135deg, #f5ede4 0%, #ede3d7 100%);
          color: #92400e;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 24px;
        }
        .status-section {
          margin: 32px 0;
          padding: 20px;
          background: #f5ede4;
          border-radius: 12px;
          text-align: center;
        }
        .status-section p {
          margin: 8px 0;
          font-size: 14px;
        }
        .time-value {
          font-size: 24px;
          font-weight: 700;
          color: #c1440a;
        }
        .summary-section {
          margin: 32px 0;
        }
        .summary-section h3 {
          margin: 0 0 16px;
          font-size: 16px;
          color: #1f1308;
          font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 2px solid #d4c4b0;
          font-size: 18px;
          font-weight: 700;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e9d5c0;
          font-size: 12px;
          color: #8b5a3a;
        }
        .button {
          display: inline-block;
          padding: 12px 32px;
          margin: 16px 0;
          background: linear-gradient(135deg, #ea580c, #c2410c);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-content">
          <!-- Header -->
          <div class="header">
            <h1>✓ Thank you for your order!</h1>
            <p class="order-number">${data.orderNumber}</p>
            <div class="table-badge">${data.tableNumber}</div>
          </div>

          <!-- Estimated Time -->
          <div class="status-section">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">
              Estimated Table Serving Time
            </p>
            <p class="time-value">${data.estimatedTime}</p>
          </div>

          <!-- Order Summary -->
          <div class="summary-section">
            <h3>Order Summary</h3>
            <table>
              ${itemsHTML}
            </table>
            ${redeemedAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin: 12px 0; color: #8b5a3a; font-size: 14px;">
              <span>Loyalty redeemed</span>
              <span>-₹${redeemedAmount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-row">
              <span>Total</span>
              <span>₹${data.total.toFixed(2)}</span>
            </div>
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #8b5a3a; margin-top: 12px; margin-bottom: 0;">
              Dine-in Order
            </p>
          </div>

          <!-- Message -->
          <div style="text-align: center; margin: 32px 0; padding: 20px; background: #fef8f1; border-radius: 12px;">
            <p style="margin: 0; color: #6b4b2a;">
              Your order has been sent to the kitchen. Please wait for the arrival at your table.
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0;">
              SNACKPACK WOODFIRE PIZZA<br>
              We appreciate your order!
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}
