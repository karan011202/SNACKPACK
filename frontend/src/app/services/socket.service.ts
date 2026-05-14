import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {io, Socket} from 'socket.io-client';

@Injectable({providedIn: 'root'})
export class SocketService {
  private socket?: Socket;

  connect(serverUrl: string, options?: any) {
    if (this.socket && this.socket.connected) {
      console.log('[SocketService] Already connected');
      return;
    }
    console.log('[SocketService] Connecting to', serverUrl);
    this.socket = io(serverUrl, {reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 5000, ...options});
    this.socket.on('connect', () => console.log('[SocketService] Connected'));
    this.socket.on('disconnect', () => console.log('[SocketService] Disconnected'));
    this.socket.on('error', (err) => console.warn('[SocketService] Error', err));
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = undefined;
  }

  emit(event: string, payload?: any) {
    this.socket?.emit(event, payload);
  }

  joinRoom(room: string) {
    if (!this.socket) {
      console.warn('[SocketService] joinRoom called before socket was created');
      return;
    }

    const emitJoin = () => {
      console.log('[SocketService] Joining room', room);
      this.socket?.emit('join-room', room);
    };

    if (this.socket.connected) {
      emitJoin();
      return;
    }

    this.socket.once('connect', emitJoin);
  }

  fromEvent<T = any>(event: string): Observable<T> {
    return new Observable<T>(subscriber => {
      const handler = (payload: T) => subscriber.next(payload);
      this.socket?.on(event, handler);
      return () => {
        this.socket?.off(event, handler);
      };
    });
  }
}

export default SocketService;
