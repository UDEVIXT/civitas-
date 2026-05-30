import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IncidenciasService } from './incidencias.service';

@WebSocketGateway({
  cors: { origin: '*' }, // En producción, pon aquí tu dominio
})
export class IncidenciasGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

 /* constructor(private readonly incidenciasService: IncidenciasService) {
    // Escuchamos el Observable que creamos en el servicio para los reportes
    this.incidenciasService.getStream().subscribe((reporte) => {
      this.handleIncidenciaUpdate(reporte);
    });
  }*/

  // Cuando el usuario se conecta, lo unimos a su propia sala usando su id_usuario
  handleConnection(client: Socket) {
    const idUsuario = client.handshake.query.id_usuario as string;
    if (idUsuario) {
      client.join(`usuario_${idUsuario}`);
      console.log(`Usuario conectado a sala: usuario_${idUsuario}`);
    }
  }

  // Enviamos la actualización en tiempo real al usuario dueño del reporte
  handleIncidenciaUpdate(reporte: any) {
    if (this.server) {
      // CA011: Notificación en tiempo real vía Sockets usando la nueva sala
      // CA004: Actualización inmediata de los datos en el Frontend
      this.server
        .to(`usuario_${reporte.id_usuario}`)
        .emit('incidenciaActualizada', {
          mensaje: `Actualización de incidencia: ${reporte.motivo}`, 
          data: reporte, 
        });
    }
  }
}