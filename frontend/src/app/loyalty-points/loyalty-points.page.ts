import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {LoyaltyWalletActivity, LoyaltyWalletService} from '../services/loyalty-wallet.service';

interface LoyaltyEvent {
  title: string;
  pointsDelta: number;
  date: string;
}

@Component({
  selector: 'app-loyalty-points',
  templateUrl: './loyalty-points.page.html',
  styleUrls: ['./loyalty-points.page.scss'],
  standalone: false,
})
export class LoyaltyPointsPage implements OnInit {
  hasSession = false;
  totalPoints = 0;
  totalEarnedPoints = 0;
  totalRedeemedPoints = 0;
  nextRewardAt = 500;

  recentEvents: LoyaltyEvent[] = [];

  constructor(
    private router: Router,
    private loyaltyWalletService: LoyaltyWalletService,
  ) {}

  ngOnInit(): void {
    this.hydrateWallet();
  }

  ionViewWillEnter(): void {
    this.hydrateWallet();
  }

  get progressPercent(): number {
    return Math.min(100, Math.round((this.totalPoints / this.nextRewardAt) * 100));
  }

  formatPoints(pointsDelta: number): string {
    return `${pointsDelta >= 0 ? '+' : ''}${pointsDelta} pts`;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  private hydrateWallet(): void {
    this.hasSession = this.loyaltyWalletService.hasCurrentUserSession();
    const wallet = this.loyaltyWalletService.getWalletForCurrentUser();
    this.totalPoints = wallet.availablePoints;
    this.totalEarnedPoints = wallet.totalEarnedPoints;
    this.totalRedeemedPoints = wallet.totalRedeemedPoints;
    this.recentEvents = wallet.activities.slice(0, 8).map(activity => this.mapActivity(activity));
  }

  private mapActivity(activity: LoyaltyWalletActivity): LoyaltyEvent {
    return {
      title: activity.title,
      pointsDelta: activity.pointsDelta,
      date: this.formatDate(activity.date),
    };
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}
