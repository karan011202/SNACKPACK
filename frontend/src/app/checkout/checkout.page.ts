import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {OrderHistoryService} from '../services/order-history.service';
import {LoyaltyWalletService} from '../services/loyalty-wallet.service';

interface CheckoutCartItem {
  itemKey: string;
  id: string;
  name: string;
  image: string;
  quantity: number;
  selectedVariant: string;
  selectedAddons: string[];
  addonPrice: number;
  unitPrice: number;
}

type PartialCheckoutCartItem = Partial<CheckoutCartItem> & {
  id?: string;
  name?: string;
};

interface CheckoutState {
  cart?: CheckoutCartItem[];
  subtotal?: number;
  total?: number;
  checkoutMode?: 'guest' | 'login';
}

interface CheckoutConfirmationSnapshot {
  cart: CheckoutCartItem[];
  subtotal: number;
  total: number;
  redeemedPoints: number;
  pointsEarnedOnLastOrder: number;
  checkoutMode: 'guest' | 'login';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderNumber: string;
  tableNumber: string;
  estimatedTime: string;
  isOrderPlaced: boolean;
}

interface PlaceOrderPayloadItem {
  menuItemId: string;
  name?: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  selectedAddons?: string[];
}

interface PlaceOrderResponse {
  success: boolean;
  orderId: string;
  totalAmount: number;
}

interface UserSession {
  name: string;
  email: string;
  phone: string;
  loggedInAt?: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: false,
})
export class CheckoutPage implements OnInit {
  private readonly ORDER_CONFIRMATION_SNAPSHOT_KEY = 'snackpackCheckoutConfirmation';
  cart: CheckoutCartItem[] = [];
  subtotal = 0;
  total = 0;
  redeemedPoints = 0;
  redeemPointsInput = 0;
  availableLoyaltyPoints = 0;
  pointsEarnedOnLastOrder = 0;
  checkoutMode: 'guest' | 'login' = 'guest';
  customerName = '';
  customerPhone = '';
  customerEmail = '';
  addressLine = '';
  city = '';
  notes = '';
  
