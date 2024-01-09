import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ResponseFunko } from '../funko/dto/response-funko.dto';
import { Notificacion } from './models/notificacion.model';

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/funkos`;
@WebSocketGateway({
  namespace: ENDPOINT,
})
export class FunkoNotificationsGateway {
  @WebSocketServer()
  private server: Server;
  private readonly logger = new Logger(FunkoNotificationsGateway.name);
  constructor() {
    this.logger.log(`FunkosNotificationsGateway is listening on ${ENDPOINT}`);
  }
  sendMessage(notification: Notificacion<ResponseFunko>) {
    this.server.emit('updates', notification);
  }
  private handleConnection(client: Socket) {
    // Este método se ejecutará cuando un cliente se conecte al WebSocket
    this.logger.debug('Cliente conectado:', client.id);
    this.server.emit(
      'connection',
      'Updates Notifications WS: Funkos - Tienda API NestJS',
    );
  }

  private handleDisconnect(client: Socket) {
    // Este método se ejecutará cuando un cliente se desconecte del WebSocket
    console.log('Cliente desconectado:', client.id);
    this.logger.debug('Cliente desconectado:', client.id);
  }
}
