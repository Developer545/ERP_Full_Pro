# ERP Full Pro — Contexto para Claude

> **DIRECTIVAS DE SESION**: NO explorar el proyecto al inicio. Este archivo + memoria persistente contienen todo el contexto necesario. Ir directo a la tarea del usuario. Usar agentes para tareas paralelas. Usar skills cuando apliquen. Leer solo los archivos que la tarea requiera.

## Proyecto
ERP web SaaS multi-tenant para El Salvador. Version moderna del DeskERP desktop, construido desde cero con Next.js. Incluye facturacion electronica DTE, contabilidad, planilla, POS, inventario y mas.

## URLs
| Servicio | URL |
|----------|-----|
| ERP Web | Pendiente configurar en Vercel |
| GitHub | `github.com/Developer545/ERP_Full_Pro.git` |
| BD Neon | PostgreSQL serverless (conexion en `.env.local`) |

## Stack
| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| UI | Ant Design 6 + Tailwind CSS 4 |
| ORM | Prisma 7 + Neon PostgreSQL (serverless) |
| Auth | JWT httpOnly cookies (jose) + bcryptjs |
| Cache L1 | Memoria del servidor (Map + TTL) — GRATIS |
| Cache L2 | Upstash Redis (opcional, se activa con env var) |
| State Client | Zustand (global) + @tanstack/react-query (server state) |
| Forms | react-hook-form + @hookform/resolvers + Zod |
| Charts | Recharts |
| Toasts | Sonner |
| Email | Resend + @react-email/components |
| Files | Cloudinary |
| Logs | Pino |
| Errors | @sentry/nextjs |
| i18n | next-intl (preparado, solo es.json inicial) |
| Env | @t3-oss/env-nextjs + Zod |
| Export | ExcelJS + @react-pdf/renderer |
| Rate Limit | @upstash/ratelimit |
| 2FA | otpauth (preparado en modelo User) |
| Deploy | Vercel (serverless) |
| CI/CD | GitHub Actions (lint + typecheck + test + build) |

## Estructura src/
```
src/
  app/
    (auth)/                    # Login, register, forgot-password (layout sin sidebar)
      login/page.tsx
      register/page.tsx
      layout.tsx
    (dashboard)/               # Layout con sidebar + header
      [tenantSlug]/            # Segment dinamico multi-tenant
        pos/page.tsx
        productos/page.tsx
        clientes/page.tsx
        proveedores/page.tsx
        inventario/page.tsx
        compras/page.tsx
        facturas/page.tsx
        gastos/page.tsx
        cxc/page.tsx
        cxp/page.tsx
        planilla/page.tsx
        contabilidad/page.tsx
        dashboard/page.tsx
        reportes/page.tsx
        configuracion/page.tsx
      layout.tsx               # DashboardLayout (sidebar + header + tenant context)
    api/
      auth/                    # Login, register, refresh, logout
      v1/                      # API versionada desde dia 1
        productos/route.ts     # GET + POST
        productos/[id]/route.ts # GET + PUT + DELETE
        ...                    # Mismo patron para todos los modulos
      webhooks/                # DTE, pagos, etc
      cron/                    # Tareas programadas
    layout.tsx                 # Root layout (providers globales)

  modules/                     # Logica de negocio (BACKEND)
    [modulo]/
      [mod].service.ts         # Logica de negocio + validacion
      [mod].repository.ts      # Queries Prisma (unico punto de acceso a BD)
      [mod].schema.ts          # Zod schemas (crear, editar, filtros)
      [mod].types.ts           # TypeScript interfaces
      [mod].cache.ts           # Redis keys + invalidacion

  components/
    ui/                        # Componentes genericos (wrapper Ant Design)
      DataTable.tsx            # Tabla generica: busqueda, filtros, paginacion, export
      FormModal.tsx            # Modal con react-hook-form integrado
      KPICards.tsx             # Cards de metricas para dashboards
      PageHeader.tsx           # Header con breadcrumbs + acciones
      ConfirmDelete.tsx        # Modal de confirmacion
    modules/                   # Componentes especificos por modulo
      productos/
        ProductosClient.tsx    # Client Component principal
        ProductoForm.tsx       # Formulario crear/editar
      ...

  lib/
    prisma/
      client.ts                # Singleton + extensions (soft-delete, audit, tenant)
      extensions/
        soft-delete.ts         # delete → update deletedAt
        audit.ts               # Inyecta createdBy/updatedBy automaticamente
        tenant-filter.ts       # Filtra por tenantId en TODA query
    auth/
      tokens.ts                # JWT access + refresh con jose
      password.ts              # bcryptjs hash/verify
      middleware.ts            # Verificar JWT en API routes
    tenant/
      context.ts               # AsyncLocalStorage para tenantId/userId
    cache/
      cache.ts                 # Dual: memoria (L1) + Redis opcional (L2)
      keys.ts                  # Namespaces de cache por modulo
    email/
      send.ts                  # Resend wrapper
      templates/               # React Email components
    files/
      storage.ts               # Abstraccion upload (Cloudinary)
    export/
      excel.ts                 # ExcelJS generador generico
      pdf.ts                   # @react-pdf/renderer generador
      csv.ts                   # CSV generador
    errors/
      app-error.ts             # Error tipado con code + statusCode
      error-handler.ts         # Handler centralizado para API routes
    api/
      with-api.ts              # Wrapper: auth + rate-limit + tenant + error handling
    logger/
      index.ts                 # Pino logger estructurado

  hooks/                       # React hooks custom
    queries/                   # React Query hooks por modulo
      use-productos.ts
      use-clientes.ts
      ...
    use-debounce.ts
    use-permissions.ts

  stores/                      # Zustand stores
    theme-store.ts
    sidebar-store.ts
    pos-store.ts               # Carrito POS

  config/
    env.ts                     # Variables de entorno validadas con Zod
    theme.ts                   # Tema Ant Design 6 (light/dark)
    features.ts                # Feature flags por plan
    constants.ts               # Constantes globales
    menu.ts                    # Items del sidebar

  types/                       # Tipos globales
    api.ts                     # ApiResponse, PaginatedResult, etc
    auth.ts                    # AuthUser, TokenPayload
    tenant.ts                  # Tenant, Plan, TenantStatus

prisma/
  schema.prisma                # Schema completo
  migrations/                  # Migraciones automaticas
  seed.ts                      # Seed principal
  seed/                        # Seeds por modulo
```

