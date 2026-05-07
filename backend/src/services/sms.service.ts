// import axios from 'axios';

// export class SmsService {
//   async sendSMS(phone: string, message: string) {
//     const apiKey = process.env.FAST2SMS_API_KEY;
//     if (!apiKey) {
//       throw new Error('FAST2SMS_API_KEY is not configured');
//     }

//     const normalizedPhone = this.normalizePhone(phone);

//     try {
//       const response = await axios.post(
//         'https://www.fast2sms.com/dev/bulkV2',
//         {
//           message,
//           language: 'english',
//           route: 'q',
//           numbers: normalizedPhone,
//         },
//         {
//           headers: {
//             authorization: apiKey,
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       if (response.data?.return === false) {
//         throw new Error(response.data?.message || 'Fast2SMS request was rejected');
//       }

//       return response.data;
//     } catch (error) {
//       let detailedMessage = 'SMS provider request failed';
//       if (axios.isAxiosError(error)) {
//         detailedMessage =
//           (error.response?.data?.message as string | undefined) ||
//           error.message ||
//           detailedMessage;
//       } else if (error instanceof Error) {
//         detailedMessage = error.message;
//       }

//       console.error('SMS failed:', error);
//       throw new Error(detailedMessage);
//     }
//   }

//   private normalizePhone(phone: string): string {
//     const digitsOnly = phone.replace(/\D/g, '');

//     // Fast2SMS expects 10-digit Indian mobile numbers without country code.
//     if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
//       return digitsOnly.slice(2);
//     }

//     return digitsOnly;
//   }
// }