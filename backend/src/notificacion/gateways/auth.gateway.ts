import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class AuthGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Cliente conectado:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Cliente desconectado:', client.id);
  }

  @SubscribeMessage('register')
  registerUser(
    @MessageBody() userId: string,

    @ConnectedSocket()
    client: Socket,
  ) {
    client.join(`user-${userId}`);
  }

  notifyNewLogin(userId: string, payload: any) {
    this.server.to(`user-${userId}`).emit('new-login-detected', payload);
  }
}