## Arquitectura clave

### Multi-tenancy
- Prisma Extension filtra AUTOMATICAMENTE por `tenantId` en toda query
- AsyncLocalStorage guarda el contexto {tenantId, userId, userRole}
- Middleware de Next.js valida JWT + extrae tenant del token
- URL: `app.com/[tenantSlug]/modulo`
- NUNCA filtrar manualmente por tenantId en services/repositories

### Soft Deletes
- Prisma Extension convierte `delete` en `update { deletedAt, isActive: false }`
- `findMany` auto-filtra `deletedAt: null`
- Aplica a TODOS los modelos excepto AuditLog

### Audit Trail
- Prisma Extension inyecta `createdBy`/`updatedBy` automaticamente desde AsyncLocalStorage
- Tabla `AuditLog` registra TODA accion: entityType, entityId, oldData, newData
- Clave para compliance DTE El Salvador

### Cache Dual
- L1 (memoria): Map con TTL, siempre activo, gratis
- L2 (Redis): Upstash, se activa con `UPSTASH_REDIS_REST_URL` en env
- Helper `cached(key, fn, ttl)` transparente
- Invalidacion automatica en services al crear/editar/eliminar

### API Routes
- TODAS pasan por `withApi()` wrapper
- Wrapper maneja: auth, rate-limit, tenant context, error handling, logging
- Roles verificados con `options.roles`
- Respuestas consistentes: `{ data }` o `{ error: { code, message } }`

### Patron nuevo modulo (checklist)
1. Schema Prisma: modelo + indice `@@index([tenantId, isActive])`
2. `npx prisma migrate dev --name "add-[modulo]"`
3. `modules/[mod]/` — service, repository, schema (Zod), types, cache
4. `app/api/v1/[mod]/route.ts` — GET + POST con `withApi()`
5. `app/api/v1/[mod]/[id]/route.ts` — GET + PUT + DELETE
6. `components/modules/[mod]/` — Client, Form
7. `hooks/queries/use-[mod].ts` — React Query hooks
8. `app/(dashboard)/[tenantSlug]/[mod]/page.tsx` — Server Component
9. Agregar al menu en `config/menu.ts`
10. Agregar feature flag en `config/features.ts` si aplica

## Modulos del ERP (orden de implementacion)

