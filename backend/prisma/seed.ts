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
  // tipos de servicios
  // ---------------------------------------------------------
  const tiposData = [
    {
      nombre: 'Limpieza',
      categoria: 'DOMESTICO',
      descripcion: 'Servicios de aseo y mantenimiento del hogar',
    },
    {
      nombre: 'Proveedor',
      categoria: 'PROVEEDOR',
      descripcion: 'Suministros básicos (Gas, Agua, Paquetería)',
    },
    {
      nombre: 'Trabajador Doméstico',
      categoria: 'PERSONAL',
      descripcion: 'Empleados particulares de la vivienda',
    },
    {
      nombre: 'Mantenimiento',
      categoria: 'TECNICO',
      descripcion: 'Reparaciones de infraestructura (Plomería, Electricidad)',
    },
  ];

  const tiposCreados = {};
  for (const tipo of tiposData) {
    const t = await prisma.tipoServicio.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo,
    });
    tiposCreados[tipo.nombre] = t.id_tipo_servicio;
  }

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
  const numerosVivienda = [
    'A-01',
    'A-02',
    'B-01',
    'B-02',
    'C-01',
    'C-02',
    'D-01',
    'D-02',
    'E-01',
    'E-02',
    'F-01',
    'F-02',
    'G-01',
    'G-02',
    'H-01',
  ];

  const viviendasCreadas: any[] = [];

  for (const numero of numerosVivienda) {
    const vivienda = await prisma.vivienda.create({
      data: {
        numero_vivienda: numero,
      },
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
      nombre_servicio: 'Servicio de Plomería',
      tipo_nombre: 'Mantenimiento',
      cargo: 'Plomero',
      nombre_empresa: 'Plomeros Express',
      tipo_carro: 'Sedan',
      placas: 'ABC-123',
      rfc: 'PLOM880101',
    },
    {
      nombre_servicio: 'Suministro Gas LP',
      tipo_nombre: 'Proveedor',
      cargo: 'Chofer',
      nombre_empresa: 'Gas del Sur',
      tipo_carro: 'Camioneta',
      placas: 'XYZ-987',
      rfc: 'GASS900101',
    },
    {
      nombre_servicio: 'Electricista General',
      tipo_nombre: 'Mantenimiento',
      cargo: 'Electricista',
      nombre_empresa: 'ElectroFix',
      tipo_carro: 'Pickup',
      placas: 'ELE-101',
      rfc: 'ELEC900101',
    },
    {
      nombre_servicio: 'Internet Fibra',
      tipo_nombre: 'Proveedor',
      cargo: 'Técnico',
      nombre_empresa: 'NetSur',
      tipo_carro: 'Van',
      placas: 'NET-202',
      rfc: 'NETS900101',
    },
    {
      nombre_servicio: 'Jardinería Integral',
      tipo_nombre: 'Limpieza',
      cargo: 'Jardinero',
      nombre_empresa: 'GreenHome',
      tipo_carro: 'Camioneta',
      placas: 'GRN-303',
      rfc: 'GRNH900101',
    },
    {
      nombre_servicio: 'Recolección de Basura',
      tipo_nombre: 'Proveedor',
      cargo: 'Recolector',
      nombre_empresa: 'EcoClean',
      tipo_carro: 'Camión',
      placas: 'ECO-404',
      rfc: 'ECOC900101',
    },
    {
      nombre_servicio: 'Mantenimiento de Aires',
      tipo_nombre: 'Mantenimiento',
      cargo: 'Técnico HVAC',
      nombre_empresa: 'ClimaFrío',
      tipo_carro: 'Sedan',
      placas: 'CLI-505',
      rfc: 'CLIM900101',
    },
    {
      nombre_servicio: 'Lavado de Autos',
      tipo_nombre: 'Limpieza',
      cargo: 'Lavador',
      nombre_empresa: 'AutoSpa',
      tipo_carro: 'Motocicleta',
      placas: 'AUT-606',
      rfc: 'AUTO900101',
    },
    {
      nombre_servicio: 'Fumigación',
      tipo_nombre: 'Mantenimiento',
      cargo: 'Fumigador',
      nombre_empresa: 'FumiSafe',
      tipo_carro: 'Pickup',
      placas: 'FUM-707',
      rfc: 'FUMI900101',
    },
    {
      nombre_servicio: 'Servicio de Cable',
      tipo_nombre: 'Proveedor',
      cargo: 'Instalador',
      nombre_empresa: 'CableVision',
      tipo_carro: 'Van',
      placas: 'CAB-808',
      rfc: 'CABL900101',
    },
    {
      nombre_servicio: 'Pintura Residencial',
      tipo_nombre: 'Mantenimiento',
      cargo: 'Pintor',
      nombre_empresa: 'ColorHome',
      tipo_carro: 'Sedan',
      placas: 'PIN-909',
      rfc: 'COLR900101',
    },
    {
      nombre_servicio: 'Servicio de Agua',
      tipo_nombre: 'Proveedor',
      cargo: 'Distribuidor',
      nombre_empresa: 'Agua Clara',
      tipo_carro: 'Camión',
      placas: 'AGU-010',
      rfc: 'AGUA900101',
    },
    {
      nombre_servicio: 'Limpieza Profunda',
      tipo_nombre: 'Limpieza',
      cargo: 'Auxiliar',
      nombre_empresa: 'CleanFast',
      tipo_carro: 'Sedan',
      placas: 'CLN-111',
      rfc: 'CLEA900101',
    },
    {
      nombre_servicio: 'Cerrajería',
      tipo_nombre: 'Mantenimiento',
      cargo: 'Cerrajero',
      nombre_empresa: 'LockPro',
      tipo_carro: 'Motocicleta',
      placas: 'LCK-222',
      rfc: 'LOCK900101',
    },
    {
      nombre_servicio: 'Mudanzas',
      tipo_nombre: 'Proveedor',
      cargo: 'Chofer',
      nombre_empresa: 'Mudanzas del Sur',
      tipo_carro: 'Camión',
      placas: 'MUD-333',
      rfc: 'MUDA900101',
    },
  ];

  const serviciosCreados: any[] = [];

  const diasSemanaCompleta = [
    DiaSemana.LUNES,
    DiaSemana.MARTES,
    DiaSemana.MIERCOLES,
    DiaSemana.JUEVES,
    DiaSemana.VIERNES,
    DiaSemana.SABADO,
    DiaSemana.DOMINGO,
  ];

  const diasLaborables = [
    DiaSemana.LUNES,
    DiaSemana.MARTES,
    DiaSemana.MIERCOLES,
    DiaSemana.JUEVES,
    DiaSemana.VIERNES,
  ];

  for (let i = 0; i < serviciosData.length; i++) {
    const { tipo_nombre, ...data } = serviciosData[i];

    const servicio = await prisma.servicio.create({
      data: {
        ...data,
        id_tipo_servicio: tiposCreados[tipo_nombre],
      },
    });

    serviciosCreados.push(servicio);

    const diasAAplicar =
      i % 2 === 0 ? diasSemanaCompleta : diasLaborables;

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
      id_servicio: serviciosCreados[4].id_servicio,
    },
    {
      nombre: 'Jeycson',
      motivo: 'Reparación de tubería',
      es_frecuente: true,
      id_residente: residentesDB[2].id_residente,
      id_servicio: serviciosCreados[1].id_servicio,
    },
    {
      nombre: 'Carlos',
      motivo: 'Visita de cortesía',
      es_frecuente: false,
      id_residente: residentesDB[0].id_residente,
    },
    {
      nombre: 'Ana',
      motivo: 'Mantenimiento de red',
      es_frecuente: true,
      id_residente: residentesDB[1].id_residente,
      id_servicio: serviciosCreados[3].id_servicio,
    },
    {
      nombre: 'Fernanda',
      motivo: 'Cena familiar',
      es_frecuente: true,
      id_residente: residentesDB[0].id_residente,
    },
    {
      nombre: 'Luis',
      motivo: 'Instalación de internet',
      es_frecuente: false,
      id_residente: residentesDB[1].id_residente,
      id_servicio: serviciosCreados[3].id_servicio,
    },
    {
      nombre: 'Andrea',
      motivo: 'Limpieza general',
      es_frecuente: true,
      id_residente: residentesDB[2].id_residente,
      id_servicio: serviciosCreados[12].id_servicio,
    },
    {
      nombre: 'Roberto',
      motivo: 'Mantenimiento eléctrico',
      es_frecuente: false,
      id_residente: residentesDB[0].id_residente,
      id_servicio: serviciosCreados[2].id_servicio,
    },
    {
      nombre: 'Camila',
      motivo: 'Entrega de agua',
      es_frecuente: false,
      id_residente: residentesDB[1].id_residente,
      id_servicio: serviciosCreados[11].id_servicio,
    },
    {
      nombre: 'Hugo',
      motivo: 'Fumigación',
      es_frecuente: false,
      id_residente: residentesDB[2].id_residente,
      id_servicio: serviciosCreados[8].id_servicio,
    },
    {
      nombre: 'Daniela',
      motivo: 'Visita social',
      es_frecuente: true,
      id_residente: residentesDB[0].id_residente,
    },
    {
      nombre: 'Emilio',
      motivo: 'Mudanza',
      es_frecuente: false,
      id_residente: residentesDB[1].id_residente,
      id_servicio: serviciosCreados[14].id_servicio,
    },
    {
      nombre: 'Paola',
      motivo: 'Lavado de vehículo',
      es_frecuente: true,
      id_residente: residentesDB[1].id_residente,
      id_servicio: serviciosCreados[7].id_servicio,
    },
    {
      nombre: 'Ricardo',
      motivo: 'Cerrajería',
      es_frecuente: false,
      id_residente: residentesDB[2].id_residente,
      id_servicio: serviciosCreados[13].id_servicio,
    },
  ];

  const visitantesCreados: any[] = [];

  for (const vis of visitantesData) {
    const visitante = await prisma.visitante.create({
      data: vis,
    });

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
        comentario_salida:
          i % 2 === 0 ? 'Salida registrada correctamente' : null,
        fecha_hora_salida:
          i % 2 === 0
            ? new Date(Date.now() + 3600000)
            : null,
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
