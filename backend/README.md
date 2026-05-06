# Backend - Guia de ejecucion local

## Requisitos

| Herramienta | Version recomendada | Verificacion |
| --- | --- | --- |
| Node.js | 24.x | `node -v` |
| npm | 10+ (incluido con Node 24) | `npm -v` |
| Docker Engine | 24+ | `docker --version` |
| Docker Compose (plugin) | v2 | `docker compose version` |

> Los Dockerfiles del proyecto usan `node:24`, por eso se recomienda Node 24 tambien para entorno local.

## 1. Preparar entorno

```bash
cd /<ruta donde tengas tu repositorio>/backend
cp .env.example .env
```

Completa `backend/.env` con al menos estas variables:

```env
POSTGRES_DB=civitas
POSTGRES_USER=civitas
POSTGRES_PASSWORD=civitas123
DATABASE_URL="postgresql://civitas:civitas123@localhost:5432/civitas"
```

Opcional:

```env
PORT=3000
```

## 2. Ejecutar el proyecto en desarrollo

```bash
docker compose -f docker-compose.dev.yml up --build
```

Backend disponible en: `http://localhost:3000`

Para detener servicios:

```bash
docker compose -f docker-compose.dev.yml down
```

## 3. Comandos utiles

```bash
# desarrollo
npm run start:dev

# compilar
npm run build

# pruebas
npm run test
npm run test:e2e
```

## Nota importante
Aquí se irán colocando notas importantes...

## Comandos utiles
Craer arquitectura de carpetas limpias: nest generate resource bitacora
