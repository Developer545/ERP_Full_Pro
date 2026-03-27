# SpeedERP Web — Plan de Trabajo Detallado

> **Proyecto**: SpeedERP Web (ERP SaaS multi-tenant)
> **Stack**: Next.js 16 + Ant Design 6 + Prisma 7 + Neon PostgreSQL
> **Inicio**: Marzo 2026
> **Estimado**: 7 fases (~7 semanas)

---

## Prerequisitos (Daniel debe hacer)

- [ ] Crear BD en Neon: proyecto `speeddan-erp-web` -> copiar connection string
- [ ] Crear repo GitHub: `speeddan-erp-web` (privado, sin README)
- [ ] Decidir nombre del producto (SpeedERP, DeskERP Web, otro)
- [ ] Crear cuenta Upstash (redis gratis): `upstash.com` -> copiar REST URL + token
- [ ] Crear cuenta Resend (emails gratis): `resend.com` -> copiar API key
- [ ] Crear cuenta Sentry (errores gratis): `sentry.io` -> copiar DSN

---

## FASE 0 — Foundation (Semana 1)

> **Objetivo**: Proyecto corriendo con login, layout dashboard, y componentes base.
> **Resultado**: Un usuario puede registrarse, hacer login, ver el dashboard vacio con sidebar.

### 0.1 Setup del proyecto
- [ ] `npx create-next-app@latest desk-erp-web` (App Router, TypeScript, Tailwind, ESLint)
- [ ] Instalar TODAS las dependencias (ver lista en CLAUDE.md)
- [ ] Configurar `tsconfig.json` con paths `@/`
- [ ] Configurar `next.config.ts` con headers de seguridad
- [ ] Configurar `tailwind.config.ts`
- [ ] Configurar `.env.local` con variables
- [ ] Configurar `@t3-oss/env-nextjs` para validacion de env vars
- [ ] Crear `.gitignore` completo
- [ ] Git init + primer commit + push a GitHub
- [ ] Conectar repo a Vercel

### 0.2 Prisma Foundation
- [ ] `prisma/schema.prisma` — Datasource + generator
- [ ] Modelo `Tenant` (id, name, slug, plan, status, settings, limites)
- [ ] Modelo `User` (id, tenantId, email, name, password, role, 2FA fields)
- [ ] Modelo `AuditLog` (id, tenantId, userId, action, entity, oldData, newData)
- [ ] Modelo `Session` (refresh tokens)
- [ ] Todos los modelos con: cuid(), audit columns, soft delete, @@index
- [ ] `lib/prisma/client.ts` — Singleton con extensions
- [ ] `lib/prisma/extensions/soft-delete.ts`
- [ ] `lib/prisma/extensions/audit.ts`
- [ ] `lib/prisma/extensions/tenant-filter.ts`
- [ ] `npx prisma migrate dev --name "init"`
- [ ] `prisma/seed.ts` — Seed con tenant demo + usuario admin

### 0.3 Auth completo
- [ ] `lib/auth/tokens.ts` — generateTokenPair (access 15min + refresh 7d)
- [ ] `lib/auth/password.ts` — hash + verify con bcryptjs
- [ ] `lib/auth/middleware.ts` — verifyAuth desde cookie
- [ ] `app/api/auth/login/route.ts` — POST login
- [ ] `app/api/auth/register/route.ts` — POST register (crea tenant + user)
- [ ] `app/api/auth/refresh/route.ts` — POST refresh token rotation
- [ ] `app/api/auth/logout/route.ts` — POST clear cookies
- [ ] `app/api/auth/me/route.ts` — GET usuario actual
- [ ] `middleware.ts` — Next.js middleware (proteger rutas /dashboard)
- [ ] `app/(auth)/login/page.tsx` — Pagina login con Ant Design
- [ ] `app/(auth)/register/page.tsx` — Pagina registro
- [ ] `app/(auth)/layout.tsx` — Layout auth (sin sidebar)

### 0.4 Layout Dashboard
- [ ] `app/(dashboard)/layout.tsx` — DashboardLayout
- [ ] `components/ui/Sidebar.tsx` — Menu lateral con Ant Design Menu
- [ ] `components/ui/Header.tsx` — Header con user info + tenant name
- [ ] `components/ui/Breadcrumbs.tsx` — Breadcrumbs automaticos
- [ ] `config/menu.ts` — Items del sidebar
- [ ] `config/theme.ts` — Tema light/dark con tokens Ant Design 6
- [ ] `stores/theme-store.ts` — Zustand persist theme preference
- [ ] `stores/sidebar-store.ts` — Zustand collapse sidebar
- [ ] `app/(dashboard)/[tenantSlug]/dashboard/page.tsx` — Pagina dashboard (vacia por ahora)