  isOrderPlaced = false;
  orderNumber = '';
  tableNumber = 'ON TABLE';
  estimatedTime = '12-15 minutes';
  isPlacingOrder = false;
  orderSubmitError = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private orderHistoryService: OrderHistoryService,
    private loyaltyWalletService: LoyaltyWalletService,
  ) {}

  getCartItemAddons(item: CheckoutCartItem): string[] {
    return Array.isArray(item.selectedAddons) ? item.selectedAddons : [];
  }

  ngOnInit(): void {
    this.hydrateCheckoutState();
  }

  ionViewWillEnter(): void {
    this.hydrateCheckoutState();
  }

  goBackToMenu(): void {
    this.clearConfirmationSnapshot();
    this.router.navigate(['/home']);
  }

  openOrderStatus(): void {
    if (!this.orderNumber) {
      return;
    }

    this.clearConfirmationSnapshot();
    this.router.navigate(['/order-confirmation', this.orderNumber]);
  }

  goToLogin(): void {
    this.checkoutMode = 'login';
    this.router.navigate(['/login'], {
      state: {
        returnUrl: '/checkout',
        returnState: {
          cart: this.cart,
          subtotal: this.subtotal,
          total: this.total,
          checkoutMode: 'login',
        },
      },
    });
  }

  continueAsGuest(): void {
    this.checkoutMode = 'guest';
    this.resetLoyaltyRedemption();
  }

  logoutCustomer(): void {
    localStorage.removeItem('snackpackUserSession');
    localStorage.removeItem('snackpackAuthToken');
    this.checkoutMode = 'guest';
    this.availableLoyaltyPoints = 0;
    this.resetLoyaltyRedemption();
  }

  async placeOrder(): Promise<void> {
    if (this.cart.length === 0 || this.isOrderPlaced || this.isPlacingOrder) {
      return;
    }

    this.isPlacingOrder = true;
    this.orderSubmitError = '';
    const appliedRedeemedPoints = this.redeemedPoints;
    const payableTotal = Math.max(0, this.total - appliedRedeemedPoints);
    const pointsEarnedOnOrder = Math.floor(payableTotal * 0.02);

    const payload = {
      customerName: this.customerName.trim(),
      customerPhone: this.customerPhone.trim(),
      customerEmail: this.customerEmail.trim(),
      tableNumber: this.tableNumber,
      orderType: 'dine-in',
      redeemedPoints: appliedRedeemedPoints,
      items: this.cart.map((item): PlaceOrderPayloadItem => ({
        menuItemId: item.id,
        name: item.name,
        variantName: item.selectedVariant,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        selectedAddons: item.selectedAddons,
      })),
    };

    try {
      const response = await firstValueFrom(
        this.http.post<PlaceOrderResponse>(`${environment.apiBaseUrl}/orders/place`, payload),
      );

      if (!response?.success || !response.orderId) {
        throw new Error('Order placement failed.');
      }

      this.orderNumber = response.orderId;
      this.pointsEarnedOnLastOrder = pointsEarnedOnOrder;
      this.saveLoggedInUserOrderHistory(payableTotal);
      this.recordLoyaltyTransaction(appliedRedeemedPoints, pointsEarnedOnOrder);
      this.isOrderPlaced = true;
      this.persistConfirmationSnapshot(payableTotal, appliedRedeemedPoints);
      this.sendOrderConfirmationEmail(payableTotal, appliedRedeemedPoints);
    } catch (error) {
      console.error('Failed to place order:', error);
      this.orderSubmitError = 'We could not place your order. Please try again.';
    } finally {
      this.isPlacingOrder = false;
    }
  }

  applyLoyaltyPoints(): void {
    if (this.checkoutMode !== 'login' || this.maxRedeemablePoints === 0) {
      return;
    }

    const parsedPoints = Number(this.redeemPointsInput);
    const normalizedPoints = Number.isFinite(parsedPoints)
      ? Math.floor(parsedPoints)
      : 0;

    this.redeemedPoints = Math.max(0, Math.min(normalizedPoints, this.maxRedeemablePoints));
    this.redeemPointsInput = this.redeemedPoints;
  }

  clearLoyaltyPoints(): void {
    this.resetLoyaltyRedemption();
  }

  get maxRedeemablePoints(): number {
    if (this.checkoutMode !== 'login') {
      return 0;
    }

    return Math.max(0, Math.min(this.availableLoyaltyPoints, Math.floor(this.total)));
  }

  get payableTotal(): number {
    return Math.max(0, this.total - this.redeemedPoints);
  }

  get potentialPointsOnThisOrder(): number {
    return Math.floor(this.payableTotal * 0.02);
  }

  private saveLoggedInUserOrderHistory(totalAmount: number): void {
    this.orderHistoryService.appendOrderForCurrentUser({
      id: this.orderNumber,
      total: totalAmount,
      items: this.cart.map(item => `${item.quantity}x ${item.name}`),
      lineItems: this.cart.map(item => ({
        name: item.name,
        variant: item.selectedVariant,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        image: item.image,
      })),
      tableNumber: this.tableNumber,
      estimatedTime: this.estimatedTime,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
    });
  }

  private sendOrderConfirmationEmail(totalAmount: number, redeemedPoints: number): void {
    const emailPayload = {
      customerEmail: this.customerEmail,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      orderNumber: this.orderNumber,
      tableNumber: this.tableNumber,
      estimatedTime: this.estimatedTime,
      redeemedPoints,
      items: this.cart.map(item => ({
        name: item.name,
        variant: item.selectedVariant,
        price: item.unitPrice * item.quantity,
        selectedAddons: item.selectedAddons,
      })),
      total: totalAmount,
    };

    this.http.post(`${environment.apiBaseUrl}/send-order-confirmation`, emailPayload).subscribe(
      (response: any) => {
        if (response.success) {
          console.log('Order confirmation email sent successfully');
        } else {
          console.warn('Email sending warning:', response.message);
        }
      },
      (error) => {
        console.error('Failed to send confirmation email:', error);
        // Don't block order placement if email fails
      },
    );
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Addon ID to name mapping (must match home.page.ts availableAddons and kitchen.component.ts)
  private readonly addonNames: Record<string, string> = {
    'extra-cheese': 'Extra Cheese',
    'extra-veg-topping': 'Extra Veg Topping',
    'premium-topping': 'Premium Topping',
    'paneer': 'Paneer',
    'multigrain-wheat-base': 'Multigrain Wheat Base',
  };

  formatAddons(selectedAddons: string[] | undefined): string {
    if (!selectedAddons || selectedAddons.length === 0) {
      return '';
    }
    // Support both addon IDs and labels since home.page stores labels
    return selectedAddons
      .map(addon => {
        // If it looks like an ID (lowercase with hyphens), try mapping it
        if (/^[a-z]+-[a-z-]+$/.test(addon)) {
          return this.addonNames[addon] || addon;
        }
        // Otherwise assume it's already a label and return as-is
        return addon;
      })
      .join(', ');
  }

  private calculateSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  private normalizeCartItem(item: PartialCheckoutCartItem): CheckoutCartItem {
    const unitPrice = Number(item.unitPrice ?? 0);
    const quantity = Number(item.quantity ?? 1);

    return {
      itemKey: item.itemKey ?? `${item.id ?? 'item'}-${item.name ?? 'item'}`,
      id: item.id ?? 'unknown-item',
      name: item.name ?? 'Menu item',
      image: item.image ?? '',
      quantity: Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1,
      selectedVariant: item.selectedVariant ?? 'Standard',
      selectedAddons: Array.isArray(item.selectedAddons) ? item.selectedAddons : [],
      addonPrice: Number.isFinite(Number(item.addonPrice)) ? Number(item.addonPrice) : 0,
      unitPrice: Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0,
    };
  }

  private normalizeCart(cart: unknown): CheckoutCartItem[] {
    if (!Array.isArray(cart)) {
      return [];
    }

    return cart.map(item => this.normalizeCartItem(item as PartialCheckoutCartItem));
  }

  private hydrateCheckoutState(): void {
    const navigationState = (history.state ?? {}) as CheckoutState;

    if (navigationState.cart?.length) {
      this.clearConfirmationSnapshot();
    } else if (this.restoreConfirmationSnapshot()) {
      return;
    }

    if (navigationState.cart) {
      this.cart = this.normalizeCart(navigationState.cart);
    }

    this.subtotal = navigationState.subtotal ?? this.calculateSubtotal();
    this.total = navigationState.total ?? this.subtotal;
    this.resetLoyaltyRedemption();
    this.checkoutMode = navigationState.checkoutMode ?? this.checkoutMode;

    const rawSession = localStorage.getItem('snackpackUserSession');
    if (rawSession) {
      try {
        const session = JSON.parse(rawSession) as UserSession;
        if (session?.name && session?.phone && session?.email) {
          this.customerName = session.name;
          this.customerPhone = session.phone;
          this.customerEmail = session.email;
          this.checkoutMode = 'login';
          this.loadLoyaltyWallet();
        }
      } catch {
        this.checkoutMode = navigationState.checkoutMode ?? 'guest';
      }
    } else {
      this.availableLoyaltyPoints = 0;
    }

    if (this.cart.length === 0) {
      this.total = 0;
    }
  }

  private persistConfirmationSnapshot(totalAmount: number, redeemedPoints: number): void {
    const snapshot: CheckoutConfirmationSnapshot = {
      cart: this.cart.map(item => ({...item})),
      subtotal: this.subtotal,
      total: totalAmount,
      redeemedPoints,
      pointsEarnedOnLastOrder: this.pointsEarnedOnLastOrder,
      checkoutMode: this.checkoutMode,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      orderNumber: this.orderNumber,
      tableNumber: this.tableNumber,
      estimatedTime: this.estimatedTime,
      isOrderPlaced: this.isOrderPlaced,
    };

    localStorage.setItem(this.ORDER_CONFIRMATION_SNAPSHOT_KEY, JSON.stringify(snapshot));
  }

  private restoreConfirmationSnapshot(): boolean {
    const raw = localStorage.getItem(this.ORDER_CONFIRMATION_SNAPSHOT_KEY);
    if (!raw) {
      return false;
    }

    try {
      const snapshot = JSON.parse(raw) as CheckoutConfirmationSnapshot;
      if (!snapshot?.isOrderPlaced || !snapshot.orderNumber || !Array.isArray(snapshot.cart)) {
        this.clearConfirmationSnapshot();
        return false;
      }

      this.cart = this.normalizeCart(snapshot.cart);
      this.subtotal = snapshot.subtotal;
      this.total = snapshot.total;
      this.redeemedPoints = snapshot.redeemedPoints;
      this.redeemPointsInput = snapshot.redeemedPoints;
      this.pointsEarnedOnLastOrder = snapshot.pointsEarnedOnLastOrder;
      this.checkoutMode = snapshot.checkoutMode;
      this.customerName = snapshot.customerName;
      this.customerPhone = snapshot.customerPhone;
      this.customerEmail = snapshot.customerEmail;
      this.orderNumber = snapshot.orderNumber;
      this.tableNumber = snapshot.tableNumber;
      this.estimatedTime = snapshot.estimatedTime;
      this.isOrderPlaced = true;

      return true;
    } catch {
      this.clearConfirmationSnapshot();
      return false;
    }
  }

  private clearConfirmationSnapshot(): void {
    localStorage.removeItem(this.ORDER_CONFIRMATION_SNAPSHOT_KEY);
  }

  private loadLoyaltyWallet(): void {
    const wallet = this.loyaltyWalletService.getWalletForCurrentUser();
    this.availableLoyaltyPoints = wallet.availablePoints;
    if (this.redeemedPoints > this.maxRedeemablePoints) {
      this.redeemedPoints = this.maxRedeemablePoints;
      this.redeemPointsInput = this.redeemedPoints;
    }
  }

  private resetLoyaltyRedemption(): void {
    this.redeemedPoints = 0;
    this.redeemPointsInput = 0;
  }

  private recordLoyaltyTransaction(redeemedPoints: number, earnedPoints: number): void {
    if (this.checkoutMode !== 'login') {
      return;
    }

    this.loyaltyWalletService.recordOrderTransactionForCurrentUser({
      orderId: this.orderNumber,
      redeemedPoints,
      earnedPoints,
    });
    this.loadLoyaltyWallet();
  }
}