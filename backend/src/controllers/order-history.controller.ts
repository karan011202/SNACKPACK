import {get, param} from '@loopback/rest';
import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

export class OrderHistoryController {
  constructor(
    @inject('datasources.snackpack') private dataSource: juggler.DataSource,
  ) {}

  @get('/orders/history/{userId}')
  async getOrderHistory(
    @param.path.number('userId') userId: number,
  ) {
    const rows = await this.dataSource.execute(`
  SELECT 
    o.id AS order_id,
    o.table_number,
    o.order_type,
    o.total_amount,
    o.status,
    o.created_on_server,

    mi.name AS item_name,
    mv.name AS variant,
    oi.quantity,
    oi.price

  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  JOIN menu_item_variants mv ON oi.menu_item_variant_id = mv.id
  JOIN menu_items mi ON mv.menu_item_id = mi.id

  WHERE o.user_id = $1
  ORDER BY o.created_on_server DESC
`, [userId]);

// 🔥 GROUP BY ORDER
const ordersMap: any = {};

for (const row of rows as any[]) {
  if (!ordersMap[row.order_id]) {
    ordersMap[row.order_id] = {
      orderId: row.order_id,
      tableNumber: row.table_number,
      orderType: row.order_type,
      totalAmount: row.total_amount,
      status: row.status,
      createdOn: row.created_on_server,
      items: [],
    };
  }

  ordersMap[row.order_id].items.push({
    itemName: row.item_name,
    variant: row.variant,
    quantity: row.quantity,
    price: row.price,
  });
}

// 👉 convert to array
return Object.values(ordersMap);
  }


}