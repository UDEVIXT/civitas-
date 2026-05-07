import 'dotenv/config';

import { PrismaClient, Rol, EstatusAcceso, DiaSemana } from '@prisma/client';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Iniciando la carga de datos en Civitas...');

  // ---------------------------------------------------------
  // PERSONAS Y USUARIOS
  // ---------------------------------------------------------
  const perfiles = [
    {
      nombre: 'Mariana',
      genero: 'Femenino',
      rol: Rol.Administrador,
      correo: 'mariana@civitas.com',
    },
    {
      nombre: 'Orlando',
      genero: 'Masculino',
      rol: Rol.Guardia,
      correo: 'orlando@civitas.com',
    },
    {
      nombre: 'Karla',
      genero: 'Femenino',
      rol: Rol.Residente,
      correo: 'karla@civitas.com',
    },
    {
      nombre: 'Jared',
      genero: 'Masculino',
      rol: Rol.Residente,
      correo: 'jared@civitas.com',
    },
    {
      nombre: 'Alexandra',
      genero: 'Femenino',
      rol: Rol.Residente,
      correo: 'alexandra@civitas.com',
    },
  ];

  const usuariosCreados: any[] = [];

  for (const perfil of perfiles) {
    const persona = await prisma.persona.create({
      data: {
        nombre: perfil.nombre,
        genero: perfil.genero,
        fecha_nacimiento: new Date('2000-01-01T00:00:00Z'),
        telefono: '9710000000',
      },
    });

    const usuario = await prisma.usuario.create({
      data: {
        nombre_usuario: perfil.nombre.toLowerCase(),
        correo: perfil.correo,
        password: 'hashed_password_123',
        rol: perfil.rol,
        id_persona: persona.id_persona,
      },
    });
    usuariosCreados.push(usuario);
  }

  const [admin, guardia, res1, res2, res3] = usuariosCreados;

  const guardiaDB = await prisma.guardia.create({
    data: {
      id_usuario: guardia.id_usuario,
      nombre: 'Orlando',
      turno: 'Matutino',
    },
  });
  // ---------------------------------------------------------
  // VIVIENDAS Y RESIDENTES
  // ---------------------------------------------------------
  const numerosVivienda = ['A-01', 'A-02', 'B-01', 'B-02', 'C-01'];
  const viviendasCreadas: any[] = [];

  for (const numero of numerosVivienda) {
    const vivienda = await prisma.vivienda.create({
      data: { numero_vivienda: numero },
    });
    viviendasCreadas.push(vivienda);
  }

  const residentesDB: any[] = [];
  const usuariosResidentes = [res1, res2, res3];

  for (let i = 0; i < usuariosResidentes.length; i++) {
    const residente = await prisma.residente.create({
      data: {
        id_usuario: usuariosResidentes[i].id_usuario,
        id_vivienda: viviendasCreadas[i].id_vivienda,
      },
    });
    residentesDB.push(residente);
  }

  // ---------------------------------------------------------
  // SERVICIOS Y HORARIOS
  // ---------------------------------------------------------
  const serviciosData = [
    {
      nombre_servicio: 'Jardinería',
      cargo: 'Jardinero',
      nombre_empresa: 'Jardines Verdes',
      tipo_carro: 'Camioneta',
      placas: 'OAX-123',
      rfc: 'JARV990101XYZ',
    },
    {
      nombre_servicio: 'Plomería',
      cargo: 'Plomero',
      nombre_empresa: 'Plomeros Rápidos',
      tipo_carro: 'Sedan',
      placas: 'OAX-456',
      rfc: 'PLOM880202ABC',
    },
    {
      nombre_servicio: 'Limpieza',
      cargo: 'Personal de Aseo',
      nombre_empresa: 'Clean Express',
      tipo_carro: 'Van',
      placas: 'OAX-789',
      rfc: 'CLEX770303DEF',
    },
    {
      nombre_servicio: 'Internet',
      cargo: 'Técnico',
      nombre_empresa: 'Telmex',
      tipo_carro: 'Camioneta',
      placas: 'OAX-101',
      rfc: 'TELM660404GHI',
    },
    {
      nombre_servicio: 'Comida',
      cargo: 'Repartidor',
      nombre_empresa: 'Tacos Al Pastor',
      tipo_carro: 'Motocicleta',
      placas: 'MOTO-12',
      rfc: null,
    },
  ];

  const serviciosCreados: any[] = [];
  const diasSemanaCompleta = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES, DiaSemana.SABADO, DiaSemana.DOMINGO];
  const diasLaborables = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES];

  for (let i = 0; i < serviciosData.length; i++) {
    const servicio = await prisma.servicio.create({
      data: serviciosData[i],
    });
    serviciosCreados.push(servicio);

    const diasAAplicar = (i === 0 || i === 2) ? diasSemanaCompleta : diasLaborables;

    for (const dia of diasAAplicar) {
      await prisma.horarioAccesoServicios.create({
        data: {
          dia_semana: dia,
          hora_inicio: new Date('1970-01-01T08:00:00.000Z'),
          hora_fin: new Date('1970-01-01T18:00:00.000Z'),
          id_servicio: servicio.id_servicio,
          activo: true,
        },
      });
    }
  }

  // ---------------------------------------------------------
  // VISITANTES
  // ---------------------------------------------------------
  const visitantesData = [
    {
      nombre: 'Pablo',
      motivo: 'Visita familiar',
      es_frecuente: true,
      id_residente: residentesDB[0].id_residente,
    },
    {
      nombre: 'Denilson',
      motivo: 'Entrega de paquete',
      es_frecuente: false,
      id_residente: residentesDB[1].id_residente,
      id_servicio: serviciosCreados[4].id_servicio
    },
    {
      nombre: 'Jeycson',
      motivo: 'Reparación de tubería',
      es_frecuente: true,
      id_residente: residentesDB[2].id_residente,
      id_servicio: serviciosCreados[1].id_servicio
    },
    {
      nombre: 'Carlos',
      motivo: 'Visita de cortesía',
      es_frecuente: false,
      id_residente: residentesDB[0].id_residente
    },
    {
      nombre: 'Ana',
      motivo: 'Mantenimiento de red',
      es_frecuente: true,
      id_residente: residentesDB[1].id_residente,
      id_servicio: serviciosCreados[3].id_servicio
    },
  ];

  const visitantesCreados: any[] = [];
  for (const vis of visitantesData) {
    const visitante = await prisma.visitante.create({ data: vis });
    visitantesCreados.push(visitante);
  }

  // ---------------------------------------------------------
  // ACCESOS Y BITÁCORA
  // ---------------------------------------------------------
  for (let i = 0; i < visitantesCreados.length; i++) {
    const acceso = await prisma.acceso.create({
      data: {
        id_usuario: admin.id_usuario, 
        id_visitante: visitantesCreados[i].id_visitante,
        codigo_qr: `QR-CIVITAS-${1000 + i}`,
        fecha_expiracion: new Date(Date.now() + 86400000),
        estatus: EstatusAcceso.Activo,
        comentario_admin: 'Acceso autorizado desde plataforma',
      },
    });

    await prisma.bitacora.create({
      data: {
        id_acceso: acceso.id_acceso,
        id_guardia: guardiaDB.id_guardia, 
        comentario: 'Ingreso sin novedades',
        comentario_salida: null,
        fecha_hora_salida: i % 2 === 0 ? new Date(Date.now() + 3600000) : null,
      },
    });
  }

  console.log('Base de datos poblada exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error al poblar la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
