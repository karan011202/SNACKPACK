import { Component, OnInit } from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  phoneNumber = '';
  email = '';
  name = '';
  otpCode = '';

  otpSent = false;
  otpVerified = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '/home';
  returnState: unknown;

  constructor(private router: Router, private authService: AuthService) {}

  private getApiErrorMessage(error: unknown, fallback: string): string {
    const httpError = error as HttpErrorResponse;

    if (httpError?.status === 429) {
      return 'Too many attempts. Try again after 15 minutes.';
    }

    const backendMessage =
      typeof httpError?.error === 'object' && httpError.error && 'error' in httpError.error
        ? String((httpError.error as {error?: string}).error)
        : typeof httpError?.error === 'string'
          ? httpError.error
          : '';

    return backendMessage || fallback;
  }

  private persistUserSession(): void {
    const session = {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phoneNumber.trim(),
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem('snackpackUserSession', JSON.stringify(session));
  }

  ngOnInit(): void {
    const navigationState = history.state as {returnUrl?: string; returnState?: unknown};
    this.returnUrl = navigationState?.returnUrl ?? '/home';
    this.returnState = navigationState?.returnState;
  }

  async sendOtp(): Promise<void> {
    if (!this.phoneNumber || !this.email || !this.name) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.otpCode = '';
    localStorage.removeItem('snackpackAuthToken');

    this.authService.sendOtp(this.phoneNumber, this.email, this.name).subscribe(
      (response) => {
        this.isLoading = false;
        this.otpSent = true;
        this.successMessage = response.message || 'OTP sent. Proceed to OTP verification.';
        this.errorMessage = '';
      },
      (error) => {
        this.isLoading = false;
        this.successMessage = '';
        this.errorMessage = this.getApiErrorMessage(
          error,
          'Failed to send OTP. Please try again.',
        );
        console.error('Error sending OTP:', error);
      },
    );
  }

  async verifyOtp(): Promise<void> {
    const otp = this.otpCode.trim();

    if (otp.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyOtp(this.phoneNumber, otp).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          this.otpVerified = true;
          this.successMessage = response.message;
          this.errorMessage = '';
          if (response.token) {
            localStorage.setItem('snackpackAuthToken', response.token);
          }
        } else {
          this.errorMessage = response.message;
          this.successMessage = '';
        }
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = this.getApiErrorMessage(
          error,
          'Failed to verify OTP. Please try again.',
        );
        this.successMessage = '';
        console.error('Error verifying OTP:', error);
      },
    );
  }

  enterKitchen(): void {
    if (this.otpVerified) {
      this.persistUserSession();

      if (this.returnState) {
        this.router.navigateByUrl(this.returnUrl, {state: this.returnState});
        return;
      }

      this.router.navigateByUrl(this.returnUrl);
    }
  }

  goBack(): void {
    if (this.returnState) {
      this.router.navigateByUrl(this.returnUrl, {state: this.returnState});
      return;
    }

    this.router.navigate(['/home']);
  }
}
