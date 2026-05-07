import { Component } from '@angular/core';
import { Router } from '@angular/router';

type PizzaSize = 'Regular' | 'Medium';

interface PizzaOption {
  id: string;
  label: string;
  price: number;
}

interface SizeOption extends PizzaOption {
  size: PizzaSize;
}

interface PendingCustomPizzaCartItem {
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
  selector: 'app-make-your-own-pizza',
  templateUrl: './make-your-own-pizza.page.html',
  styleUrls: ['./make-your-own-pizza.page.scss'],
  standalone: false,
})
export class MakeYourOwnPizzaPage {
  readonly sizes: SizeOption[] = [
    { id: 'regular', label: 'Regular', price: 149, size: 'Regular' },
    { id: 'medium', label: 'Medium', price: 229, size: 'Medium' },
  ];

  readonly crusts: PizzaOption[] = [
    { id: 'classic', label: 'Classic Crust', price: 0 },
    { id: 'thin', label: 'Thin Crust', price: 20 },
    { id: 'wheat', label: 'Multigrain Wheat', price: 50 },
    { id: 'stuffed', label: 'Cheese Burst', price: 90 },
  ];

  readonly sauces: PizzaOption[] = [
    { id: 'classic-sauce', label: 'FRESH PIZZA SAUCE', price: 0 },
    
    { id: 'makhni', label: 'Makhni', price: 35 },
    
  ];

  readonly toppings: PizzaOption[] = [
    { id: 'onion', label: 'Onion', price: 20 },
    { id: 'capsicum', label: 'Capsicum', price: 20 },
    { id: 'jalapeno', label: 'Jalapeno', price: 25 },
    { id: 'corn', label: 'Sweet Corn', price: 25 },
    { id: 'olives', label: 'Black Olives', price: 30 },
    { id: 'mushroom', label: 'Mushroom', price: 35 },
    { id: 'paneer', label: 'Paneer', price: 45 },
    { id: 'extra-cheese', label: 'Extra Cheese', price: 50 },
  ];

  selectedSize: PizzaSize = 'Regular';
  selectedCrustId = 'classic';
  selectedSauceId = 'classic-sauce';
  selectedToppingIds: string[] = [];

  constructor(private router: Router) {}

  toggleTopping(toppingId: string): void {
    if (this.selectedToppingIds.includes(toppingId)) {
      this.selectedToppingIds = this.selectedToppingIds.filter((id) => id !== toppingId);
      return;
    }

    this.selectedToppingIds = [...this.selectedToppingIds, toppingId];
  }

  isToppingSelected(toppingId: string): boolean {
    return this.selectedToppingIds.includes(toppingId);
  }

  get selectedCrust(): PizzaOption {
    return this.crusts.find((item) => item.id === this.selectedCrustId) ?? this.crusts[0];
  }

  get selectedSauce(): PizzaOption {
    return this.sauces.find((item) => item.id === this.selectedSauceId) ?? this.sauces[0];
  }

  get selectedSizePrice(): number {
    const selected = this.sizes.find((item) => item.size === this.selectedSize);
    return selected?.price ?? 0;
  }

  get selectedToppingsPrice(): number {
    return this.selectedToppingIds.reduce((total, toppingId) => {
      const topping = this.toppings.find((item) => item.id === toppingId);
      return total + (topping?.price ?? 0);
    }, 0);
  }

  get selectedToppingLabels(): string[] {
    return this.selectedToppingIds
      .map((toppingId) => this.toppings.find((item) => item.id === toppingId)?.label)
      .filter((label): label is string => Boolean(label));
  }

  get totalPrice(): number {
    return this.selectedSizePrice + this.selectedCrust.price + this.selectedSauce.price + this.selectedToppingsPrice;
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  }

  backToMenu(): void {
    this.router.navigate(['/home']);
  }

  addToCartAndBack(): void {
    const selectedAddons = [
      `Crust: ${this.selectedCrust.label}`,
      `Sauce: ${this.selectedSauce.label}`,
      ...this.selectedToppingLabels.map((label) => `Topping: ${label}`),
    ];

    const customItem: PendingCustomPizzaCartItem = {
      itemKey: this.buildItemKey(),
      id: 'custom-pizza',
      name: 'Make Your Own Pizza',
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
      quantity: 1,
      selectedVariant: this.selectedSize,
      selectedAddons,
      addonPrice: this.selectedCrust.price + this.selectedSauce.price + this.selectedToppingsPrice,
      unitPrice: this.totalPrice,
    };

    this.router.navigate(['/home'], {
      state: {
        customPizza: customItem,
      },
    });
  }

  private buildItemKey(): string {
    const toppingsKey = [...this.selectedToppingIds].sort().join('-') || 'no-topping';
    return `custom-${this.selectedSize.toLowerCase()}-${this.selectedCrustId}-${this.selectedSauceId}-${toppingsKey}`;
  }
}