### 0.5 Componentes genericos
- [ ] `components/ui/DataTable.tsx` — Tabla generica con:
  - Busqueda con debounce 300ms
  - Filtros dinamicos (Select, DateRange)
  - Paginacion server-side (offset + cursor)
  - Boton exportar (Excel/PDF/CSV)
  - Seleccion multiple + acciones bulk
  - Sincronizar filtros con URL (useSearchParams)
- [ ] `components/ui/FormModal.tsx` — Modal con react-hook-form + Zod
- [ ] `components/ui/KPICards.tsx` — Cards de metricas (Ant Statistic)
- [ ] `components/ui/PageHeader.tsx` — Header pagina + breadcrumbs + acciones
- [ ] `components/ui/ConfirmDelete.tsx` — Modal confirmacion

### 0.6 Infraestructura
- [ ] `lib/cache/cache.ts` — Dual: Map con TTL (L1) + Redis opcional (L2)
- [ ] `lib/cache/keys.ts` — Namespaces por modulo
- [ ] `lib/errors/app-error.ts` — Error tipado
- [ ] `lib/errors/error-handler.ts` — Handler centralizado
- [ ] `lib/api/with-api.ts` — Wrapper para API routes
- [ ] `lib/tenant/context.ts` — AsyncLocalStorage
- [ ] `lib/logger/index.ts` — Pino logger
- [ ] `lib/export/excel.ts` — ExcelJS generico
- [ ] `lib/export/pdf.ts` — @react-pdf/renderer generico
- [ ] `lib/export/csv.ts` — CSV generico
- [ ] `lib/email/send.ts` — Resend wrapper
- [ ] `lib/email/templates/welcome.tsx` — Email bienvenida
- [ ] `lib/files/storage.ts` — Cloudinary abstraccion
- [ ] Rate limiting con @upstash/ratelimit (auth: 5/min, api: 60/min)
- [ ] Sentry init (client + server)
- [ ] `vercel.json` con cron jobs placeholder
- [ ] `.github/workflows/ci.yml` — GitHub Actions CI

### Entregable Fase 0
> Usuario puede: registrarse -> login -> ver dashboard con sidebar -> logout
> Infraestructura completa: auth, cache, errors, logging, exports, emails

---

## FASE 1 — Core (Semana 2)

> **Objetivo**: CRUD de entidades principales + dashboard con KPIs.
> **Resultado**: Admin puede gestionar productos, clientes, proveedores, usuarios.

### 1.1 Tenants + Configuracion
- [ ] `modules/tenants/` — service, repository, schema, types
- [ ] `app/api/v1/tenants/settings/route.ts` — GET + PUT config empresa
- [ ] `app/(dashboard)/[tenantSlug]/configuracion/page.tsx`
- [ ] Config: nombre, NIT, NRC, direccion, telefono, logo, moneda, timezone
- [ ] Config DTE: token MH, ambiente (testing/produccion), correlativo

### 1.2 Usuarios + Roles
- [ ] Modelo Prisma `Role` + `Permission`
- [ ] `modules/users/` — CRUD + asignar roles
- [ ] `app/api/v1/users/` — routes
- [ ] `app/(dashboard)/[tenantSlug]/usuarios/page.tsx`
- [ ] Roles predefinidos: SUPER_ADMIN, ADMIN, MANAGER, SELLER, VIEWER
- [ ] Permisos granulares por modulo (ver, crear, editar, eliminar)
- [ ] `hooks/use-permissions.ts` — hook para verificar permisos en UI

### 1.3 Productos + Categorias
- [ ] Modelo Prisma `Product` + `Category`
- [ ] `modules/productos/` — CRUD + busqueda + filtros
- [ ] `modules/categorias/` — CRUD
- [ ] `app/api/v1/productos/` — routes con paginacion
- [ ] `app/api/v1/categorias/` — routes
- [ ] `app/(dashboard)/[tenantSlug]/productos/page.tsx`
- [ ] `components/modules/productos/ProductosClient.tsx`
- [ ] `components/modules/productos/ProductoForm.tsx`
- [ ] `hooks/queries/use-productos.ts` — React Query con keys factory
- [ ] Campos: nombre, descripcion, sku, codigoBarra, precio, costo, stock, minStock, imagen, categoria, proveedor, impuesto, isActive
- [ ] Cache: catalogo productos TTL 10min

