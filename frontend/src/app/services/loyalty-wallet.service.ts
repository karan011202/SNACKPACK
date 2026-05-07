import {Injectable} from '@angular/core';

interface UserSession {
  name: string;
  email: string;
  phone: string;
}

export interface LoyaltyWalletActivity {
  id: string;
  title: string;
  pointsDelta: number;
  date: string;
}

export interface LoyaltyWallet {
  availablePoints: number;
  totalEarnedPoints: number;
  totalRedeemedPoints: number;
  updatedAt: string;
  activities: LoyaltyWalletActivity[];
}

export interface LoyaltyOrderTransaction {
  orderId: string;
  redeemedPoints: number;
  earnedPoints: number;
}

@Injectable({
  providedIn: 'root',
})
export class LoyaltyWalletService {
  private readonly SESSION_KEY = 'snackpackUserSession';
  private readonly LOYALTY_WALLET_KEY_PREFIX = 'snackpackLoyaltyWallet';
  private readonly MAX_ACTIVITY_ITEMS = 100;

  hasCurrentUserSession(): boolean {
    return !!this.getStorageKeyForCurrentUser();
  }

  getWalletForCurrentUser(): LoyaltyWallet {
    const storageKey = this.getStorageKeyForCurrentUser();
    if (!storageKey) {
      return this.getEmptyWallet();
    }

    return this.readWallet(storageKey);
  }

  recordOrderTransactionForCurrentUser(transaction: LoyaltyOrderTransaction): boolean {
    const storageKey = this.getStorageKeyForCurrentUser();
    if (!storageKey) {
      return false;
    }

    const wallet = this.readWallet(storageKey);
    const redeemedPoints = Math.max(
      0,
      Math.min(Math.floor(transaction.redeemedPoints), wallet.availablePoints),
    );
    const earnedPoints = Math.max(0, Math.floor(transaction.earnedPoints));
    const orderLabel = transaction.orderId.startsWith('#')
      ? transaction.orderId
      : `#${transaction.orderId}`;

    const nextActivities = [...wallet.activities];
    if (redeemedPoints > 0) {
      nextActivities.unshift({
        id: `${Date.now()}-redeem-${Math.random().toString(36).slice(2, 8)}`,
        title: `Redeemed on Order ${orderLabel}`,
        pointsDelta: -redeemedPoints,
        date: new Date().toISOString(),
      });
    }

    if (earnedPoints > 0) {
      nextActivities.unshift({
        id: `${Date.now()}-earn-${Math.random().toString(36).slice(2, 8)}`,
        title: `2% Earned on Order ${orderLabel}`,
        pointsDelta: earnedPoints,
        date: new Date().toISOString(),
      });
    }

    const nextWallet: LoyaltyWallet = {
      availablePoints: wallet.availablePoints - redeemedPoints + earnedPoints,
      totalEarnedPoints: wallet.totalEarnedPoints + earnedPoints,
      totalRedeemedPoints: wallet.totalRedeemedPoints + redeemedPoints,
      updatedAt: new Date().toISOString(),
      activities: nextActivities.slice(0, this.MAX_ACTIVITY_ITEMS),
    };

    localStorage.setItem(storageKey, JSON.stringify(nextWallet));
    return true;
  }

  private readWallet(storageKey: string): LoyaltyWallet {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return this.getEmptyWallet();
    }

    try {
      const parsed = JSON.parse(raw) as Partial<LoyaltyWallet>;
      return {
        availablePoints: Math.max(0, Math.floor(parsed.availablePoints ?? 0)),
        totalEarnedPoints: Math.max(0, Math.floor(parsed.totalEarnedPoints ?? 0)),
        totalRedeemedPoints: Math.max(0, Math.floor(parsed.totalRedeemedPoints ?? 0)),
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
        activities: Array.isArray(parsed.activities)
          ? parsed.activities
              .filter(activity => !!activity?.title)
              .map(activity => ({
                id: activity.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                title: activity.title,
                pointsDelta: Math.floor(activity.pointsDelta ?? 0),
                date: activity.date ?? new Date().toISOString(),
              }))
          : [],
      };
    } catch {
      return this.getEmptyWallet();
    }
  }

  private getEmptyWallet(): LoyaltyWallet {
    return {
      availablePoints: 0,
      totalEarnedPoints: 0,
      totalRedeemedPoints: 0,
      updatedAt: new Date().toISOString(),
      activities: [],
    };
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

    return `${this.LOYALTY_WALLET_KEY_PREFIX}:${normalizedPhone}:${normalizedEmail}`;
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