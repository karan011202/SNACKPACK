import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface CartItem {
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

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss'],
})
export class CartModalComponent {
  @Input() cart: CartItem[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<{itemKey: string; delta: number}>();
  @Output() checkout = new EventEmitter<void>();

  getSubtotal(): number {
    return this.cart.reduce((s, i) => s + (i.unitPrice || 0) * (i.quantity || 0), 0);
  }

  onUpdate(itemKey: string, delta: number) {
    this.updateQuantity.emit({ itemKey, delta });
  }

  onCheckout() {
    this.checkout.emit();
  }

  onClose() {
    this.close.emit();
  }
}
