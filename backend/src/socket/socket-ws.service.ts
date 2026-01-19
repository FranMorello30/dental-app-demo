import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getDataSourceToken, InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';

import { User } from 'src/modules/auth/entities/auth.entity';
import { DataSource, Repository } from 'typeorm';
// Redis removed: no dependency on ioredis

interface ConnectedClients {
  [socketId: string]: { socket: Socket; user: User };
}

@Injectable()
export class SocketService implements OnModuleDestroy {
  private readonly logger = new Logger('SocketService');
  private connectedClients: ConnectedClients = {};
  private wss: Server;
  private clientTenantMap = new Map<string, string>();
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  setWss(wss: Server) {
    this.logger.log('WebSocket server instance set');
    this.wss = wss; // Método para establecer el servidor WebSocket
  }
  emitEvent(event: string, data: any) {
    if (this.wss) {
      console.log('server socket');
      this.wss.emit(event, data); // Método para emitir eventos
      //this.wss.emit('new-message-what', 'lista pedida 2');
    } else {
      this.logger.error('Server Socket no detectado');
    }
  }
  clientEmitEvent(event: string, data: any, socket: Socket) {
    //console.log(socket.id);
    if (socket) {
      socket.emit(event, data); // Método para emitir eventos
      //this.wss.emit('new-message-what', 'lista pedida 2');
    } else {
      this.logger.error('Client Socket no detectado');
    }
  }
  async registerCliente(client: Socket, userId: string): Promise<User[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');

    // disconnect previous local socket for same user id
    this.checkUserConnection(user);

    // keep in-memory map for this instance
    this.connectedClients[client.id] = { socket: client, user };

    // persist presence in memory (per-instance)
    // connectedClients already updated above

    // optional: update DB uid (best-effort, don't fail on error)
    try {
      await this.userRepository.update(user.id, { uid: client.id });
    } catch (err) {
      this.logger.warn('DB update uid failed', err?.message ?? err);
    }

    // Retornar el array de usuarios conectados
    return this.getConnectedUsers();
  }
  async removeCliente(clientId: string) {
    if (!this.connectedClients[clientId]) {
      this.logger.warn(`Client with ID ${clientId} not found`);
      return;
    }
    const user = this.connectedClients[clientId]?.user;
    if (user) {
      // presence is stored in-memory; nothing to remove from Redis

      // best-effort DB update to clear uid
      try {
        await this.userRepository.update(user.id, { uid: '' });
      } catch (err) {
        this.logger.warn('DB clear uid failed', err?.message ?? err);
      }
    }
    delete this.connectedClients[clientId];
  }
  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }
  getUserFullName(socketId: string): User {
    return this.connectedClients[socketId]?.user;
  }
  getSocketIdByUserUniqueId(uniqueId: string): Socket | undefined {
    for (const clientId in this.connectedClients) {
      if (this.connectedClients[clientId].user.id === uniqueId) {
        return this.connectedClients[clientId].socket;
      }
    }
    return undefined;
  }

  private checkUserConnection(user: User) {
    for (const clientId in this.connectedClients) {
      if (this.connectedClients[clientId].user.id === user.id) {
        try {
          this.connectedClients[clientId].socket.disconnect();
        } catch (err) {
          // ignore
        }
        delete this.connectedClients[clientId];
      }
    }
  }
  private getConnectedUsers(): User[] {
    return Object.values(this.connectedClients).map((client) => client.user);
  }

  // helper removed: no Redis key used

  private key(userId: string) {
    return `sockets:${userId}`; // kept for compatibility if needed elsewhere
  }

  async getSocketsForUser(userId: string): Promise<string[]> {
    // Return sockets from in-memory connected clients map for this instance
    const out: string[] = [];
    for (const clientId in this.connectedClients) {
      const u = this.connectedClients[clientId].user;
      if (u && String(u.id) === String(userId)) out.push(clientId);
    }
    return out;
  }

  async emitToUser(
    server: Server,
    userId: string,
    event: string,
    payload: any,
  ) {
    const sockets = await this.getSocketsForUser(userId);
    if (!sockets || sockets.length === 0) return;
    for (const s of sockets) {
      try {
        server.to(s).emit(event, payload);
      } catch (err) {
        this.logger.warn(`Emit to socket ${s} failed`, err?.message ?? err);
      }
    }
  }

  async onModuleDestroy() {
    // nothing to cleanup for Redis
  }
}
