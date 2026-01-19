import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Logger, OnModuleInit } from '@nestjs/common';
import { JwtPayload } from 'src/modules/auth/interfaces';
// Redis adapter removed: no redis dependency
import { SocketService } from './socket-ws.service';

@WebSocketGateway({ cors: true })
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer() wss: Server;
  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly socketService: SocketService,
    private readonly jwtService: JwtService,
  ) {}
  onModuleInit() {
    console.log(`The module has been initialized.`);
    this.socketService.setWss(this.wss);
    // Redis adapter removed - running single-instance or using other scaling strategies
  }
  async handleConnection(client: Socket) {
    try {
      //console.log('New client connected, id:', client.id, client.handshake);
      // accept token in headers.auth, handshake.auth.token or query.token
      const token =
        (client.handshake.headers &&
          (client.handshake.headers.auth as string)) ||
        client.handshake.auth?.token ||
        (client.handshake.query && (client.handshake.query.token as string));

      if (!token) {
        throw new WsException('Token not provided');
      }

      const payload = this.jwtService.verify<JwtPayload>(String(token));
      if (!payload) {
        throw new WsException('Invalid token');
      }

      const userId = payload.id;
      if (!userId) {
        throw new WsException('Token missing id');
      }

      await this.socketService.registerCliente(client, userId);

      this.wss.emit(
        'clients-updated',
        this.socketService.getConnectedClients(),
      );

      this.logger.log(
        `clientes conectados: ${this.socketService.getConnectedClients()}`,
      );
    } catch (error) {
      this.logger.warn('Error during connection: ' + (error?.message ?? error));
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    await this.socketService.removeCliente(client.id);
    this.wss.emit('clients-updated', this.socketService.getConnectedClients());
    this.logger.log(
      `clientes desconectados: ${
        this.socketService.getConnectedClients().length
      }`,
    );
  }
}
