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
    origin: '*',
  },
})
export class AuthGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Cliente conectado:', client.id);
  }

  @SubscribeMessage('register')
  registerUser(
    @MessageBody() userId: string,

    @ConnectedSocket()
    client: Socket,
  ) {
    client.join(userId);
  }

  notifyNewLogin(userId: string, payload: any) {
    this.server.to(userId).emit('new-login-detected', payload);
  }
}