### 1.4 Clientes
- [ ] Modelo Prisma `Customer`
- [ ] `modules/clientes/` — CRUD + busqueda
- [ ] `app/api/v1/clientes/` — routes
- [ ] `app/(dashboard)/[tenantSlug]/clientes/page.tsx`
- [ ] Campos: nombre, tipoDocumento (DUI/NIT/Pasaporte), numDocumento, email, telefono, direccion, municipio, departamento
- [ ] Cache: lista clientes TTL 10min

### 1.5 Proveedores
- [ ] Modelo Prisma `Supplier`
- [ ] `modules/proveedores/` — CRUD + busqueda
- [ ] `app/api/v1/proveedores/` — routes
- [ ] `app/(dashboard)/[tenantSlug]/proveedores/page.tsx`
- [ ] Campos: nombre, NIT/NRC, email, telefono, direccion, contacto, condicionesPago

### 1.6 Dashboard
- [ ] `modules/dashboard/` — service con KPIs
- [ ] `app/api/v1/dashboard/route.ts` — GET KPIs
- [ ] KPIs: ventasHoy, ventasMes, clientesNuevos, productosStockBajo, facturasEmitidas, cxcPendiente
- [ ] Graficas: ventas ultimos 7 dias (Recharts BarChart), top 5 productos (PieChart)
- [ ] Cache: KPIs TTL 2min

### Entregable Fase 1
> Admin puede: configurar empresa, gestionar usuarios/roles, CRUD productos/clientes/proveedores, ver dashboard con KPIs

---

## FASE 2 — Ventas (Semana 3)

> **Objetivo**: Punto de venta funcional con facturacion DTE.
> **Resultado**: Cajero puede vender, generar factura DTE, ver inventario.

### 2.1 POS (Punto de Venta)
- [ ] Modelo Prisma `Sale` + `SaleItem`
- [ ] `modules/pos/` — service (crear venta, calcular totales, IVA)
- [ ] `stores/pos-store.ts` — Zustand: carrito, cliente seleccionado, metodo pago
- [ ] `app/(dashboard)/[tenantSlug]/pos/page.tsx`
- [ ] `components/modules/pos/POSClient.tsx` — Layout POS completo
- [ ] `components/modules/pos/ProductGrid.tsx` — Grid de productos con busqueda
- [ ] `components/modules/pos/CartPanel.tsx` — Carrito lateral
- [ ] `components/modules/pos/PaymentModal.tsx` — Modal pago (efectivo, tarjeta, credito)
- [ ] `components/modules/pos/ReceiptPreview.tsx` — Vista previa ticket/factura
- [ ] Busqueda productos por nombre, SKU, codigo barra
- [ ] Descuento por item y global
- [ ] Multiple metodos de pago
- [ ] Impresion ticket (window.print con CSS)

### 2.2 Facturacion DTE
- [ ] Modelos Prisma `Invoice` + `InvoiceItem` + `DTELog`
- [ ] `modules/facturacion/` — service DTE completo
- [ ] Tipos de documento: CCF, CF, NC, ND, FE, FSE
- [ ] Firma digital RS512 (json-web-signature)
- [ ] QR code en factura (qrcode)
- [ ] Generacion PDF factura (@react-pdf/renderer)
- [ ] Envio a Ministerio de Hacienda (API MH)
- [ ] Log de transmision DTE
- [ ] Correlativos automaticos por tipo de documento
- [ ] `app/api/v1/facturas/` — routes
- [ ] `app/(dashboard)/[tenantSlug]/facturas/page.tsx` — listado facturas
- [ ] Anulacion de facturas (NC vinculada)

### 2.3 CxC (Cuentas por Cobrar)
- [ ] Modelo Prisma `AccountReceivable` + `ARPayment`
- [ ] `modules/cxc/` — service (crear, abonar, saldo)
- [ ] `app/api/v1/cxc/` — routes
- [ ] `app/(dashboard)/[tenantSlug]/cxc/page.tsx`
- [ ] Crear CxC automatica al vender a credito
- [ ] Abonos parciales
- [ ] Estado: pendiente, parcial, pagada, vencida
- [ ] Reporte de antiguedad de saldos

### 2.4 Inventario / Kardex
- [ ] Modelo Prisma `InventoryMovement`
- [ ] `modules/inventario/` — service (entrada, salida, ajuste, transferencia)
- [ ] `app/api/v1/inventario/` — routes
- [ ] `app/(dashboard)/[tenantSlug]/inventario/page.tsx`
- [ ] Kardex por producto (historial de movimientos)
- [ ] Movimiento automatico al vender (salida) y al comprar (entrada)
- [ ] Alerta de stock bajo (< minStock)
- [ ] Ajustes manuales con motivo

