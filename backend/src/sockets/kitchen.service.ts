import {injectable, BindingScope, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {SocketService} from '../services/socket.service';
import {OrdersRepository} from '../repositories';

@injectable({scope: BindingScope.SINGLETON})
export class KitchenService {
  // Simple in-memory map of active orders keyed by order id
  private activeOrders: Map<string, any> = new Map();

  constructor(
    @inject('services.socket') private socketService: SocketService,
    @repository(OrdersRepository) private ordersRepo: OrdersRepository,
  ) {}

  async init() {
    // Load active orders from DB on startup using DB enum labels
    try {
      const labels = await this.getOrderStatusLabels();
      const wanted = labels.filter(l => ['received','accepted','preparing','inqueue','in_queue'].includes(l.toLowerCase().replace(/[^a-z0-9]/g, '')));
      const orders = await this.ordersRepo.find({
        where: {status: {inq: wanted}},
      });
      orders.forEach(o => this.activeOrders.set(o.id, o));
    } catch (err) {
      console.warn('KitchenService.init failed to load orders', err);
    }

    // Attach socket listeners for kitchen sockets
    const io = this.socketService.getIo();
    if (!io) {
      console.warn('[KitchenService] Socket.IO not initialized yet');
      return;
    }

    console.log('[KitchenService] Attaching socket handlers');
    io.on('connection', socket => {
      console.log('[KitchenService] Client connected:', socket.id);
      socket.on('join-room', (room: string) => {
        try {
          console.log('[KitchenService] Client', socket.id, 'joining room', room);
          socket.join(room);
          console.log('[KitchenService] Client', socket.id, 'joined room', room);
        } catch (e) {
          console.warn('[KitchenService] join-room error', e);
        }
      });

      // allow kitchen clients to request accepting/preparing/ready/delivered
      socket.on('update-order-status', async (payload: {orderId: string; status: string}) => {
        try {
          console.log('[KitchenService] update-order-status from', socket.id, payload);
          await this.updateOrderStatus(payload.orderId, payload.status);
        } catch (err) {
          console.warn('update-order-status handler failed', err);
        }
      });
    });
  }

  async addOrder(orderPayload: any) {
    // Keep only active statuses in-memory
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const statusNorm = norm(orderPayload.status || '');
    if (['received', 'accepted', 'preparing', 'inqueue', 'in_queue'].includes(statusNorm)) {
      this.activeOrders.set(orderPayload.id, orderPayload);
      console.log('KitchenService.addOrder -> added', orderPayload.id, orderPayload.status);
    } else {
      console.log('KitchenService.addOrder -> ignored status', orderPayload.id, orderPayload.status);
    }
  }

  async updateOrderStatus(orderId: string, newStatus: string) {
    const labels = await this.getOrderStatusLabels();
    const mapped = this.mapToDbLabel(newStatus, labels);

    if (!mapped) {
      console.warn('Unrecognized order status:', newStatus);
      return;
    }

    // Persist to DB using mapped enum label
    try {
      await this.ordersRepo.updateById(orderId, {status: mapped});
    } catch (err) {
      console.warn('failed to update order status in DB', err);
    }

    // Update in-memory queue
    const upStatus = newStatus?.toUpperCase?.() ?? '';
    if (['READY', 'DELIVERED'].includes(upStatus)) {
      this.activeOrders.delete(orderId);
    } else {
      // Refresh from DB
      try {
        const fresh = await this.ordersRepo.findById(orderId);
        this.activeOrders.set(orderId, fresh);
      } catch {
        // ignore
      }
    }

    // Notify kitchen room and the specific order room
    try {
      this.socketService.emitToRoom('kitchen', 'order-status-update', {orderId, status: mapped});
      this.socketService.emitToRoom(`order-${orderId}`, 'order-status-update', {orderId, status: mapped});
    } catch (err) {
      console.warn('failed to emit order-status-update', err);
    }
  }

  async getOrderStatusLabels(): Promise<string[]> {
    try {
      const rows = await (this.ordersRepo.dataSource as any).execute(`
        SELECT e.enumlabel AS value
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = (
          SELECT udt_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'orders'
            AND column_name = 'status'
          LIMIT 1
        )
        ORDER BY e.enumsortorder
      `);

      return (rows as Array<{value?: string}>)
        .map(r => (typeof r.value === 'string' ? r.value.trim() : ''))
        .filter(Boolean);
    } catch (err) {
      console.warn('failed to fetch order status labels', err);
      return [];
    }
  }

  private mapToDbLabel(input: string, labels: string[]): string | null {
    if (!input || labels.length === 0) return null;
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    const direct = labels.find(l => l.toLowerCase() === input.toLowerCase());
    if (direct) return direct;

    const normalizedInput = norm(input);
    const normalizedMatch = labels.find(l => norm(l) === normalizedInput);
    if (normalizedMatch) return normalizedMatch;

    return null;
  }

  getActiveOrders() {
    return Array.from(this.activeOrders.values());
  }
}

export default KitchenService;
