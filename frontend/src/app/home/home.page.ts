
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { ApiService, ItemImageApiRow } from '../services/api.service';

interface MenuCategory {
  id: string;
  label: string;
  helper?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  regularPrice: number;
  mediumPrice: number;
  image: string;
  badge: string;
  category: string;
  tags: string[];
}

type PizzaSize = 'Regular' | 'Medium';
type MenuSection = 'veg' | 'nonVeg' | 'other' | 'combos';

interface OtherMenuItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  price?: number;
  regularPrice?: number;
  mediumPrice?: number;
  fullPrice?: number;
  halfPrice?: number;
}

interface PriceOption {
  label: string;
  price: number;
}

interface Addon {
  id: string;
  name: string;
  regularPrice: number;
  mediumPrice: number;
}

interface CartItem {
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

interface UserSession {
  name: string;
  email: string;
  phone: string;
  loggedInAt?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})

export class HomePage implements OnInit, ViewWillEnter {
  activeCategory = 'All';
  activeOtherCategory = 'All';
  activeComboCategory = 'All';
  menuSection: MenuSection = 'veg';
  isCartOpen = false;
  selectedSizes: Record<string, PizzaSize> = {};
  selectedOtherOptions: Record<string, string> = {};
  selectedAddons: Record<string, string[]> = {};
  selectedAddonChoices: Record<string, Record<string, string[]>> = {};
  activeAddAnimations: Record<string, boolean> = {};
  activeAddTicks: Record<string, boolean> = {};
  buttonCountsByItemId: Record<string, number> = {};
  currentUser: UserSession | null = null;
  isUserMenuOpen = false;

  addonChoices: Record<string, string[]> = {
    'extra-veg-topping': ['Onion', 'Capsicum', 'Tomato'],
    'premium-topping': ['Mushroom', 'Peprica', 'Jalapeno', 'Olives'],
  };

  categories: MenuCategory[] = [
    { id: 'all', label: 'All', helper: 'Browse all pizzas' },
    { id: 'signature', label: 'Make Your Own Pizza', helper: 'Pick your base and toppings' },
  ];

  comboCategories: MenuCategory[] = [
    { id: 'all', label: 'All', helper: 'Browse all combos' },
    { id: 'combo', label: 'Combo Offers', helper: 'Meal combos and platter deals' },
  ];

  availableAddons: Addon[] = [
    { id: 'extra-cheese', name: 'Extra Cheese', regularPrice: 70, mediumPrice: 100 },
    { id: 'extra-veg-topping', name: 'Extra Veg Topping', regularPrice: 30, mediumPrice: 30 },
    { id: 'premium-topping', name: 'Premium Topping', regularPrice: 40, mediumPrice: 50 },
    { id: 'paneer', name: 'Paneer', regularPrice: 40, mediumPrice: 50 },
    { id: 'multigrain-wheat-base', name: 'Multigrain Wheat Base', regularPrice: 50, mediumPrice: 50 },
  ];

  otherCategories: MenuCategory[] = [
    { id: 'all', label: 'All', helper: 'Everything we serve' },
    { id: 'vegan-momos', label: 'Vegan Momos', helper: 'Steamed, fried, and kurkure' },
    { id: 'non-veg-momos', label: 'Non Veg Momos', helper: 'Chicken momo varieties' },
    { id: 'gravy-momos', label: 'Gravy Momos', helper: 'Fried style with gravy' },
    { id: 'combos-platter', label: 'Combos & Platter', helper: 'Meal deals and platters' },
    { id: 'garlic-bread', label: 'Garlic Bread', helper: 'Bread and dip options' },
    { id: 'pasta', label: 'Pasta', helper: 'Red and white sauce' },
    { id: 'fries', label: 'Fries', helper: 'Classic to loaded' },
    { id: 'veg-burger', label: 'Veg Burger', helper: 'Cheesy burger line' },
    { id: 'veg-sandwich', label: 'Veg Sandwich', helper: 'Hot grilled sandwiches' },
    { id: 'beverages', label: 'Beverages', helper: 'Cold and hot drinks' },
  ];

  vegMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Classic Margarita',
      description: 'Pizza sauce and just cheese.',
      regularPrice: 120,
      mediumPrice: 180,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      badge: 'Classic',
      category: 'signature',
      tags: ['Cheese', 'Popular'],
    },
    {
      id: '2',
      name: 'Tomato',
      description: 'Pizza sauce, tomato, and cheese.',
      regularPrice: 140,
      mediumPrice: 200,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      badge: 'Veg',
      category: 'signature',
      tags: ['Tomato', 'Cheese'],
    },
    {
      id: '3',
      name: 'Onion',
      description: 'Pizza sauce, onion, and cheese.',
      regularPrice: 140,
      mediumPrice: 200,
      image: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=900&q=80',
      badge: 'Veg',
      category: 'signature',
      tags: ['Onion', 'Cheese'],
    },
    {
      id: '4',
      name: 'Corn Delight',
      description: 'Pizza sauce, corn, onion, and cheese.',
      regularPrice: 150,
      mediumPrice: 210,
      image: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=900&q=80',
      badge: 'Sweet Corn',
      category: 'signature',
      tags: ['Corn', 'Cheese'],
    },
    {
      id: '5',
      name: 'Veggie Delight',
      description: 'Pizza sauce, onion, capsicum, tomato, and cheese.',
      regularPrice: 170,
      mediumPrice: 240,
      image: 'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=900&q=80',
      badge: 'House Veg',
      category: 'signature',
      tags: ['Onion', 'Capsicum'],
    },
    {
      id: '6',
      name: 'Spicy-Veg Peri Peri',
      description: 'Peri sauce, red paprika, capsicum, jalapeno, and cheese.',
      regularPrice: 210,
      mediumPrice: 290,
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80',
      badge: 'Spicy',
      category: 'signature',
      tags: ['Peri Peri', 'Jalapeno'],
    },
    {
      id: '7',
      name: 'Loaded Veggie',
      description: 'Onion, capsicum, tomato, corn, jalapeno, and cheese.',
      regularPrice: 230,
      mediumPrice: 320,
      image: 'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=900&q=80',
      badge: 'Loaded',
      category: 'signature',
      tags: ['Corn', 'Jalapeno'],
    },
    {
      id: '8',
      name: 'Makhni Malai Paneer',
      description: 'Onion, capsicum, tomato, marinated paneer, and cheese.',
      regularPrice: 250,
      mediumPrice: 350,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      badge: 'Paneer',
      category: 'signature',
      tags: ['Paneer', 'Rich'],
    },
    {
      id: '9',
      name: 'Mushroom Olive Mix',
      description: 'Onion, capsicum, mushroom, olives, and cheese.',
      regularPrice: 250,
      mediumPrice: 350,
      image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=900&q=80',
      badge: 'Earthy',
      category: 'signature',
      tags: ['Mushroom', 'Olives'],
    },
    {
      id: '10',
      name: 'Spicy Corn Peri Peri',
      description: 'Peri sauce, onion, capsicum, corn, red paprika, and cheese.',
      regularPrice: 270,
      mediumPrice: 370,
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80',
      badge: 'Hot',
      category: 'signature',
      tags: ['Peri Peri', 'Corn'],
    },
    {
      id: '11',
      name: 'Peppery Paneer',
      description: 'Onion, capsicum, marinated spicy paneer, red paprika, and cheese.',
      regularPrice: 300,
      mediumPrice: 400,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      badge: 'Paneer',
      category: 'signature',
      tags: ['Spicy Paneer', 'Paprika'],
    },
    {
      id: '12',
      name: 'Veggie Paradise',
      description: 'Mix veggie, jalapeno, corn, paneer, olives, and cheese.',
      regularPrice: 310,
      mediumPrice: 420,
      image: 'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=900&q=80',
      badge: 'Premium Veg',
      category: 'signature',
      tags: ['Paneer', 'Olives'],
    },
    {
      id: '13',
      name: 'Cheese Storm',
      description: 'Mix veggie, jalapeno, olives, extra loaded cheese.',
      regularPrice: 330,
      mediumPrice: 450,
      image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=900&q=80',
      badge: 'Extra Cheese',
      category: 'signature',
      tags: ['Loaded Cheese', 'Olives'],
    },
    {
      id: '14',
      name: 'Farm Garden',
      description: 'Mix veggie, corn, jalapeno, olives, paneer, mushroom, and cheese.',
      regularPrice: 350,
      mediumPrice: 470,
      image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=900&q=80',
      badge: 'Premium',
      category: 'signature',
      tags: ['Paneer', 'Mushroom'],
    },
  ];

  nonVegMenuItems: MenuItem[] = [
    {
      id: 'nv1',
      name: 'Chicken Kebab Pizza',
      description: 'ITC chicken kebab, onion, and cheese.',
      regularPrice: 300,
      mediumPrice: 420,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
      badge: 'Non Veg',
      category: 'signature',
      tags: ['Chicken', 'Kebab'],
    },
    {
      id: 'nv2',
      name: 'Chicken Salami Pizza',
      description: 'Chicken salami, onion, capsicum, and cheese.',
      regularPrice: 330,
      mediumPrice: 450,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      badge: 'Salami',
      category: 'signature',
      tags: ['Chicken', 'Salami'],
    },
    {
      id: 'nv3',
      name: 'Chicken Corn Pizza',
      description: 'Fresh chicken cubes, corn, onion, and cheese.',
      regularPrice: 330,
      mediumPrice: 450,
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80',
      badge: 'Corn',
      category: 'signature',
      tags: ['Chicken', 'Corn'],
    },
    {
      id: 'nv4',
      name: 'Chicken Garden Pizza',
      description: 'Fresh chicken cubes, onion, capsicum, tomato, jalapeno, and cheese.',
      regularPrice: 390,
      mediumPrice: 500,
      image: "http://localhost:3000/uploads/1775728079732.jpg",
      badge: 'Garden',
      category: 'signature',
      tags: ['Chicken', 'Jalapeno'],
    },
    {
      id: 'nv5',
      name: 'Spicy Peri Peri Chicken Pizza',
      description: 'Fresh chicken cubes, red paprika, capsicum, jalapeno, cheese, and peri sauce.',
      regularPrice: 410,
      mediumPrice: 520,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      badge: 'Spicy',
      category: 'signature',
      tags: ['Chicken', 'Peri Peri'],
    },
    {
      id: 'nv6',
      name: 'Mushroom Chicken Pizza',
      description: 'Mushroom, fresh chicken cubes, onion, capsicum, olive, and cheese.',
      regularPrice: 410,
      mediumPrice: 520,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
      badge: 'Mushroom',
      category: 'signature',
      tags: ['Chicken', 'Mushroom'],
    },
    {
      id: 'nv7',
      name: 'Makhni Chicken Pizza',
      description: 'Marinated fresh chicken and paneer with onion, capsicum, tomato, and cheese.',
      regularPrice: 460,
      mediumPrice: 550,
      image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=80',
      badge: 'Makhni',
      category: 'signature',
      tags: ['Chicken', 'Paneer'],
    },
    {
      id: 'nv8',
      name: 'Triplet Chicken Pizza',
      description: 'ITC chicken kebab, chicken salami, fresh chicken, onion, capsicum, tomato, olive, and cheese.',
      regularPrice: 550,
      mediumPrice: 700,
      image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=900&q=80',
      badge: 'Premium',
      category: 'signature',
      tags: ['Chicken', 'Loaded'],
    },
  ];

  otherMenuItems: OtherMenuItem[] = [
    { id: 'om1', name: 'Veggie Momo', category: 'veg-momos', fullPrice: 100, halfPrice: 60, description: 'Steamed momo' },
    { id: 'om2', name: 'Paneer Momo', category: 'veg-momos', fullPrice: 140, halfPrice: 80, description: 'Steamed momo' },
    { id: 'om3', name: 'Cheese Corn Momo', category: 'veg-momos', fullPrice: 160, halfPrice: 90, description: 'Steamed momo' },
    { id: 'om4', name: 'Veggie Momo', category: 'veg-momos', fullPrice: 120, halfPrice: 70, description: 'Fried momo' },
    { id: 'om5', name: 'Paneer Momo', category: 'veg-momos', fullPrice: 160, halfPrice: 90, description: 'Fried momo' },
    { id: 'om6', name: 'Cheese Corn Momo', category: 'veg-momos', fullPrice: 180, halfPrice: 100, description: 'Fried momo' },
    { id: 'om7', name: 'Veggie Momo', category: 'veg-momos', fullPrice: 160, halfPrice: 100, description: 'Kurkure momo' },
    { id: 'om8', name: 'Paneer Momo', category: 'veg-momos', fullPrice: 180, halfPrice: 110, description: 'Kurkure momo' },
    { id: 'om9', name: 'Cheese Corn Momo', category: 'veg -momos', fullPrice: 220, halfPrice: 130, description: 'Kurkure momo' },

    
    { id: 'om11', name: 'Chicken Steamed Momo', category: 'non-veg-momos', fullPrice: 160, halfPrice: 90 },
    { id: 'om12', name: 'Chicken Fried Momo', category: 'non-veg-momos', fullPrice: 180, halfPrice: 100 },
    { id: 'om13', name: 'Chicken Kurkure Momo', category: 'non-veg-momos', fullPrice: 220, halfPrice: 130 },

    { id: 'om14', name: 'Tandoori Gravy Momo', category: 'gravy-momos', price: 160, description: 'Fried, 6 pcs' },
    { id: 'om15', name: 'Afghani Malai Momo', category: 'gravy-momos', price: 180, description: 'Fried, 6 pcs' },
    { id: 'om16', name: 'Volcano Cheesy Momo', category: 'gravy-momos', price: 200, description: 'Fried, 6 pcs' },

    { id: 'om17', name: 'Tailung Combo', category: 'combos-platter', price: 170, description: '1 burger, fries, mint mojito/cold coffee' },
    { id: 'om18', name: 'Dragon Combo', category: 'combos-platter', price: 170, description: 'Steamed momos, fries, mint mojito/cold coffee' },
    { id: 'om19', name: 'Zeng Combo', category: 'combos-platter', price: 220, description: 'Veg grill sandwich, fries, mint mojito/cold coffee' },
    { id: 'om20', name: 'Crane Combo', category: 'combos-platter', price: 250, description: 'Red sauce pasta, fries, mint mojito/cold coffee' },
    { id: 'om21', name: 'Snackpack Platter', category: 'combos-platter', price: 420, description: 'Paneer pizza, burger, peri fries, gravy momo, steam momo, pasta, drink' },

    { id: 'om22', name: 'Garlic Breadstick', category: 'garlic-bread', price: 120, description: 'With dip' },
    { id: 'om23', name: 'Stuffed Garlic Bread', category: 'garlic-bread', price: 160, description: 'With dip' },
    { id: 'om24', name: 'Tandoori Garlic Bread', category: 'garlic-bread', price: 180 },
    { id: 'om25', name: 'Vegetable Garlic Bread', category: 'garlic-bread', price: 180, description: 'With dip' },

    { id: 'om26', name: 'Red Sauce Pasta', category: 'pasta', price: 150 },
    { id: 'om27', name: 'White Sauce Pasta', category: 'pasta', price: 200 },

    { id: 'om28', name: 'Classic Fries', category: 'fries', regularPrice: 60, mediumPrice: 90 },
    { id: 'om29', name: 'Masala Fries', category: 'fries', regularPrice: 80, mediumPrice: 110 },
    { id: 'om30', name: 'Peri Peri Fries', category: 'fries', regularPrice: 110, mediumPrice: 150, description: 'With dip' },
    { id: 'om31', name: 'Veggie Loaded Fries', category: 'fries', regularPrice: 130, mediumPrice: 180 },
    { id: 'om32', name: 'Cheese Loaded Fries', category: 'fries', regularPrice: 150, mediumPrice: 200, description: 'With dip' },

    { id: 'om33', name: 'Veg Classic Cheesy Burger', category: 'veg-burger', price: 70 },
    { id: 'om34', name: 'Veg Tandoori Cheesy Burger', category: 'veg-burger', price: 85 },
    { id: 'om35', name: 'Peri Peri Cheesy Burger', category: 'veg-burger', price: 85 },
    { id: 'om36', name: 'Crunchy Paneer Cheesy Burger', category: 'veg-burger', price: 100 },

    { id: 'om37', name: 'Veg Grilled Cheese Sandwich', category: 'veg-sandwich', price: 120 },
    { id: 'om38', name: 'Mushroom Corn Cheese Sandwich', category: 'veg-sandwich', price: 160 },
    { id: 'om39', name: 'Paneer Grilled Cheese Sandwich', category: 'veg-sandwich', price: 160 },
    { id: 'om40', name: 'Pizza Sandwich', category: 'veg-sandwich', price: 250 },

    { id: 'om41', name: 'Fresh Lime Soda', category: 'beverages', price: 70 },
    { id: 'om42', name: 'Cold Coffee', category: 'beverages', price: 100 },
    { id: 'om43', name: 'Virgin Mint Mojito', category: 'beverages', price: 100 },
    { id: 'om44', name: 'Dalgona Hot Coffee', category: 'beverages', price: 60 },
  ];

  combosItems: OtherMenuItem[] = [
    { id: 'cb1', name: 'Tallung Combo', category: 'combo', price: 170, description: '1 burger, fries, mint mojito/cold coffee' },
    { id: 'cb2', name: 'Dragon Combo', category: 'combo', price: 170, description: 'Steamed momos, fries, mint mojito/cold coffee' },
    { id: 'cb3', name: 'Zeng Combo', category: 'combo', price: 220, description: 'Veg grill sandwich, fries, mint mojito/cold coffee' },
    { id: 'cb4', name: 'Crane Combo', category: 'combo', price: 250, description: 'Red sauce pasta, fries, mint mojito/cold coffee' },
    { id: 'cb5', name: 'Snackpack Platter', category: 'combo', price: 420, description: 'Paneer pizza, burger, peri fries, gravy momo, steam momo, pasta, drink' },
  ];

  cart: CartItem[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadMenuItemsImages();
    this.loadUserSession();
    this.refreshButtonCounts();
  }

  ionViewWillEnter() {
    this.consumePendingCustomPizza();
    this.loadUserSession();
    this.isUserMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isUserMenuOpen) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('.user-menu')) {
      return;
    }

    this.isUserMenuOpen = false;
  }

  get userInitials(): string {
    if (!this.currentUser?.name) {
      return 'SP';
    }

    const parts = this.currentUser.name.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  }

  goToLogin(): void {
    this.router.navigate(['/login'], {
      state: {
        returnUrl: '/home',
      },
    });
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  openUserSection(section: 'order-history' | 'saved-payments' | 'loyalty-points'): void {
    this.isUserMenuOpen = false;
    this.router.navigate([`/${section}`]);
  }

  logout(): void {
    localStorage.removeItem('snackpackUserSession');
    localStorage.removeItem('snackpackAuthToken');
    this.currentUser = null;
    this.isUserMenuOpen = false;
  }

  private loadUserSession(): void {
    const rawSession = localStorage.getItem('snackpackUserSession');
    if (!rawSession) {
      this.currentUser = null;
      return;
    }

    try {
      const parsed = JSON.parse(rawSession) as UserSession;
      this.currentUser = parsed?.name ? parsed : null;
    } catch {
      this.currentUser = null;
    }
  }

  private consumePendingCustomPizza(): void {
    const state = window.history.state as { customPizza?: CartItem } | null;
    const pending = state?.customPizza;

    if (!pending?.itemKey) {
      return;
    }

    const existing = this.cart.find((item) => item.itemKey === pending.itemKey);
    if (existing) {
      existing.quantity += pending.quantity ?? 1;
    } else {
      this.cart.push({
        ...pending,
        quantity: pending.quantity ?? 1,
        selectedAddons: [...(pending.selectedAddons ?? [])],
      });
    }

    const currentState = window.history.state as Record<string, unknown>;
    const nextState = { ...currentState };
    delete nextState['customPizza'];
    window.history.replaceState(nextState, document.title);
    this.isCartOpen = true;
    this.refreshButtonCounts();
  }

  /**
   * Fetch image URLs from backend API and update menu items
   */
  private loadMenuItemsImages(): void {
    this.apiService.getMenuItemsImages().subscribe({
      next: (items) => {
        if (!items?.length) {
          return;
        }

        const imageMap = this.buildImageMapByName(items);
        this.applyImageMap(this.vegMenuItems, imageMap);
        this.applyImageMap(this.nonVegMenuItems, imageMap);
      },
      error: (err) => {
        console.error('Error loading menu items images:', err);
        // Keep the default images if API fails
      },
    });
  }

  private buildImageMapByName(items: ItemImageApiRow[]): Record<string, string> {
    const imageMap: Record<string, string> = {};
    const latestTimestampByName: Record<string, number> = {};

    items.forEach((item) => {
      const normalizedName = this.normalizeName(item.name);
      if (!normalizedName || !item.image_url) {
        return;
      }

      const modifiedTime = item.modifiedOnServer ? new Date(item.modifiedOnServer).getTime() : 0;
      const previousTime = latestTimestampByName[normalizedName] ?? -1;

      if (modifiedTime >= previousTime) {
        latestTimestampByName[normalizedName] = modifiedTime;
        imageMap[normalizedName] = item.image_url;
      }
    });

    return imageMap;
  }

  private applyImageMap(menuItems: MenuItem[], imageMap: Record<string, string>): void {
    menuItems.forEach((menuItem) => {
      const mappedImage = imageMap[this.normalizeName(menuItem.name)];
      if (mappedImage) {
        menuItem.image = mappedImage;
      }
    });
  }

  private normalizeName(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  get sectionTitle(): string {
    if (this.menuSection === 'veg') {
      return 'Veg Lover\'s Pizza';
    }
    if (this.menuSection === 'nonVeg') {
      return 'Non-Veg Lover\'s Pizza';
    }
    if (this.menuSection === 'combos') {
      return 'Combos & Platter';
    }
    return 'Other Items We Serve';
  }

  get sectionNote(): string {
    if (this.menuSection === 'veg') {
      return 'Green mark indicates vegetarian section';
    }
    if (this.menuSection === 'nonVeg') {
      return 'Red mark indicates non-vegetarian section';
    }
    if (this.menuSection === 'combos') {
      return 'Combo meals and platter deals in one place';
    }
    return 'Browse by category: momos, combos, garlic bread, pasta, fries, burgers, sandwiches, and beverages';
  }

  get currentMenuItems(): MenuItem[] {
    return this.menuSection === 'veg' ? this.vegMenuItems : this.nonVegMenuItems;
  }

  get currentCategories(): MenuCategory[] {
    if (this.menuSection === 'combos') {
      return this.comboCategories;
    }
    return this.menuSection === 'other' ? this.otherCategories : this.categories;
  }

  get filteredItems(): MenuItem[] {
    if (this.menuSection === 'other' || this.menuSection === 'combos') {
      return [];
    }

    if (this.activeCategory === 'All') {
      return this.currentMenuItems;
    }

    const category = this.categories.find(item => item.label === this.activeCategory);
    return category
      ? this.currentMenuItems.filter(item => item.category === category.id)
      : this.currentMenuItems;
  }

  get filteredOtherItems(): OtherMenuItem[] {
    if (this.menuSection !== 'other') {
      return [];
    }

    if (this.activeOtherCategory === 'All') {
      return this.otherMenuItems;
    }

    const category = this.otherCategories.find(item => item.label === this.activeOtherCategory);
    return category ? this.otherMenuItems.filter(item => item.category === category.id) : this.otherMenuItems;
  }

  get filteredCombosItems(): OtherMenuItem[] {
    if (this.menuSection !== 'combos') {
      return [];
    }

    if (this.activeComboCategory === 'All') {
      return this.combosItems;
    }

    const category = this.comboCategories.find(item => item.label === this.activeComboCategory);
    return category ? this.combosItems.filter(item => item.category === category.id) : this.combosItems;
  }

  switchMenuSection(section: MenuSection) {
    this.menuSection = section;
    if (section === 'other') {
      this.activeOtherCategory = 'All';
    } else if (section === 'combos') {
      this.activeComboCategory = 'All';
    } else {
      this.activeCategory = 'All';
    }
  }

  selectCategory(category: MenuCategory) {
    if (this.menuSection === 'other') {
      this.activeOtherCategory = category.label;
      return;
    }

    if (this.menuSection === 'combos') {
      this.activeComboCategory = category.label;
      return;
    }

    if (category.id === 'signature') {
      this.goToMakeYourOwnPizza();
      return;
    }

    this.activeCategory = category.label;
  }

  goToMakeYourOwnPizza() {
    this.router.navigate(['/make-your-own-pizza']);
  }

  isCategoryActive(category: MenuCategory): boolean {
    if (this.menuSection === 'other') {
      return this.activeOtherCategory === category.label;
    }

    if (this.menuSection === 'combos') {
      return this.activeComboCategory === category.label;
    }

    return this.activeCategory === category.label;
  }

  selectSize(itemId: string, size: PizzaSize) {
    this.selectedSizes[itemId] = size;
  }

  getSelectedSize(itemId: string): PizzaSize {
    return this.selectedSizes[itemId] ?? 'Regular';
  }

  getPriceBySize(pizza: MenuItem, size: PizzaSize): number {
    return size === 'Medium' ? pizza.mediumPrice : pizza.regularPrice;
  }

  getMenuDisplayPrice(pizza: MenuItem): number {
    const basePrice = this.getPriceBySize(pizza, this.getSelectedSize(pizza.id));
    const addonPrice = this.getAddonPrice(pizza.id, this.getSelectedSize(pizza.id));
    return basePrice + addonPrice;
  }

  getAddonUnitPrice(addon: Addon, size: PizzaSize): number {
    return size === 'Medium' ? addon.mediumPrice : addon.regularPrice;
  }

  getAddonDisplayPrice(addon: Addon, pizzaId: string): number {
    return this.getAddonUnitPrice(addon, this.getSelectedSize(pizzaId));
  }

  toggleAddon(pizzaId: string, addonId: string) {
    if (!this.selectedAddons[pizzaId]) {
      this.selectedAddons[pizzaId] = [];
    }
    const index = this.selectedAddons[pizzaId].indexOf(addonId);
    if (index > -1) {
      this.selectedAddons[pizzaId].splice(index, 1);
      if (this.selectedAddonChoices[pizzaId]) {
        delete this.selectedAddonChoices[pizzaId][addonId];
      }
    } else {
      this.selectedAddons[pizzaId].push(addonId);
    }
  }

  hasAddonChoices(addonId: string): boolean {
    return (this.addonChoices[addonId]?.length ?? 0) > 0;
  }

  getAddonChoices(addonId: string): string[] {
    return this.addonChoices[addonId] ?? [];
  }

  toggleAddonChoice(pizzaId: string, addonId: string, choice: string) {
    if (!this.selectedAddonChoices[pizzaId]) {
      this.selectedAddonChoices[pizzaId] = {};
    }
    if (!this.selectedAddonChoices[pizzaId][addonId]) {
      this.selectedAddonChoices[pizzaId][addonId] = [];
    }

    const choices = this.selectedAddonChoices[pizzaId][addonId];
    const index = choices.indexOf(choice);
    if (index > -1) {
      choices.splice(index, 1);
    } else {
      choices.push(choice);
    }
  }

  isAddonChoiceSelected(pizzaId: string, addonId: string, choice: string): boolean {
    return this.selectedAddonChoices[pizzaId]?.[addonId]?.includes(choice) ?? false;
  }

  getSelectedAddonChoices(pizzaId: string, addonId: string): string[] {
    return this.selectedAddonChoices[pizzaId]?.[addonId] ?? [];
  }

  getAddonChargeUnits(pizzaId: string, addonId: string): number {
    if (!this.hasAddonChoices(addonId)) {
      return 1;
    }

    const selectedChoices = this.getSelectedAddonChoices(pizzaId, addonId);
    return selectedChoices.length > 0 ? selectedChoices.length : 1;
  }

  getAddonCartLabel(addonId: string, pizzaId: string): string {
    const addonName = this.availableAddons.find(a => a.id === addonId)?.name ?? addonId;
    const selectedChoices = this.getSelectedAddonChoices(pizzaId, addonId);

    if (selectedChoices.length > 0) {
      return `${addonName} (${selectedChoices.join(', ')})`;
    }

    return addonName;
  }

  isAddonSelected(pizzaId: string, addonId: string): boolean {
    return this.selectedAddons[pizzaId]?.includes(addonId) ?? false;
  }

  getSelectedAddonIds(pizzaId: string): string[] {
    return this.selectedAddons[pizzaId] ?? [];
  }

  getAddonPrice(pizzaId: string, size: PizzaSize): number {
    const addonIds = this.getSelectedAddonIds(pizzaId);
    return addonIds.reduce((total, addonId) => {
      const addon = this.availableAddons.find(a => a.id === addonId);
      if (!addon) {
        return total;
      }

      const addonUnits = this.getAddonChargeUnits(pizzaId, addonId);
      return total + this.getAddonUnitPrice(addon, size) * addonUnits;
    }, 0);
  }

  addToCart(pizza: MenuItem) {
    this.triggerAddButtonAnimation(this.getPizzaAddButtonKey(pizza.id));
    this.triggerAddTick(this.getPizzaAddButtonKey(pizza.id));

    const selectedSize = this.getSelectedSize(pizza.id);
    const addonIds = [...this.getSelectedAddonIds(pizza.id)].sort();
    const addonKeyParts = addonIds.map(addonId => {
      const selectedChoices = [...this.getSelectedAddonChoices(pizza.id, addonId)]
        .map(choice => choice.toLowerCase())
        .sort();
      return selectedChoices.length > 0 ? `${addonId}:${selectedChoices.join('+')}` : addonId;
    }).sort();
    const addonKey = addonKeyParts.length > 0 ? `-${addonKeyParts.join('-')}` : '';
    const itemKey = `${pizza.id}-${selectedSize.toLowerCase()}${addonKey}`;
    const existing = this.cart.find(item => item.itemKey === itemKey);

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push(this.createCartItem(pizza, selectedSize, 1, addonIds, itemKey));
    }
    
    // Clear selected addons after adding to cart
    this.selectedAddons[pizza.id] = [];
    this.selectedAddonChoices[pizza.id] = {};
    this.refreshButtonCounts();
  }

  handlePizzaButtonClick(pizza: MenuItem): void {
    if (this.getPizzaAddedCount(pizza.id) === 0) {
      this.addToCart(pizza);
    }
  }

  incrementPizzaFromButton(pizza: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart(pizza);
  }

  decrementPizzaFromButton(pizza: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.removeOneByItemId(pizza.id);
  }

  goToCheckout() {
    if (this.cart.length === 0) {
      return;
    }

    this.router.navigate(['/checkout'], {
      state: {
        cart: this.cart.map((item) => ({ ...item })),
        subtotal: this.getSubtotal(),
        total: this.getTotal(),
      },
    });
  }

  getOtherItemOptions(item: OtherMenuItem): PriceOption[] {
    const options: PriceOption[] = [];

    if (item.price !== undefined) {
      options.push({ label: 'Standard', price: item.price });
    }
    if (item.fullPrice !== undefined) {
      options.push({ label: 'Full', price: item.fullPrice });
    }
    if (item.halfPrice !== undefined) {
      options.push({ label: 'Half', price: item.halfPrice });
    }
    if (item.regularPrice !== undefined) {
      options.push({ label: 'R', price: item.regularPrice });
    }
    if (item.mediumPrice !== undefined) {
      options.push({ label: 'M', price: item.mediumPrice });
    }

    return options;
  }

  getSelectedOtherOption(item: OtherMenuItem): PriceOption {
    const options = this.getOtherItemOptions(item);
    const selectedLabel = this.selectedOtherOptions[item.id];
    return options.find(option => option.label === selectedLabel) ?? options[0];
  }

  selectOtherOption(itemId: string, label: string) {
    this.selectedOtherOptions[itemId] = label;
  }

  addOtherToCart(item: OtherMenuItem) {
    this.triggerAddButtonAnimation(this.getOtherAddButtonKey(item.id));
    this.triggerAddTick(this.getOtherAddButtonKey(item.id));

    const selected = this.getSelectedOtherOption(item);
    if (!selected) {
      return;
    }

    const itemKey = `${item.id}-${selected.label.toLowerCase()}`;
    const existing = this.cart.find(cartItem => cartItem.itemKey === itemKey);

    if (existing) {
      existing.quantity += 1;
      return;
    }

    this.cart.push({
      itemKey,
      id: item.id,
      name: item.name,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
      quantity: 1,
      selectedVariant: selected.label,
      selectedAddons: [],
      addonPrice: 0,
      unitPrice: selected.price,
    });

    this.refreshButtonCounts();
  }

  handleOtherButtonClick(item: OtherMenuItem): void {
    if (this.getOtherAddedCount(item.id) === 0) {
      this.addOtherToCart(item);
    }
  }

  incrementOtherFromButton(item: OtherMenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addOtherToCart(item);
  }

  decrementOtherFromButton(item: OtherMenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.removeOneByItemId(item.id);
  }

  updateQuantity(itemKey: string, delta: number) {
    this.cart = this.cart.map(item => {
      if (item.itemKey === itemKey) {
        item.quantity += delta;
      }
      return item;
    }).filter(item => item.quantity > 0);

    this.refreshButtonCounts();
  }

  getSubtotal() {
    return this.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  getTotal() {
    return this.getSubtotal();
  }

  formatPrice(value: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  }

  getOtherItemPriceLines(item: OtherMenuItem): string[] {
    const lines: string[] = [];
    if (item.price !== undefined) {
      lines.push(this.formatPrice(item.price));
    }
    if (item.fullPrice !== undefined || item.halfPrice !== undefined) {
      const full = item.fullPrice !== undefined ? `Full ${this.formatPrice(item.fullPrice)}` : '';
      const half = item.halfPrice !== undefined ? `Half ${this.formatPrice(item.halfPrice)}` : '';
      lines.push([full, half].filter(Boolean).join(' | '));
    }
    if (item.regularPrice !== undefined || item.mediumPrice !== undefined) {
      const regular = item.regularPrice !== undefined ? `R ${this.formatPrice(item.regularPrice)}` : '';
      const medium = item.mediumPrice !== undefined ? `M ${this.formatPrice(item.mediumPrice)}` : '';
      lines.push([regular, medium].filter(Boolean).join(' | '));
    }
    return lines;
  }

  getOtherCategoryLabel(categoryId: string): string {
    return this.otherCategories.find(category => category.id === categoryId)?.label ?? categoryId;
  }

  private createCartItem(
    pizza: MenuItem,
    size: PizzaSize,
    quantity: number,
    addonIds: string[] = [],
    itemKey?: string,
  ): CartItem {
    const basePrice = this.getPriceBySize(pizza, size);
    const addonPrice = addonIds.reduce((total, addonId) => {
      const addon = this.availableAddons.find(a => a.id === addonId);
      if (!addon) {
        return total;
      }

      const addonUnits = this.getAddonChargeUnits(pizza.id, addonId);
      return total + this.getAddonUnitPrice(addon, size) * addonUnits;
    }, 0);
    const unitPrice = basePrice + addonPrice;
    const addonLabels = addonIds.map(addonId => this.getAddonCartLabel(addonId, pizza.id));

    return {
      itemKey: itemKey ?? `${pizza.id}-${size.toLowerCase()}${addonIds.length > 0 ? `-${addonIds.join('-')}` : ''}`,
      id: pizza.id,
      name: pizza.name,
      image: pizza.image,
      quantity,
      selectedVariant: size,
      selectedAddons: addonLabels,
      addonPrice,
      unitPrice,
    };
  }

  getPizzaAddButtonKey(itemId: string): string {
    return `pizza-${itemId}`;
  }

  getOtherAddButtonKey(itemId: string): string {
    return `other-${itemId}`;
  }

  isAddAnimating(key: string): boolean {
    return this.activeAddAnimations[key] === true;
  }

  isAddTickVisible(key: string): boolean {
    return this.activeAddTicks[key] === true;
  }

  getPizzaAddedCount(itemId: string): number {
    return this.buttonCountsByItemId[itemId] ?? 0;
  }

  getOtherAddedCount(itemId: string): number {
    return this.buttonCountsByItemId[itemId] ?? 0;
  }

  private triggerAddButtonAnimation(key: string): void {
    this.activeAddAnimations[key] = false;

    // Force reflow so rapid repeated clicks retrigger the animation.
    void document.body.offsetHeight;

    this.activeAddAnimations[key] = true;
    window.setTimeout(() => {
      this.activeAddAnimations[key] = false;
    }, 240);
  }

  private triggerAddTick(key: string): void {
    this.activeAddTicks[key] = true;

    window.setTimeout(() => {
      this.activeAddTicks[key] = false;
    }, 700);
  }

  private refreshButtonCounts(): void {
    const counts: Record<string, number> = {};

    for (const item of this.cart) {
      counts[item.id] = (counts[item.id] ?? 0) + item.quantity;
    }

    this.buttonCountsByItemId = counts;
  }

  private removeOneByItemId(itemId: string): void {
    const index = this.cart.findIndex((item) => item.id === itemId);
    if (index === -1) {
      return;
    }

    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity -= 1;
    } else {
      this.cart.splice(index, 1);
    }

    this.refreshButtonCounts();
  }

}