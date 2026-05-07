# Prisma + NestJS para manejo de base de datos (version actual)

Guia practica para integrar Prisma moderno con NestJS y operar base de datos en desarrollo y produccion.

Versiones de referencia (npm):
- `prisma`: **7.8.0**
- `@prisma/client`: **7.8.0**

---

## 1) Instalacion base en proyecto Nest existente

```bash
# en raiz del backend Nest
npm i -D prisma
npm i @prisma/client
npx prisma init
```

Esto crea:
- `prisma/schema.prisma`
- `prisma.config.ts`
- `.env`

---

## 2) Configuracion recomendada para Nest + Prisma v7

Prisma v7 usa `prisma.config.ts` y el nuevo provider `prisma-client`.

Ejemplo `prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx ./prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Ejemplo `prisma/schema.prisma`:

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql" // o mysql/sqlite/sqlserver/mongodb/cockroachdb
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Nota importante para Nest:
- Si tu app Nest esta en CommonJS, definir `moduleFormat = "cjs"` evita conflictos ESM/CJS en runtime.

---

## 3) Flujo de trabajo recomendado (dia a dia)

## A) Cambias modelo en `schema.prisma`

## B) Generas y aplicas migracion en dev

```bash
npx prisma migrate dev --name init-users
npx prisma generate
```

`migrate dev`:
- crea SQL de migracion
- aplica cambios a BD dev
- actualiza tabla `_prisma_migrations`

## C) Usas Prisma Client desde Nest

## D) Para produccion, despliegas migraciones

```bash
npx prisma migrate deploy
```

---

## 4) Integracion Nest limpia: `PrismaService`

Crear un servicio compartido:

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Luego exportarlo en un `PrismaModule`:

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Esto permite inyectarlo en cualquier service:

```ts
constructor(private readonly prisma: PrismaService) {}
```

---

## 5) Ejemplos de consultas comunes

```ts
// create
await prisma.user.create({ data: { email: 'a@acme.com', name: 'Ana' } });

// findMany con filtros
await prisma.user.findMany({
  where: { email: { contains: '@acme.com' } },
  orderBy: { id: 'desc' },
  take: 20,
});

// update
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Ana Maria' },
});

// delete
await prisma.user.delete({ where: { id: 1 } });
```

Relaciones:

```ts
await prisma.post.create({
  data: {
    title: 'Hola',
    author: { connect: { id: 1 } },
  },
});
```

Transaccion:

```ts
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'u@acme.com' } });
  await tx.profile.create({ data: { userId: user.id } });
});
```

---

## 6) Comandos Prisma CLI que mas usamos

## Basicos

```bash
npx prisma version
npx prisma init
npx prisma generate
npx prisma validate
npx prisma format
npx prisma studio
```

## Esquema y sincronizacion

```bash
npx prisma db pull   # introspeccion desde BD existente hacia schema.prisma
npx prisma db push   # empuja schema a BD sin migraciones (prototipado)
npx prisma db seed   # ejecuta seed
npx prisma db execute --file ./script.sql
```

## Migraciones

```bash
npx prisma migrate dev --name add-users
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate resolve --applied <migration_id>
npx prisma migrate diff --from-schema=schema.prisma --to-config-datasource --script
```

---

## 7) `db push` vs `migrate dev` (cuando usar cada uno)

- Usa **`migrate dev`** para desarrollo normal con historial de migraciones versionado.
- Usa **`db push`** para prototipos o spikes donde no necesitas historial SQL.
- En produccion, despliega con **`migrate deploy`**.

Regla practica de equipo:
1. prototipo rapido -> `db push`
2. feature formal -> `migrate dev`
3. release -> `migrate deploy`

---

## 8) Seed de datos

En `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Ejecutar:

```bash
npx prisma db seed
```

---

## 9) Buenas practicas en Nest + Prisma

1. Un solo `PrismaService` reusable (no crear clientes por request).
2. Mantener queries en services/repos, no en controllers.
3. Definir indices y uniques en schema (no solo en codigo).
4. Revisar querys pesadas con `select/include` explicitos.
5. Separar claramente comandos destructivos para entornos dev.
6. Ejecutar `prisma validate` y `prisma format` en CI.

---

## 10) Flujo sugerido para este repo

1. Crear/editar modelos en `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <cambio>`.
3. `npx prisma generate`.
4. Consumir tipos/client en servicios Nest.
5. En deploy: `npx prisma migrate deploy`.

---

## 11) Referencias oficiales usadas

- Prisma docs: What is Prisma, Prisma Migrate overview, Prisma CLI reference.
- Nest recipe oficial: Prisma con NestJS.
- npm registry para version actual (`prisma`, `@prisma/client`).
