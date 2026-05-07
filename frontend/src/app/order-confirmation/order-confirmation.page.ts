import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  OrderHistoryService,
  OrderProgressStatus,
  StoredOrderHistoryRecord,
} from '../services/order-history.service';

interface TimelineStep {
  label: 'Order Received' | 'In the Oven' | 'Coming to Table' | 'Delivered';
  icon: 'check' | 'clock' | 'table' | 'done';
}

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.page.html',
  styleUrls: ['./order-confirmation.page.scss'],
  standalone: false,
})
export class OrderConfirmationPage implements OnInit {
  order: StoredOrderHistoryRecord | null = null;
  orderDisplayId = '';
  progressStatus: OrderProgressStatus = 'Order Received';

  readonly timelineSteps: TimelineStep[] = [
    {label: 'Order Received', icon: 'check'},
    {label: 'In the Oven', icon: 'clock'},
    {label: 'Coming to Table', icon: 'table'},
    {label: 'Delivered', icon: 'done'},
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderHistoryService: OrderHistoryService,
  ) {}

  ngOnInit(): void {
    this.loadOrder();
  }

  goBackToHistory(): void {
    this.router.navigate(['/order-history']);
  }

  goBackToMenu(): void {
    this.router.navigate(['/home']);
  }

  isStepActive(step: TimelineStep): boolean {
    if (this.progressStatus === 'Cancelled') {
      return step.label === 'Order Received';
    }

    return this.timelineIndex(step.label) <= this.timelineIndex(this.progressStatus);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  }

  private loadOrder(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (!orderId) {
      this.order = null;
      return;
    }

    this.order = this.orderHistoryService.getOrderByIdForCurrentUser(orderId);
    if (!this.order) {
      return;
    }

    this.orderDisplayId = `#${this.order.id}`;
    this.progressStatus = this.order.status as OrderProgressStatus;
  }

  private timelineIndex(status: TimelineStep['label'] | OrderProgressStatus): number {
    const orderFlow: Record<TimelineStep['label'], number> = {
      'Order Received': 0,
      'In the Oven': 1,
      'Coming to Table': 2,
      Delivered: 3,
    };

    if (status === 'Cancelled') {
      return 0;
    }

    return orderFlow[status as TimelineStep['label']] ?? 0;
  }
}
