import 'dotenv/config'; // <-- 1. AÑADIR ESTO EN LA PRIMERA LÍNEA
import { Test, TestingModule } from '@nestjs/testing';
import { BitacoraService } from './bitacora.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('BitacoraService', () => {
  let service: BitacoraService;
  let prisma: PrismaService;
  let moduleRef: TestingModule; // <-- 2. Declarar la variable del módulo

  beforeAll(async () => {
    // 3. Asignar la creación del módulo a la variable
    moduleRef = await Test.createTestingModule({
      providers: [BitacoraService, PrismaService],
    }).compile();

    service = moduleRef.get<BitacoraService>(BitacoraService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // 4. Limpiar conexiones y destruir el módulo al terminar
    await prisma.$disconnect();
    await moduleRef.close(); 
  });

  // Cerramos la conexión al finalizar toda la suite
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------
  // Pruebas para HU-1.1.2: Visualizar bitácora histórica
  // ---------------------------------------------------------
  describe('obtenerHistorialBitacora', () => {
    it('debe retornar registros paginados por defecto (page 1, limit 10)', async () => {
      const result = await service.obtenerHistorialBitacora({});
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.meta.page).toBe(1);
    });

    it('debe aplicar filtro de búsqueda por nombre insensible a mayúsculas', async () => {
      const result = await service.obtenerHistorialBitacora({ nombre: 'pablo' });
      
      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(registro => {
        expect(registro.acceso.visitante.nombre.toLowerCase()).toContain('pablo');
      });
    });

    it('debe aplicar filtro por número de vivienda', async () => {
      const result = await service.obtenerHistorialBitacora({ numeroVivienda: 'A-01' });
      
      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(registro => {
        expect(registro.acceso.visitante.residente.vivienda.numero_vivienda).toBe('A-01');
      });
    });
  });

  // ---------------------------------------------------------
  // Pruebas para HU-1.9.1: Ver proveedores dentro del residencial
  // ---------------------------------------------------------
  describe('obtenerProveedoresActivos', () => {
    it('debe retornar únicamente visitantes que estén vinculados a un servicio y no tengan fecha de salida', async () => {
      const result = await service.obtenerProveedoresActivos({ page: 1, limit: 10 });

      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach(registro => {
        // Verifica que no tenga salida registrada (está dentro del residencial)
        expect(registro.fecha_hora_salida).toBeNull();
        // Verifica que sea un proveedor/servicio
        expect(registro.acceso.visitante.servicio).toBeDefined();
      });
    });

    it('debe filtrar proveedores por término de búsqueda (search)', async () => {
      const result = await service.obtenerProveedoresActivos({ search: 'Denilson', page: 1, limit: 10 });
      
      if (result.data.length > 0) {
        expect(result.data[0].acceso.visitante.nombre).toContain('Denilson');
      }
    });
  });

  // ---------------------------------------------------------
  // Pruebas para HU-1.9.1: Registrar salida
  // ---------------------------------------------------------
  describe('registrarSalidaProveedor', () => {
    it('debe lanzar NotFoundException si el guardia no existe', async () => {
      await expect(
        service.registrarSalidaProveedor('id_bitacora_falso', 'id_guardia_inexistente')
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si el registro de bitácora no existe', async () => {
      // Necesitamos un ID de guardia válido del seed para pasar la primera validación
      const guardia = await prisma.guardia.findFirst();
      if (!guardia) throw new Error('No hay guardias en la base de datos de prueba');

      await expect(
        service.registrarSalidaProveedor('id_bitacora_inexistente', guardia.id_guardia)
      ).rejects.toThrow(NotFoundException);
    });

    // Nota: La prueba de éxito (registrar salida correctamente) alterará el estado de la base de datos.
    // En un entorno de integración estricto, deberías crear un registro temporal aquí o asegurar 
    // que la prueba no afecte a las demás.
  });
});