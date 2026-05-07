# NestJS: conceptos y fundamentos para arrancar rapido (equipo Laravel)

Documento pensado para devs que vienen de Laravel y quieren entrar a NestJS con una base solida y practica.

---

## 1) Que es NestJS y por que se siente familiar si vienes de Laravel

NestJS es un framework backend para Node.js/TypeScript, orientado a arquitectura limpia, inyeccion de dependencias y modularidad.

Similitudes con Laravel:

| Laravel | NestJS |
|---|---|
| Service Container | IoC Container + Dependency Injection |
| Service Providers | Providers + Modules |
| Controllers | Controllers |
| Middleware | Middleware |
| Request Validation (FormRequest) | Pipes + class-validator/class-transformer |
| Policies/Guards | Guards |
| Exception Handler | Exception Filters |
| Artisan generators | Nest CLI (`nest g ...`) |
| Config/env | `@nestjs/config` + `process.env` |

---

## 2) Requisitos base (actuales)

- Node.js `>= 20` (Nest actual lo exige para ecosistema reciente).
- TypeScript (recomendado por Nest).
- npm/pnpm/yarn.

Versiones de referencia (consultadas en npm registry):

- `@nestjs/cli`: **11.0.21**
- `prisma`: **7.8.0**
- `@prisma/client`: **7.8.0**

---

## 3) Estructura mental de una app Nest

### Modulos (`@Module`)

Son la unidad organizacional principal. Agrupan:
- `controllers`
- `providers`
- `imports`
- `exports`

Cada feature vive idealmente en su modulo.

### Controllers (`@Controller`)

Reciben requests HTTP y devuelven responses. Deben ser delgados: delegar logica de negocio a servicios/providers.

### Providers (`@Injectable`)

Servicios/clases inyectables donde vive la logica de negocio y acceso a datos.

### Dependency Injection

Nest resuelve dependencias por tipos/tokens en constructor. Esto habilita:
- bajo acoplamiento
- testeo facil
- reemplazo de implementaciones (mocks/adapters)

---

## 4) Flujo de request en Nest (orden real)

1. **Middleware**
2. **Guards**
3. **Interceptors (before)**
4. **Pipes** (transform/validate parametros/body)
5. **Controller handler**
6. **Interceptors (after)**
7. **Exception Filters** (si hay error)

Esto te ayuda a decidir "donde va cada cosa".

---

## 5) Lo minimo para arrancar bien en proyecto real

## Bootstrap (`main.ts`)

Normalmente:
- crear app con `NestFactory.create(AppModule)`
- configurar prefijo global (`/api`)
- habilitar validacion global
- CORS

Ejemplo recomendado:

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## DTOs y validacion

En Laravel usas FormRequest. En Nest haces:
- DTO class
- decoradores de `class-validator`
- `ValidationPipe` global

Ejemplo:

```ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

---

## 6) Modulos feature-first (recomendado)

Estructura sugerida:

```txt
src/
  modules/
    users/
      users.module.ts
      users.controller.ts
      users.service.ts
      dto/
      entities/
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
```

Evita un `app.service.ts` gigante. Piensa en bounded contexts.

---

## 7) Configuracion y entornos

Usa `@nestjs/config` y `ConfigModule.forRoot({ isGlobal: true })`.

Buenas practicas:
- no hardcodear secrets
- usar `.env` por entorno
- validar variables de entorno (Joi/Zod) al inicio

---

## 8) Errores y respuestas

- Lanza excepciones HTTP (`BadRequestException`, `NotFoundException`, etc.)
- Crea filtros globales solo para estandarizar errores cross-cutting.
- No mezclar errores de dominio con detalles internos de infraestructura.

---

## 9) Testing (mentalidad Laravel -> Nest)

Tipos principales:
- unit tests (servicios/providers)
- e2e tests (rutas HTTP reales con app levantada)

Nest trae utilidades de testing + Jest por defecto en el scaffold.

---

## 10) Practicas de arquitectura para no "Laravel-izar mal" Nest

1. Mantener controllers delgados.
2. Encapsular reglas de negocio en servicios.
3. Evitar meter logica en decorators/custom pipes sin necesidad.
4. Separar capa HTTP de capa de dominio.
5. Definir interfaces/tokens para adaptadores externos (mail, pagos, etc.).

---

## 11) Checklist de arranque de un feature nuevo

1. Crear modulo y recursos con CLI (`nest g resource` o `nest g module/controller/service`).
2. Definir DTOs de entrada/salida.
3. Crear servicio con reglas de negocio.
4. Exponer endpoints en controller.
5. Agregar validacion y manejo de errores.
6. Agregar pruebas minimas (unit + e2e critico).

---

## 12) Referencias oficiales usadas

- Nest docs: First Steps, Modules, Controllers, Providers, Fundamentals, CLI.
- Nest CLI docs (overview/usages).
- npm registry para version actual de `@nestjs/cli`.
