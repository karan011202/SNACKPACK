# Email Configuration Guide

## Overview

The SNACKPACK application sends order confirmation emails to customers after placing an order. Email functionality is implemented using **Nodemailer** in the backend.

## Setup Instructions

### 1. Install Required Packages

Nodemailer has already been installed. If needed, run:

```bash
npm install nodemailer @types/nodemailer
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory with the following configuration:

```env
# Email Configuration (for order confirmations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=orders@snackpack.in

# Server Configuration
NODE_ENV=development
PORT=3000
```

### 3. Using Gmail (Recommended)

To send emails through Gmail:

1. **Enable 2-Step Verification** on your Google Account
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the generated 16-character password
  - Use this as `EMAIL_PASSWORD` in your `.env` file
  - Enter it without spaces; Gmail sometimes shows the code grouped visually, but Nodemailer needs the raw 16 characters

3. **Use your Gmail address** as `EMAIL_USER`

### 4. Using Other Email Providers

Update `SMTP_HOST` and `SMTP_PORT` for your provider:

| Provider | SMTP Host | Port | Secure |
|----------|-----------|------|--------|
| Gmail | smtp.gmail.com | 587 | false |
| Gmail (SSL) | smtp.gmail.com | 465 | true |
| Outlook | smtp-mail.outlook.com | 587 | false |
| SendGrid | smtp.sendgrid.net | 587 | false |

## Email Endpoint

### POST `/send-order-confirmation`

Sends an order confirmation email to the customer.

**Request Body:**
```json
{
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "orderNumber": "#AK-1234",
  "tableNumber": "TABLE14",
  "estimatedTime": "12-15 minutes",
  "items": [
    {
      "name": "Classic Margherita",
      "variant": "Regular",
      "price": 250.00
    }
  ],
  "total": 250.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order confirmation email sent successfully"
}
```

## Email Template

The confirmation email includes:
- Order number and table number
- Order status timeline (Order Received → In the Oven → Coming to Table)
- Estimated serving time
- Detailed order summary with items and total
- Restaurant branding

## Testing

To test email functionality:

1. Start the backend server:
   ```bash
   npm run dev:backend
   ```

2. Send a test request using curl or Postman:
   ```bash
   curl -X POST http://localhost:3000/send-order-confirmation \
     -H "Content-Type: application/json" \
     -d '{
       "customerEmail": "test@example.com",
       "customerName": "Test User",
       "orderNumber": "#AK-0001",
       "tableNumber": "TABLE1",
       "estimatedTime": "10-12 minutes",
       "items": [{"name": "Test Pizza", "variant": "Regular", "price": 300}],
       "total": 300
     }'
   ```

3. Check your email inbox for the confirmation message

## Troubleshooting

### "Authentication failed" error
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- For Gmail: ensure App Password (16 characters) is used, not your regular password
- Check that 2-Step Verification is enabled

### "Connection timeout" error
- Verify `SMTP_HOST` and `SMTP_PORT` are correct
- Check firewall settings allow outbound SMTP connections
- Try `SMTP_PORT=465` with `SMTP_SECURE=true`
- If you are using a Gmail app password, remove any spaces before saving `EMAIL_PASSWORD`
- The backend now retries Gmail on port `465` automatically when port `587` times out during the SMTP greeting

### Emails not received
- Check spam/junk folder
- Verify recipient email address is correct
- Check backend logs for error messages

## Production Deployment

For production deployment:

1. Use environment variables from your hosting provider (e.g., Heroku Config Vars, AWS Secrets Manager)
2. Never commit `.env` file to version control
3. Consider using dedicated email services like SendGrid for better deliverability
4. Implement email retry logic for failed sends
5. Monitor email delivery and bounce rates

## Future Enhancements

- [ ] Attachment support (receipts, menus)
- [ ] Multiple email templates (order received, in preparation, ready, completed)
- [ ] Email scheduling and queuing
- [ ] Delivery and open tracking
- [ ] Multi-language support
