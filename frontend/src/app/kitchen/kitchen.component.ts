import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import { HttpClientModule, HttpParams, HttpResponse } from '@angular/common/http';
import {interval, Subscription as RxSub} from 'rxjs';
import {SocketService} from '../services/socket.service';
import {EnvironmentService} from '../services/environment.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule],
  templateUrl: './kitchen.component.html',
  styleUrls: ['./kitchen.component.scss'],
})
export class KitchenComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  subs: Subscription[] = [];
  timerSub?: RxSub;
  showHistory = false;
  historyOrders: any[] = [];
  isLoadingHistory = false;
  // Pagination + totals for history
  historyPage = 1;
  historyPageSize = 20;
  historyTotal: number | null = null;
  hasMoreHistory = false;

  constructor(
    private socket: SocketService,
    private env: EnvironmentService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    // Connect to backend Socket.IO server using environment URL
    const backendUrl = this.env.getBackendUrl();
    console.log('[KitchenComponent] Connecting to', backendUrl);
    this.socket.connect(backendUrl);

    // Set up event listeners after the socket has been created
    this.subs.push(
      this.socket.fromEvent('new-order').subscribe((payload: any) => {
        console.log('[KitchenComponent] Received new-order', payload);
        if (['IN_QUEUE', 'PREPARING', 'ACCEPTED', 'in_queue'].includes((payload.status || '').toUpperCase())) {
          this.orders.unshift(payload);
          console.log('[KitchenComponent] Added to queue. Total orders:', this.orders.length);
        }
      }),
    );

    this.subs.push(
      this.socket.fromEvent('order-status-update').subscribe((u: any) => {
        console.log('[KitchenComponent] Received order-status-update', u);
        if (u?.status) {
          const s = (u.status || '').toUpperCase();
          if (['READY', 'DELIVERED'].includes(s)) {
            this.orders = this.orders.filter(o => o.id !== u.orderId);
          } else {
            this.orders = this.orders.map(o => (o.id === u.orderId ? {...o, status: u.status} : o));
          }
        }
      }),
    );

    console.log('[KitchenComponent] Joining kitchen room');
    this.socket.joinRoom('kitchen');

    // Load currently active orders from backend on init
    this.loadActiveOrders();

    // Start a simple interval to update elapsed times every second
    this.timerSub = interval(1000).subscribe(() => {
      this.orders = this.orders.map(o => ({...o, elapsed: this.computeElapsed(o)}));
    });
  }

  setAccepted(o: any) {
    // Accept moves to preparing in this system
    this.socket.emit('update-order-status', {orderId: o.id, status: 'preparing'});
  }
  
  setPreparing(o: any) {
    this.socket.emit('update-order-status', {orderId: o.id, status: 'preparing'});
  }

  setReady(o: any) {
    this.socket.emit('update-order-status', {orderId: o.id, status: 'ready'});
  }

  setDelivered(o: any) {
    this.socket.emit('update-order-status', {orderId: o.id, status: 'delivered'});
  }

  formatTableNumber(order: any): string {
    const raw = `${order?.tableNumber || order?.table || order?.tableNo || order?.table_name || ''}`.trim();
    if (!raw) return 'Table —';

    const normalized = raw.toLowerCase().replace(/^table\s*/i, '').trim();
    const pretty = normalized.match(/^([a-z]+)(\d+)$/i);
    if (pretty) {
      return `Table ${pretty[1].toUpperCase()}${pretty[2]}`;
    }

    return `Table ${raw}`;
  }

  formatItemName(item: any): string {
    const name = item?.name || item?.itemName || item?.menuItemName || item?.displayName || item?.title || '';
    if (name) return name;
    if (item?.menuItemId) return `Item ${item.menuItemId}`;
    return 'Item';
  }

  // Addon ID to name mapping (must match home.page.ts availableAddons)
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
    const formatted = selectedAddons
      .map(addon => {
        // If it looks like an ID (lowercase with hyphens), try mapping it
        if (/^[a-z]+-[a-z-]+$/.test(addon)) {
          return this.addonNames[addon] || addon;
        }
        // Otherwise assume it's already a label and return as-is
        return addon;
      })
      .join(', ');
    console.log('[KitchenComponent] formatAddons input:', selectedAddons, 'output:', formatted);
    return formatted;
  }

  formatPrice(value: number): string {
    try {
      const n = Number(value ?? 0);
      if (!Number.isFinite(n)) return '';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(n);
    } catch (e) {
      return String(value ?? '');
    }
  }

  openHistory(): void {
    // Toggle inline history view; fetch recent orders when enabling
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.loadHistoryOrders(true);
    }
  }

  openOrders(): void {
    this.showHistory = false;
    this.loadActiveOrders();
  }

  private loadActiveOrders(): void {
    const base = this.env.getBackendUrl();
    this.http.get<any[]>(`${base}/kitchen/active`).subscribe(
      data => {
        if (Array.isArray(data)) this.orders = data.concat(this.orders.filter(o => !data.find(d => d.id === o.id)));
      },
      err => console.warn('Failed to load active orders', err),
    );
  }

  loadHistoryOrders(reset = true): void {
    if (this.isLoadingHistory) return;
    if (reset) {
      this.historyPage = 1;
      this.historyOrders = [];
      this.historyTotal = null;
      this.hasMoreHistory = false;
    }

    this.isLoadingHistory = true;
    const base = this.env.getBackendUrl();
    const params = new HttpParams().set('page', String(this.historyPage)).set('limit', String(this.historyPageSize));

    this.http
      .get<any[]>(`${base}/kitchen/history`, { params, observe: 'response' as const })
      .subscribe(
        (resp: HttpResponse<any[]>) => {
          const data = resp.body ?? [];
          const totalHeader = resp.headers.get('x-total-count') || resp.headers.get('X-Total-Count') || resp.headers.get('x-total') || resp.headers.get('X-Total');
          if (totalHeader) {
            this.historyTotal = Number(totalHeader);
          } else if (reset) {
            // If backend doesn't provide a total header and this is the first page, assume returned length is total
            this.historyTotal = Array.isArray(data) ? data.length : 0;
          } else {
            this.historyTotal = (this.historyTotal ?? 0) + (Array.isArray(data) ? data.length : 0);
          }

          this.historyOrders = this.historyOrders.concat(Array.isArray(data) ? data : []);
          this.hasMoreHistory = Array.isArray(data) ? data.length === this.historyPageSize && (this.historyTotal === null || this.historyOrders.length < this.historyTotal) : false;
          this.isLoadingHistory = false;
          this.historyPage++;
        },
        err => {
          console.warn('Failed to load history orders', err);
          this.isLoadingHistory = false;
        },
      );
  }

  loadMoreHistory(): void {
    if (!this.hasMoreHistory || this.isLoadingHistory) return;
    this.loadHistoryOrders(false);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.socket.disconnect();
    this.timerSub?.unsubscribe();
  }

  private computeElapsed(o: any) {
    if (!o || !o.createdAt) return '';
    try {
      const start = new Date(o.createdAt).getTime();
      const diff = Math.max(0, Date.now() - start);
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    } catch {
      return '';
    }
  }
}
