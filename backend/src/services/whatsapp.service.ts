import {OrderConfirmationEmail} from './email.service';
import https from 'https';

export interface WhatsAppConfig {
  enabled: boolean;
  accessToken: string;
  phoneNumberId: string;
  adminNumber: string;
  apiVersion: string;
}

export class WhatsAppService {
  private readonly config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return (
      this.config.enabled &&
      !!this.config.accessToken &&
      !!this.config.phoneNumberId &&
      !!this.config.adminNumber
    );
  }

  async sendAdminOrderNotification(data: OrderConfirmationEmail): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp config is missing.');
    }

    const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;
    const to = this.config.adminNumber.replace(/\D/g, '');
    const message = this.buildOrderMessage(data);

    const payload = JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    });

    await this.postJson(url, payload);
  }

  private postJson(urlString: string, payload: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = new URL(urlString);
      const req = https.request(
        {
          protocol: url.protocol,
          hostname: url.hostname,
          path: `${url.pathname}${url.search}`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        res => {
          let body = '';

          res.on('data', chunk => {
            body += chunk;
          });

          res.on('end', () => {
            const status = res.statusCode ?? 500;
            if (status >= 200 && status < 300) {
              resolve();
              return;
            }

            reject(new Error(`WhatsApp API failed (${status}): ${body}`));
          });
        },
      );

      req.on('error', error => reject(error));
      req.write(payload);
      req.end();
    });
  }

  private buildOrderMessage(data: OrderConfirmationEmail): string {
    const itemsText = data.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} (${item.variant}) - INR ${item.price.toFixed(2)}`,
      )
      .join('\n');

    return [
      '*NEW CONFIRMED ORDER*',
      '',
      `Order: ${data.orderNumber}`,
      `Table: ${data.tableNumber}`,
      `Customer: ${data.customerName}`,
      `Phone: ${data.customerPhone}`,
      `Email: ${data.customerEmail}`,
      `ETA: ${data.estimatedTime}`,
      '',
      '*Items:*',
      itemsText,
      '',
      `*Total: INR ${data.total.toFixed(2)}*`,
    ].join('\n');
  }
}
