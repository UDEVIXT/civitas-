import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAccesosPreautorizados(prisma: PrismaClient) {
  console.log('Iniciando el seeder con datos vinculados...');

  const usuarioExistente = await prisma.usuario.findFirst({
    where: { rol: 'Residente' },
  });

  if (!usuarioExistente) {
    console.log('⚠️ No se encontró ningún Residente. Registra uno en la app primero.');
    return; 
  }

  const accesoExistente = await prisma.acceso.findFirst({
    where: { id_usuario: usuarioExistente.id_usuario },
    orderBy: { fecha_creacion: 'desc' }
  });

  const pasesDePrueba = [
    {
      nombre: 'Carlos Mendoza',
      informacion_general: 'Visita familiar para recoger documentos importantes...',
      propiedad: 'E-10',
      nombre_residente: usuarioExistente.nombre_usuario,
      fecha_llegada: accesoExistente?.fecha_visita_programada || null,
      fecha_salida: accesoExistente?.fecha_salida_programada || null,
      fecha_expiracion: accesoExistente?.fecha_expiracion || new Date('2026-06-09T11:00:00.000Z'),
      tipo: 'Visitante' as const,
      tiene_nota: true,
      id_usuario: usuarioExistente.id_usuario,
      id_acceso: accesoExistente?.id_acceso || null,
    },
    {
      nombre: 'Paquetería DHL',
      informacion_general: 'Entrega de paquete, requiere firma del residente.',
      propiedad: 'B-03',
      nombre_residente: usuarioExistente.nombre_usuario,
      fecha_llegada: new Date('2026-06-09T11:00:00.000Z'),
      fecha_salida: accesoExistente?.fecha_salida_programada || null,
      fecha_expiracion: new Date('2026-06-09T23:59:59.000Z'),
      tipo: 'Proveedor' as const,
      tiene_nota: true,
      id_usuario: usuarioExistente.id_usuario,
      id_acceso: accesoExistente?.id_acceso || null,
    }
  ];

  const resultado = await prisma.accesoPreautorizado.createMany({
    data: pasesDePrueba,
    skipDuplicates: true, 
  });

  console.log(`¡Seeder completado! Se insertaron ${resultado.count} registros de acceso preautorizado.`);
}