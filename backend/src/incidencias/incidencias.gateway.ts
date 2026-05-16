import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  SubscribeMessage 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IncidenciasService } from './incidencias.service';

@WebSocketGateway({
  cors: { origin: '*' }, // En producción, pon aquí tu dominio
})
export class IncidenciasGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly incidenciasService: IncidenciasService) {
    // Escuchamos el Observable que creamos en el servicio
    this.incidenciasService.getStream().subscribe((incidencia) => {
      this.handleIncidenciaUpdate(incidencia);
    });
  }

  // Cuando el residente se conecta, lo unimos a su propia sala
  handleConnection(client: Socket) {
    const idResidente = client.handshake.query.id_residente as string;
    if (idResidente) {
      client.join(`residente_${idResidente}`);
      console.log(`Residente conectado a sala: residente_${idResidente}`);
    }
  }

  // Enviamos la actualización solo a los interesados
  handleIncidenciaUpdate(incidencia: any) {
    if (this.server) {
    // CA011: Notificación Push (vía Socket)
      this.server
        .to(`residente_${incidencia.id_residente}`)
        .emit('incidenciaActualizada', {
          mensaje: `Actualización de incidencia: ${incidencia.titulo}`,
          data: incidencia,// CA004: Actualización inmediata de los datos
        });
    }
  }
}