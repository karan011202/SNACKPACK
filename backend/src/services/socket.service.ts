import {injectable, BindingScope} from '@loopback/core';
import {Server as IOServer, Socket} from 'socket.io';

@injectable({scope: BindingScope.SINGLETON})
export class SocketService {
  private io?: IOServer;

  setIo(io: IOServer) {
    this.io = io;
  }

  getIo(): IOServer | undefined {
    return this.io;
  }

  emitToRoom(room: string, event: string, payload: unknown) {
    if (!this.io) {
      console.warn('[SocketService] emitToRoom failed: io not initialized');
      return;
    }
    try {
      this.io.to(room).emit(event, payload);
    } catch (err) {
      console.warn('emitToRoom error', err);
    }
  }

  emit(event: string, payload: unknown) {
    if (!this.io) return;
    try {
      this.io.emit(event, payload);
    } catch (err) {
      console.warn('emit error', err);
    }
  }

  onConnection(handler: (socket: Socket) => void) {
    if (!this.io) return;
    this.io.on('connection', handler);
  }
}

export default SocketService;