### Entregable Fase 2
> Cajero puede: buscar productos en POS, agregar al carrito, cobrar, generar factura DTE, ver inventario
> Sistema: actualiza stock automaticamente, crea CxC si es credito, genera PDF factura

---

## FASE 3 — Compras (Semana 4)

> **Objetivo**: Ciclo completo de compras.
> **Resultado**: Admin puede crear ordenes de compra, recibir mercaderia, gestionar CxP y gastos.

### 3.1 Ordenes de Compra
- [ ] Modelo Prisma `PurchaseOrder` + `POItem`
- [ ] `modules/compras/` — service
- [ ] Estados: borrador, aprobada, recibida_parcial, recibida, cancelada
- [ ] `app/(dashboard)/[tenantSlug]/compras/page.tsx`

### 3.2 Recepcion de Mercaderia
- [ ] Vincular recepcion con orden de compra
- [ ] Recepcion parcial (items parciales)
- [ ] Auto-crear movimiento de inventario (entrada)
- [ ] Auto-actualizar stock del producto

### 3.3 CxP (Cuentas por Pagar)
- [ ] Modelo Prisma `AccountPayable` + `APPayment`
- [ ] `modules/cxp/` — service
- [ ] Auto-crear CxP al recibir compra a credito
- [ ] Abonos parciales
- [ ] Calendario de vencimientos

### 3.4 Gastos
- [ ] Modelo Prisma `Expense` + `ExpenseCategory`
- [ ] `modules/gastos/` — service
- [ ] `app/(dashboard)/[tenantSlug]/gastos/page.tsx`
- [ ] Categorias personalizables
- [ ] Adjuntar comprobante (imagen/PDF via Cloudinary)
- [ ] Reporte por categoria y periodo

### Entregable Fase 3
> Admin puede: crear ordenes de compra, recibir mercaderia (stock se actualiza), pagar proveedores, registrar gastos con comprobante

---

## FASE 4 — RRHH (Semana 5)

> **Objetivo**: Planilla completa de El Salvador.
> **Resultado**: Admin puede calcular planilla quincenal con deducciones SV.

### 4.1 Empleados
- [ ] Modelo Prisma `Employee`
- [ ] `modules/empleados/` — service
- [ ] `app/(dashboard)/[tenantSlug]/empleados/page.tsx` (nuevo, no `planilla`)
- [ ] Campos: nombre, DUI, NIT, ISSS, AFP, cargo, salarioBase, fechaIngreso, departamento, estado

### 4.2 Planilla SV
- [ ] Modelo Prisma `Payroll` + `PayrollItem`
- [ ] `modules/planilla/` — service con calculos SV
- [ ] Calculos automaticos:
  - ISSS trabajador: 3% (tope $30)
  - ISSS patronal: 7.5% (tope $75)
  - AFP trabajador: 7.25%
  - AFP patronal: 8.75%
  - ISR (tabla progresiva)
  - INSAFORP patronal: 1%
- [ ] Planilla quincenal (1a y 2a quincena)
- [ ] Horas extra, bonificaciones, deducciones adicionales
- [ ] `app/(dashboard)/[tenantSlug]/planilla/page.tsx`

### 4.3 Boletas + Reportes
- [ ] Boleta de pago individual (PDF)
- [ ] Reporte consolidado planilla (Excel)
- [ ] Calculo de aguinaldo (15 dias < 3 anos, 19 dias >= 3 anos, 21 dias >= 10 anos)
- [ ] Vacaciones (15 dias + 30% de 15 dias de salario)

### Entregable Fase 4
> Admin puede: registrar empleados, calcular planilla quincenal con ISSS/AFP/Renta, generar boletas PDF, calcular aguinaldo

---

## FASE 5 — Contabilidad (Semana 6)

> **Objetivo**: Modulo contable completo.
> **Resultado**: Contador puede ver asientos, libros y estados financieros.

### 5.1 Catalogo de Cuentas
- [ ] Modelo Prisma `Account` (cuentas contables)
- [ ] `modules/contabilidad/` — service
- [ ] Catalogo estandar El Salvador precargado (seed)
- [ ] Estructura jerarquica (padre-hijo)
- [ ] Tipos: activo, pasivo, patrimonio, ingreso, gasto, costo

