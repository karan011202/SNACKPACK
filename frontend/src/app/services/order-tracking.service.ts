import {Injectable} from '@angular/core';
import {SocketService} from './socket.service';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class OrderTrackingService {
  constructor(private socket: SocketService) {}

  connectAndTrackOrder(serverUrl: string, orderId: string) {
    this.socket.connect(serverUrl);
    this.socket.joinRoom(`order-${orderId}`);
  }

  onStatusUpdates(): Observable<any> {
    return this.socket.fromEvent('order-status-update');
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export default OrderTrackingService;
