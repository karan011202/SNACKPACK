import {get, post, requestBody, param, Response, RestBindings} from '@loopback/rest';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {KitchenService} from '../sockets/kitchen.service';
import {OrdersRepository, OrderItemsRepository} from '../repositories';

export class KitchenController {
  constructor(
    @inject('services.kitchen') private kitchen: KitchenService,
    @repository(OrdersRepository) private ordersRepo: OrdersRepository,
    @repository(OrderItemsRepository) private orderItemsRepo: OrderItemsRepository,
  ) {}

  @get('/kitchen/active')
  async active() {
    try {
      return await Promise.resolve(this.kitchen.getActiveOrders());
    } catch (err) {
      console.warn('kitchen.active failed', err);
      return [];
    }
  }

  @get('/kitchen/history')
  async history(
    @param.query.number('page') page = 1,
    @param.query.number('limit') limit = 100,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    try {
      // Only return completed orders. Map our desired completed states to DB enum labels.
      const labels = await this.kitchen.getOrderStatusLabels();
      const desired = labels.filter(l => {
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const n = norm(l);
        return ['ready', 'delivered'].includes(n);
      });

      const whereClause = desired.length > 0 ? {status: {inq: desired}} : {};

      // Ensure sane paging
      const pageNum = Math.max(1, Number(page) || 1);
      const pageSize = Math.max(1, Math.min(1000, Number(limit) || 100));
      const skip = (pageNum - 1) * pageSize;

      // Count total matching rows
      const totalCountObj = await this.ordersRepo.count(whereClause as any);
      const total = totalCountObj?.count ?? 0;

      // Fetch paged rows
      let orders = await this.ordersRepo.find({where: whereClause as any, order: ['created_on_server DESC'], limit: pageSize, skip});

      // Fetch items for each order and attach them
      orders = await Promise.all(
        orders.map(async (order: any) => {
          const items = await this.orderItemsRepo.find({where: {orderId: order.id}});
          return {...order, items};
        }),
      );

      // Set total header so clients can show accurate totals
      try {
        response.setHeader('X-Total-Count', String(total));
      } catch (hdrErr) {
        // ignore header set errors
      }

      return orders;
    } catch (err) {
      console.warn('kitchen.history failed', err);
      return [];
    }
  }

  @post('/kitchen/update-status')
  async updateStatus(@requestBody() body: {orderId: string; status: string}) {
    try {
      await this.kitchen.updateOrderStatus(body.orderId, body.status);
      return {ok: true};
    } catch (err) {
      console.warn('kitchen.updateStatus failed', err);
      return {ok: false};
    }
  }

  @get('/kitchen/status-labels')
  async statusLabels() {
    try {
      return {labels: await this.kitchen.getOrderStatusLabels()};
    } catch (err) {
      console.warn('kitchen.statusLabels failed', err);
      return {labels: []};
    }
  }

  // Temporary debug endpoint to inspect orders in DB (returns recent 200)
  @get('/kitchen/_debug/orders')
  async debugOrders() {
    try {
      const orders = await this.ordersRepo.find({order: ['created_on_server DESC'], limit: 200});
      return {count: orders.length, orders};
    } catch (err) {
      console.warn('kitchen.debugOrders failed', err);
      return {count: 0, orders: []};
    }
  }
}
