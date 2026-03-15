# 10_MASTER_PLAN_CHECKLIST - OMZONE MVP

## Fase 0 — Canon y arquitectura

- [x] Definir contexto del producto
- [x] Definir brief
- [x] Definir frontend base
- [x] Definir backend Appwrite
- [x] Definir esquema DB (sin membresías recurrentes; con paquetes, consumos y QR)
- [x] Definir roles (root / admin / client)
- [x] Definir funciones Appwrite
- [x] Definir i18n
- [x] Definir mock data
- [x] Alinear documentos canonicos con modelo de negocio real (2026-03-14)

## Fase 1 — Experiencia pública (Frontend)

- [x] Landing premium
- [x] Catálogo de clases
- [x] Detalle de clase
- [x] Página de paquetes (`/packages`)
- [x] Página wellness kitchen (`/wellness`)
- [x] SEO + structured data en páginas públicas
- [x] i18n ES/EN con LanguageSwitcher
- [x] Motion system (tokens, keyframes, animaciones)

## Fase 2 — Flujos de compra (Frontend)

- [x] Wizard de reserva (`/booking/:sessionId`)
- [x] Checkout unificado multi-intent (`/checkout`)
- [x] Confirmación post-pago (`/checkout/confirmation`)
- [x] Login mock (`/login`)
- [x] Registro mock (`/register`)

## Fase 3 — Área del cliente (Frontend)

- [x] Dashboard overview (`/account`)
- [x] Mis reservas (`/account/bookings`)
- [x] Mis órdenes (`/account/orders`)
- [x] Mis paquetes (`/account/packages`) — antes `/account/membership`
- [x] Mi perfil (`/account/profile`)
- [x] CustomerSideNav desktop + CustomerLayout

## Fase 4 — Panel admin (Frontend)

- [ ] Dashboard métricas (`/app`)
- [ ] Leads (`/app/leads`)
- [ ] Clientes (`/app/clients`)
- [ ] CRUD clases (`/app/classes`)
- [ ] CRUD sesiones (`/app/sessions`)
- [ ] CRUD paquetes (`/app/packages`)
- [ ] CRUD productos wellness (`/app/products`)
- [ ] Órdenes (`/app/orders`)
- [ ] Reservaciones (`/app/bookings`)
- [ ] Validación QR (`/app/passes`)
- [ ] Contenido (`/app/content`)
- [ ] Configuración (`/app/settings`)

## Fase 5 — Backend Appwrite real

- [ ] Proyecto Appwrite enlazado con CLI
- [ ] Config versionada en repo (`appwrite.json`)
- [ ] Colecciones e índices creados en instancia
- [ ] Buckets creados con permisos correctos
- [ ] Labels y permisos configurados
- [ ] User profile bootstrap (root, admin demo)

## Fase 6 — Commerce core (Backend + Frontend integrado)

- [ ] Function `create-checkout-order`
- [ ] Function `confirm-stripe-checkout` + webhook Stripe
- [ ] Function `confirm-paypal-order` + webhook PayPal
- [ ] UI de pago real (Stripe Payment Element o Checkout Session)
- [ ] UI de pago real (PayPal Buttons)
- [ ] Historial de órdenes conectado a Appwrite
- [ ] Colección `payments` poblada por webhooks

## Fase 7 — Booking + Paquetes + QR (Backend + Frontend integrado)

- [ ] Function `create-booking`
- [ ] Function `cancel-booking` / `reschedule-booking`
- [ ] Function `redeem-package-for-session`
- [ ] Colección `client_packages` y `package_usages` en uso
- [ ] Generación de `access_passes` al confirmar orden
- [ ] Visualización de QR en área del cliente
- [ ] Function `admin-validate-pass` + pantalla de escaneo

## Fase 8 — Automatización Appwrite

- [ ] Config Appwrite versionable en repo (ver `13_appwrite_sync_strategy.md`)
- [ ] Scripts npm para push/pull de schema
- [ ] Crons configurados en Appwrite scheduler
- [ ] Functions deployadas via CLI
- [ ] GitHub Actions opcional para CI

---

## Leyenda de negocio

| Concepto | Presente en MVP | Notas |
| --- | --- | --- |
| Clases de yoga | si | catalogo, sesiones reservables |
| Productos wellness | si | tienda y add-ons |
| Paquetes prepagados | si | con expiracion, creditos yoga + wellness |
| Pago unico (Stripe/PayPal) | si | sin cobro recurrente |
| QR de acceso fisico | si | via `access_passes` |
| Panel cliente | si | reservas, paquetes, órdenes, QR |
| Panel admin | si | CRUD completo + validacion QR |
| Leads / CRM basico | si | desde formularios publicos |
| Suscripciones recurrentes | **no** | fuera del MVP |
| Membresías con renovacion automatica | **no** | fuera del MVP |
| Panel de instructores | **no** | fuera del MVP |
| Multi-admin del negocio | **no** | fuera del MVP |
