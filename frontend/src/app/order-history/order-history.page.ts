import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  OrderHistoryService,
  OrderProgressStatus,
  StoredOrderHistoryRecord,
} from '../services/order-history.service';

interface PastOrder {
  id: string;
  orderId: string;
  date: string;
  status: OrderProgressStatus;
  total: number;
  items: string[];
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  standalone: false,
})
export class OrderHistoryPage implements OnInit {
  orders: PastOrder[] = [];
  hasSession = false;

  constructor(
    private router: Router,
    private orderHistoryService: OrderHistoryService,
  ) {}

  ngOnInit(): void {
    this.hydrateOrders();
  }

  ionViewWillEnter(): void {
    this.hydrateOrders();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openOrder(order: PastOrder): void {
    this.router.navigate(['/order-confirmation', order.orderId]);
  }

  getStatusClass(status: OrderProgressStatus): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  }

  private hydrateOrders(): void {
    this.hasSession = this.orderHistoryService.hasCurrentUserSession();

    const storedOrders = this.orderHistoryService.getOrderHistoryForCurrentUser();
    this.orders = storedOrders.map(order => this.mapStoredOrder(order));
  }

  private mapStoredOrder(order: StoredOrderHistoryRecord): PastOrder {
    return {
      id: `#${order.id}`,
      orderId: order.id,
      date: this.formatOrderDate(order.createdAt),
      status: order.status as OrderProgressStatus,
      total: order.total,
      items: order.items,
    };
  }

  private formatOrderDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
}