### 5.2 Asientos Contables
- [ ] Modelo Prisma `JournalEntry` + `JournalLine`
- [ ] Partida doble (debe = haber obligatorio)
- [ ] Asientos manuales
- [ ] Partidas automaticas desde:
  - POS/Facturacion -> Ingreso + IVA debito fiscal
  - Compras -> Gasto/Inventario + IVA credito fiscal
  - Planilla -> Gasto + provisiones
  - CxC/CxP -> Cuentas por cobrar/pagar

### 5.3 Libros Contables
- [ ] Libro Diario (todos los asientos cronologicos)
- [ ] Libro Mayor (movimientos por cuenta)
- [ ] Libro de IVA (compras y ventas)
- [ ] Exportar a Excel y PDF

### 5.4 Estados Financieros
- [ ] Balance General
- [ ] Estado de Resultados
- [ ] Comparativo por periodo
- [ ] Exportar a Excel y PDF

### Entregable Fase 5
> Contador puede: gestionar catalogo de cuentas, ver asientos (manuales + automaticos), consultar libros, generar EEFF

---

## FASE 6 — SaaS + Polish (Semana 7)

> **Objetivo**: Funcionalidades SaaS y polish final.
> **Resultado**: Sistema listo para multi-clientes con planes y limites.

### 6.1 Planes y Suscripciones
- [ ] Pagina de planes (FREE, BASIC, PRO, ENTERPRISE)
- [ ] Limites por plan (usuarios, productos, facturas/mes)
- [ ] Trial de 14 dias
- [ ] Bloqueo suave al exceder limites (no se borra nada)
- [ ] Pagina de billing para el tenant

### 6.2 Onboarding Wizard
- [ ] Wizard de configuracion inicial (3 pasos)
  - Paso 1: Datos de la empresa (nombre, NIT, NRC, direccion)
  - Paso 2: Configuracion DTE (token MH, ambiente)
  - Paso 3: Crear primer usuario adicional + categorias iniciales

### 6.3 Seguridad avanzada
- [ ] 2FA con TOTP (otpauth)
- [ ] Backup codes
- [ ] Historial de sesiones
- [ ] Forzar cambio de password

### 6.4 Importacion masiva
- [ ] Importar productos desde Excel
- [ ] Importar clientes desde Excel
- [ ] Template descargable para cada importacion
- [ ] Validacion con Zod + reporte de errores

### 6.5 Reportes avanzados
- [ ] Reporte de ventas por periodo, producto, cliente, vendedor
- [ ] Reporte de compras por periodo, proveedor
- [ ] Reporte de inventario valorizado
- [ ] Reporte de CxC y CxP por antiguedad
- [ ] Exportar todos a Excel y PDF

### 6.6 Audit Log Viewer
- [ ] `app/(dashboard)/[tenantSlug]/auditoria/page.tsx`
- [ ] Filtrar por usuario, accion, entidad, fecha
- [ ] Ver detalle del cambio (oldData vs newData)

### 6.7 Cron Jobs
- [ ] Recordatorio CxC vencidas (email)
- [ ] Alerta stock bajo (notificacion in-app)
- [ ] Purga de tenants eliminados (30 dias)
- [ ] Limpieza de sesiones expiradas

### 6.8 Notificaciones In-App
- [ ] Modelo Prisma `Notification`
- [ ] Campanita en header con badge
- [ ] Marcar como leida
- [ ] Tipos: stock_bajo, cxc_vencida, nuevo_pedido, sistema

### Entregable Fase 6
> Sistema completo: planes, onboarding, 2FA, importacion masiva, reportes, audit log, notificaciones, cron jobs

---

## Criterios de calidad en TODA fase

- [ ] TypeScript estricto (no `any`)
- [ ] Zod en todo input del usuario
- [ ] Soft delete en todo modelo
- [ ] Audit columns automaticas
- [ ] Tenant isolation verificada
- [ ] Cache en consultas frecuentes
- [ ] Error handling con AppError tipado
- [ ] Logging con Pino en operaciones criticas
- [ ] Responsive (mobile-first)
- [ ] Accesible (keyboard nav, aria labels)
- [ ] Tests en calculos criticos (DTE, planilla, contabilidad)

---

## Riesgos y mitigaciones

| Riesgo | Mitigacion |
|--------|-----------|
| Prisma 7 es nueva | Usar Prisma 6 estable si hay bugs criticos |
| Vercel cold starts | Cache agresivo en Redis, optimizar bundle |
| DTE requiere certificados | Misma logica de DeskERP, ya probada en produccion |
| Migracion de clientes desktop a web | No es obligatoria, cada cliente decide cuando migrar |
| Complejidad contabilidad | Fase 5 es la mas larga, puede extenderse 1 semana mas |
