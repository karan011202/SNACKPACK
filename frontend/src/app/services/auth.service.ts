import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  sendOtp(phone: string, email: string, name: string): Observable<SendOtpResponse> {
    return this.http.post<SendOtpResponse>(`${this.apiBaseUrl}/auth/send-otp`, {
      phone,
      email,
      name,
    });
  }

  verifyOtp(phone: string, otpCode: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${this.apiBaseUrl}/auth/verify-otp`, {
      phone,
      otpCode,
    });
  }
}
