import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        this.logger.error('No token provided');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      
      // Join a room based on their role
      const role = payload.role?.toUpperCase() || 'EMPLOYEE';
      client.join(role);
      
      this.logger.log(`Client connected: ${client.id} (User: ${payload.email}, Role: ${role})`);
    } catch (e) {
      this.logger.error(`Connection authentication failed: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Enviar una notificación a un grupo específico (ej: ADMIN, MANAGER)
  sendToRole(role: string, event: string, payload: any) {
    this.server.to(role).emit(event, payload);
  }

  // Enviar a todos los usuarios administrativos
  sendToAdmins(event: string, payload: any) {
    this.server.to('ADMIN').to('MANAGER').emit(event, payload);
  }
}
