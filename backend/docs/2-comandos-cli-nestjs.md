# Nest CLI (actual): comandos que el equipo debe dominar

Referencia practica de la CLI de Nest para trabajo diario.

Version de referencia de CLI: **@nestjs/cli 11.0.21**

---

## 1) Instalacion y ayuda

```bash
npm i -g @nestjs/cli
# o sin instalar global:
npx @nestjs/cli@latest --help

nest --help
nest <comando> --help
```

---

## 2) Comandos principales (core)

| Comando | Alias | Para que sirve |
|---|---|---|
| `nest new <name>` | `nest n` | Crea un proyecto Nest nuevo (modo standard) |
| `nest generate <schematic> <name>` | `nest g` | Genera archivos/artefactos |
| `nest build [name]` | - | Compila proyecto (tsc/swc/webpack) |
| `nest start [name]` | - | Compila + ejecuta app |
| `nest add <package>` | - | Agrega libreria Nest con schematic |
| `nest info` | `nest i` | Muestra info de entorno y paquetes Nest |

---

## 3) `nest new` (crear proyecto)

```bash
nest new my-api
nest n my-api --strict
nest new my-api --package-manager pnpm
```

Opciones utiles:
- `--strict`: activa TS estricto.
- `--skip-install`: no instala deps.
- `--skip-git`: no inicializa git.
- `--language TS|JS`: lenguaje base.
- `--dry-run`: simula cambios.

---

## 4) `nest generate` (scaffolding diario)

Sintaxis:

```bash
nest g <schematic> <name> [options]
```

Schematics mas usadas:

| Schematic | Alias | Ejemplo |
|---|---|---|
| `module` | `mo` | `nest g mo users` |
| `controller` | `co` | `nest g co users` |
| `service` | `s` | `nest g s users` |
| `resource` | `res` | `nest g res users` |
| `guard` | `gu` | `nest g gu auth/jwt` |
| `interceptor` | `itc` | `nest g itc common/logging` |
| `pipe` | `pi` | `nest g pi common/parse-id` |
| `filter` | `f` | `nest g f common/http-exception` |
| `middleware` | `mi` | `nest g mi common/logger` |
| `decorator` | `d` | `nest g d common/current-user` |
| `gateway` | `ga` | `nest g ga notifications` |
| `resolver` | `r` | `nest g r users` |
| `provider` | `pr` | `nest g pr infra/mail` |
| `class` | `cl` | `nest g cl domain/user.entity` |
| `interface` | `itf` | `nest g itf domain/user-repository` |
| `library` | `lib` | `nest g lib shared` (monorepo) |
| `app` | - | `nest g app admin-api` (monorepo) |

Opciones utiles de generate:
- `--flat`: no crea folder extra.
- `--project <name>`: target en monorepo.
- `--no-spec`: no generar tests.
- `--dry-run`: ver cambios sin escribir.

---

## 5) `nest build` (compilacion)

```bash
nest build
nest build api --builder swc
nest build --watch
nest build --all
```

Opciones clave:
- `--builder tsc|swc|webpack`
- `--watch`
- `--type-check` (relevante con SWC)
- `--path <tsconfig>`
- `--config <nest-cli-config>`

---

## 6) `nest start` (ejecucion)

```bash
nest start
nest start --watch
nest start --debug --watch
nest start --builder swc
nest start --env-file .env.local
```

Opciones utiles:
- `--watch`
- `--debug [host:port]`
- `--builder tsc|swc|webpack`
- `--env-file <file>`
- `--exec <binary>`

---

## 7) `nest add` (integraciones)

```bash
nest add @nestjs/swagger
nest add @nestjs/config
```

Este comando instala paquete y ejecuta su schematic de setup cuando existe.

---

## 8) Comandos recomendados por fase

## Inicio de proyecto

```bash
nest new civitas-api --strict
cd civitas-api
npm run start:dev
```

## Nuevo feature CRUD rapido

```bash
nest g resource users
```

## Seguridad/infra comun

```bash
nest g gu auth/jwt
nest g d common/current-user
nest g mi common/request-logger
```

## Build release

```bash
nest build --builder swc
node dist/main.js
```

---

## 9) Alias utiles para equipo (optional en package.json)

```json
{
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "build:swc": "nest build --builder swc",
    "start:prod": "node dist/main.js"
  }
}
```

---

## 10) Tips operativos para equipo Laravel

1. Usa `nest g resource` como equivalente mental de "crear controller + service + dto + rutas".
2. Evita crear todo "a mano" si ya hay schematic.
3. Mantengan un estilo: o `--no-spec` global o siempre con tests.
4. Para velocidad en dev, prioriza SWC (`--builder swc`) cuando aplique.

---

## 11) Referencias oficiales usadas

- Nest CLI overview.
- Nest CLI command reference (`new`, `generate`, `build`, `start`, `add`, `info`).
