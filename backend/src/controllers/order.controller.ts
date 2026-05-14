import {HttpErrors, post, requestBody} from '@loopback/rest';
import {repository} from '@loopback/repository';
import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
const {v4: uuidv4} = require('uuid');

import {
  OrdersRepository,
  OrderItemsRepository,
  MenuItemVariantsRepository,
  MenuItemsRepository,
  UsersRepository,
} from '../repositories';
import {SocketService} from '../services/socket.service';
import {KitchenService} from '../sockets/kitchen.service';

type OrderRequestItem = {
  variantId?: string;
  menuItemId?: string;
  name?: string;
  variantName?: string;
  unitPrice?: number;
  quantity: number;
  selectedAddons?: string[];
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class OrderController {
  constructor(
    @repository(OrdersRepository)
    private ordersRepo: OrdersRepository,

    @repository(OrderItemsRepository)
    private orderItemsRepo: OrderItemsRepository,

    @repository(MenuItemVariantsRepository)
    private variantRepo: MenuItemVariantsRepository,

    @repository(MenuItemsRepository)
    private menuItemsRepo: MenuItemsRepository,

    @repository(UsersRepository)
    private usersRepo: UsersRepository,

    @inject('datasources.snackpack')
    private dataSource: juggler.DataSource,
    @inject('services.socket')
    private socketService: SocketService,
    @inject('services.kitchen')
    private kitchenService: KitchenService,
  ) {}

  @post('/orders/place')
  async placeOrder(
    @requestBody() body: {
      userId?: number;
      customerPhone?: string;
      customerName?: string;
      customerEmail?: string;
      tableNumber: string;
      orderType: string;
      redeemedPoints?: number;
      items: OrderRequestItem[];
    },
  ) {
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new HttpErrors.BadRequest('At least one order item is required.');
    }

    const resolvedUserId = await this.resolveUserId(body);

    let totalAmount = 0;

    const itemsWithPrice = [];

    for (const item of body.items) {
      const variant = await this.resolveVariant(item);
      const menuItemName =
        typeof item.name === 'string' && item.name.trim()
          ? item.name.trim()
          : await this.resolveMenuItemName(item.menuItemId);
      const variantPrice = Number(variant?.price);
      const fallbackUnitPrice = Number(item.unitPrice);
      const price = Number.isFinite(variantPrice)
        ? variantPrice
        : Number.isFinite(fallbackUnitPrice)
          ? fallbackUnitPrice
          : NaN;

      if (!Number.isFinite(price) || price < 0) {
        throw new HttpErrors.BadRequest(
          `Unable to resolve price for item ${item.menuItemId ?? item.variantId ?? 'unknown'}`,
        );
      }

      totalAmount += price * item.quantity;

      const normalizedMenuItemId =
        typeof item.menuItemId === 'string' && UUID_REGEX.test(item.menuItemId.trim())
          ? item.menuItemId.trim()
          : undefined;

      itemsWithPrice.push({
        variantId: variant?.id,
        menuItemId: normalizedMenuItemId,
        itemName: menuItemName,
        variantName: variant?.name || undefined,
        quantity: item.quantity,
        price,
        selectedAddons: item.selectedAddons || [],
      });
    }

    const redeemedPoints = Number(body.redeemedPoints ?? 0);
    const discountedAmount = Math.max(
      0,
      totalAmount - (Number.isFinite(redeemedPoints) ? redeemedPoints : 0),
    );

    const orderId = uuidv4();
    const resolvedOrderType = await this.resolveOrderType(body.orderType);

    await this.ordersRepo.create({
      id: orderId,
      userId: resolvedUserId,
      tableNumber: body.tableNumber,
      orderType: resolvedOrderType,
      totalAmount: discountedAmount,
      status: 'in_queue',
    });

    for (const item of itemsWithPrice) {
      await this.orderItemsRepo.create({
        id: uuidv4(),
        orderId: orderId,
        menuItemId: item.menuItemId,
        menuItemVariantId: item.variantId,
        itemName: item.itemName,
        variantName: item.variantName,
        quantity: item.quantity,
        price: item.price,
      });
    }

    const displayOrderNumber = this.generateDisplayOrderNumber(orderId);

    // Build a lightweight payload for kitchen and customer sockets
    const socketPayload = {
      id: orderId,
      displayOrderNumber,
      totalAmount: discountedAmount,
      items: itemsWithPrice,
      orderType: resolvedOrderType,
      status: 'in_queue',
    };

    // Update in-memory kitchen queue and notify kitchen clients
    try {
      await this.kitchenService.addOrder(socketPayload);
    } catch (err) {
      // don't block order placement on socket errors
      console.warn('kitchenService.addOrder failed', err);
    }

    // Emit to kitchen room
    try {
      this.socketService.emitToRoom('kitchen', 'new-order', socketPayload);
      // Also notify the order-specific room so that customer pages can subscribe
      this.socketService.emitToRoom(`order-${orderId}`, 'new-order', socketPayload);
    } catch (err) {
      // swallow socket errors to keep API stable
      console.warn('socket emit failed', err);
    }

    return {
      success: true,
      orderId: displayOrderNumber,
      totalAmount: discountedAmount,
    };
  }

  private async resolveUserId(body: {
    userId?: number;
    customerPhone?: string;
  }): Promise<number> {
    if (Number.isFinite(body.userId)) {
      return Number(body.userId);
    }

    const phone = body.customerPhone?.trim();
    if (!phone) {
      return 0;
    }

    const user = await this.usersRepo.findOne({
      where: {phoneNumber: phone},
    });

    return user?.userId ?? 0;
  }

  private normalizeEnumKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private async resolveOrderType(inputOrderType: string): Promise<string> {
    const fallback = inputOrderType.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');

    try {
      const rows = await this.dataSource.execute(
        `
        SELECT e.enumlabel AS value
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = (
          SELECT udt_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'orders'
            AND column_name = 'order_type'
          LIMIT 1
        )
        ORDER BY e.enumsortorder
        `,
      );

      const labels = (rows as Array<{value?: string}>)
        .map(row => (typeof row.value === 'string' ? row.value : '').trim())
        .filter(label => label.length > 0);

      if (labels.length === 0) {
        return fallback;
      }

      const normalizedInput = this.normalizeEnumKey(inputOrderType);

      const direct = labels.find(
        label => label.toLowerCase() === inputOrderType.toLowerCase(),
      );
      if (direct) {
        return direct;
      }

      const normalizedMatch = labels.find(
        label => this.normalizeEnumKey(label) === normalizedInput,
      );
      if (normalizedMatch) {
        return normalizedMatch;
      }

      // Safe default for unknown values.
      return labels[0];
    } catch {
      return fallback;
    }
  }

  private generateDisplayOrderNumber(uuid: string): string {
    // Extract last 4 hex chars from UUID and convert to 4 digit number for display
    const hexPart = uuid.replace(/-/g, '').slice(-4);
    const numPart = Math.abs(parseInt(hexPart, 16) % 10000);
    return `AK-${numPart.toString().padStart(4, '0')}`;
  }

  private async resolveVariant(item: OrderRequestItem) {
    const variantId =
      typeof item.variantId === 'string' ? item.variantId.trim() : '';
    const menuItemId =
      typeof item.menuItemId === 'string' ? item.menuItemId.trim() : '';
    const variantName =
      typeof item.variantName === 'string' ? item.variantName.trim() : '';

    if (
      variantId &&
      variantId.toLowerCase() !== 'undefined' &&
      variantId.toLowerCase() !== 'null'
    ) {
      try {
        return await this.variantRepo.findById(variantId);
      } catch {
        // Fall through to name-based lookup when the provided id is invalid.
      }
    }

    const hasUuidMenuItemId = UUID_REGEX.test(menuItemId);

    if (hasUuidMenuItemId && variantName) {
      const variant = await this.variantRepo.findOne({
        where: {
          menuItemId,
          name: variantName,
        },
      });

      if (variant) {
        return variant;
      }
    }

    if (variantName) {
      const variant = await this.variantRepo.findOne({
        where: {
          name: variantName,
        },
      });

      if (variant) {
        return variant;
      }

      const shortName = variantName.toLowerCase() === 'regular'
        ? 'R'
        : variantName.toLowerCase() === 'medium'
          ? 'M'
          : '';

      if (shortName) {
        const aliasVariant = await this.variantRepo.findOne({
          where: {
            name: shortName,
          },
        });

        if (aliasVariant) {
          return aliasVariant;
        }
      }
    }

    return null;
  }

  private async resolveMenuItemName(menuItemId?: string): Promise<string | undefined> {
    const trimmed = typeof menuItemId === 'string' ? menuItemId.trim() : '';
    if (!trimmed) return undefined;

    try {
      const menuItem = await this.menuItemsRepo.findById(trimmed);
      return menuItem?.name?.trim() || undefined;
    } catch {
      return undefined;
    }
  }
}