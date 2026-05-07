import {Injectable} from '@angular/core';

interface UserSession {
  name: string;
  email: string;
  phone: string;
  loggedInAt?: string;
}

export type OrderHistoryStatus = 'Delivered' | 'Preparing' | 'Cancelled';

export type OrderProgressStatus =
  | 'Order Received'
  | 'In the Oven'
  | 'Coming to Table'
  | 'Delivered'
  | 'Cancelled';

export interface StoredOrderLineItem {
  name: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface StoredOrderHistoryRecord {
  id: string;
  createdAt: string;
  status: OrderHistoryStatus | OrderProgressStatus;
  total: number;
  items: string[];
  lineItems?: StoredOrderLineItem[];
  tableNumber?: string;
  estimatedTime?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface NewOrderHistoryRecord {
  id: string;
  total: number;
  items: string[];
  lineItems: StoredOrderLineItem[];
  tableNumber: string;
  estimatedTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  private readonly SESSION_KEY = 'snackpackUserSession';
  private readonly ORDER_HISTORY_KEY_PREFIX = 'snackpackOrderHistory';
  private readonly MAX_HISTORY_ITEMS = 50;
  private readonly ORDER_RECEIVED_MINUTES = 2;
  private readonly IN_OVEN_MINUTES = 8;
  private readonly COMING_TO_TABLE_MINUTES = 15;

  appendOrderForCurrentUser(order: NewOrderHistoryRecord): boolean {
    const storageKey = this.getStorageKeyForCurrentUser();
    if (!storageKey) {
      return false;
    }

    const existing = this.readHistory(storageKey);
    const next: StoredOrderHistoryRecord[] = [
      {
        ...order,
        id: this.normalizeOrderId(order.id),
        createdAt: new Date().toISOString(),
        status: 'Order Received' as OrderProgressStatus,
      },
      ...existing,
    ].slice(0, this.MAX_HISTORY_ITEMS);

    localStorage.setItem(storageKey, JSON.stringify(next));
    return true;
  }

  getOrderHistoryForCurrentUser(): StoredOrderHistoryRecord[] {
    const storageKey = this.getStorageKeyForCurrentUser();
    if (!storageKey) {
      return [];
    }

    return this.readHistory(storageKey).map(order => this.withComputedStatus(order));
  }

  getOrderByIdForCurrentUser(orderId: string): StoredOrderHistoryRecord | null {
    const normalizedId = this.normalizeOrderId(orderId);
    const orders = this.getOrderHistoryForCurrentUser();
    return orders.find(order => this.normalizeOrderId(order.id) === normalizedId) ?? null;
  }

  hasCurrentUserSession(): boolean {
    return !!this.getStorageKeyForCurrentUser();
  }

  private readHistory(storageKey: string): StoredOrderHistoryRecord[] {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as StoredOrderHistoryRecord[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter(order => !!order?.id && Array.isArray(order?.items))
        .map(order => ({
          ...order,
          id: this.normalizeOrderId(order.id),
          status: this.normalizeStoredStatus(order.status),
          lineItems: this.normalizeLineItems(order),
        }));
    } catch {
      return [];
    }
  }

  private normalizeLineItems(order: StoredOrderHistoryRecord): StoredOrderLineItem[] {
    if (Array.isArray(order.lineItems) && order.lineItems.length > 0) {
      return order.lineItems;
    }

    return order.items.map(label => ({
      name: label,
      variant: '',
      quantity: 1,
      unitPrice: 0,
      image:
        'https://images.unsplash.com/photo-1548365328-9f547fb0953a?auto=format&fit=crop&w=300&q=80',
    }));
  }

  private normalizeStoredStatus(status: StoredOrderHistoryRecord['status']): OrderProgressStatus {
    if (status === 'Cancelled') {
      return 'Cancelled';
    }

    if (status === 'Delivered') {
      return 'Delivered';
    }

    if (status === 'Preparing') {
      return 'Order Received';
    }

    if (
      status === 'Order Received' ||
      status === 'In the Oven' ||
      status === 'Coming to Table'
    ) {
      return status;
    }

    return 'Order Received';
  }

  private withComputedStatus(order: StoredOrderHistoryRecord): StoredOrderHistoryRecord {
    const normalizedStatus = this.normalizeStoredStatus(order.status);
    if (normalizedStatus === 'Cancelled' || normalizedStatus === 'Delivered') {
      return {
        ...order,
        status: normalizedStatus,
      };
    }

    const createdAt = new Date(order.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return {
        ...order,
        status: normalizedStatus,
      };
    }

    const elapsedMinutes = (Date.now() - createdAt.getTime()) / 60000;
    let status: OrderProgressStatus = 'Delivered';

    if (elapsedMinutes < this.ORDER_RECEIVED_MINUTES) {
      status = 'Order Received';
    } else if (elapsedMinutes < this.IN_OVEN_MINUTES) {
      status = 'In the Oven';
    } else if (elapsedMinutes < this.COMING_TO_TABLE_MINUTES) {
      status = 'Coming to Table';
    }

    return {
      ...order,
      status,
    };
  }

  private normalizeOrderId(id: string): string {
    return id.replace(/^#/, '').trim().toUpperCase();
  }

  private getStorageKeyForCurrentUser(): string | null {
    const session = this.getCurrentUserSession();
    if (!session) {
      return null;
    }

    const normalizedEmail = session.email.trim().toLowerCase();
    const normalizedPhone = session.phone.replace(/\D/g, '');

    if (!normalizedEmail || !normalizedPhone) {
      return null;
    }

    return `${this.ORDER_HISTORY_KEY_PREFIX}:${normalizedPhone}:${normalizedEmail}`;
  }

  private getCurrentUserSession(): UserSession | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as UserSession;
      if (!parsed?.name || !parsed?.email || !parsed?.phone) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }
}