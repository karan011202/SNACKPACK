import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface PaymentMethod {
  brand: string;
  last4: string;
  label: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-saved-payments',
  templateUrl: './saved-payments.page.html',
  styleUrls: ['./saved-payments.page.scss'],
  standalone: false,
})
export class SavedPaymentsPage {
  methods: PaymentMethod[] = [
    {
      brand: 'Visa',
      last4: '2244',
      label: 'Personal Card',
      isDefault: true,
    },
    {
      brand: 'Mastercard',
      last4: '9081',
      label: 'Office Card',
      isDefault: false,
    },
  ];

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