### Fase 0 — Foundation ✅ COMPLETA
- [x] Setup Next.js 16 + TypeScript + Prisma 7 + Neon
- [x] Prisma Extensions (soft-delete, audit, tenant-filter)
- [x] Auth completo (login, register, JWT, refresh, middleware)
- [x] Layout dashboard (sidebar, header, breadcrumbs)
- [x] Tema Ant Design 6 (light/dark) — Speeddansys Orange #f47920
- [x] DataTable generico
- [x] FormModal generico
- [x] Cache dual (memoria + Redis opcional)
- [x] Error handling tipado + withApi wrapper
- [x] Logging (Pino) + Sentry
- [x] Env validadas (@t3-oss/env-nextjs)
- [x] Paleta centralizada: `src/config/palette.ts` + `src/app/globals.css`
- [x] FormSection component (Divider sutil con icono y color)

### Fase 1 — Core ✅ COMPLETA
- [x] Tenants + Configuracion empresa
- [x] Usuarios + Roles + Permisos
- [x] Productos + Categorias
- [x] Clientes
- [x] Proveedores
- [x] Dashboard basico (KPIs con Recharts)

### Fase 2 — Ventas ✅ COMPLETA
- [x] POS (punto de venta) con carrito Zustand
- [x] Facturacion DTE (CCF, CF, NC, ND) El Salvador
- [x] CxC (cuentas por cobrar)
- [x] Inventario / Kardex

### Fase 3 — Compras ✅ COMPLETA
- [x] Ordenes de compra + recepcion de mercaderia
- [x] CxP (cuentas por pagar)
- [x] Gastos + categorias

### Fase 4 — RRHH ✅ COMPLETA
- [x] Empleados (CRUD + campos SV: DUI, NIT, NSS, AFP, exenciones)
- [x] Planilla SV (ISSS 3%/7.5%, AFP 7.25%/8.75%, INSAFORP 1%, ISR tabla DGII 2024)
- [x] Boletas de pago PDF (@react-pdf/renderer)
- [x] Export Excel planilla (ExcelJS: hoja Planilla + hoja Resumen Patronal)
- [x] Aguinaldo (15/19/21 dias segun Codigo de Trabajo SV)

### Fase 5 — Contabilidad ❌ PENDIENTE (siguiente)
- [ ] Catalogo de cuentas (PYMES SV: activo, pasivo, capital, ingresos, costos, gastos)
- [ ] Asientos contables manuales
- [ ] Partidas automaticas (desde POS, compras, planilla, gastos)
- [ ] Libros contables (diario, mayor)
- [ ] Estados financieros (Balance General, Estado de Resultados)

### Fase 6 — SaaS + Polish ❌ PENDIENTE
- [ ] Planes (FREE, BASIC, PRO, ENTERPRISE) + limites por plan
- [ ] Suscripciones + feature flags por plan
- [ ] Onboarding wizard (setup inicial tenant)
- [ ] Reportes avanzados + exportacion (Excel/PDF)
- [ ] 2FA (TOTP con otpauth)
- [ ] Importacion masiva (Excel → Prisma)
- [ ] Audit log viewer
- [ ] Cron jobs (recordatorios vencimientos, alertas stock bajo)

## Convenciones de codigo

### Naming
- **Archivos**: kebab-case (`producto.service.ts`, `use-productos.ts`)
- **Componentes React**: PascalCase (`ProductosClient.tsx`, `DataTable.tsx`)
- **Variables/funciones**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Tablas BD**: snake_case plural (`@@map("productos")`)
- **Columnas BD**: camelCase en Prisma, snake_case en BD (`@map("created_at")`)

### Imports
- Usar `@/` para imports absolutos desde `src/`
- Orden: React → Next → libs externas → modulos locales → tipos

### API Responses
```typescript
// Exito
{ data: T }
{ data: T[], meta: { total, page, pageSize, totalPages } }

// Error
{ error: { code: string, message: string, details?: unknown } }
```

### Commits
```
feat(modulo): descripcion
fix(modulo): descripcion
refactor(modulo): descripcion
```

## Skills de agente disponibles

| Tarea | Herramienta |
|-------|------------|
| Crear/editar Excel | Skill `xlsx` |
| Crear/editar PDF | Skill `pdf` |
| Crear/editar Word | Skill `docx` |
| Commit git | Skill `commit` |
| Buscar codigo | Agente `Explore` |
| Planificar implementacion | Agente `Plan` |
| Validar build | Agente en background |
| Tareas paralelas | Multiples agentes simultaneos |
| Preguntas Claude Code | Agente `claude-code-guide` |

## Relacion con otros proyectos
- **DeskERP** (`desk-erp/`) — Version desktop Electron (se mantiene independiente)
- **LicenciasPanel** (`licencias-panel/`) — Panel de licencias del desktop
- **BarberPro** (`barber-pro/`) — Comparte stack y patrones (referencia de implementacion)
- **ONGAdmin** (`ong-admin/`) — Comparte stack y patrones
