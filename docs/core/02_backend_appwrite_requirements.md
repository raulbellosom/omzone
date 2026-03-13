# 02_BACKEND_APPWRITE_REQUIREMENTS - YWK

## Referencias

- `00_project_brief.md`
- `03_appwrite_db_schema.md`
- `05_permissions_and_roles.md`
- `06_appwrite_functions_catalog.md`
- `09_appwrite_platform_limits.md`

## Scope

Documento canonico para el backend Appwrite del MVP de Yoga Wellness Kitchen.

- Modelo operativo: un solo proyecto Appwrite.
- Seguridad base: `Auth` + labels + permissions + `Functions`.
- Database sugerida: `main`.

## Principio arquitectonico

La aplicacion usa un solo proyecto Appwrite para el MVP.
La separacion de responsabilidades se resuelve con controles de acceso, colecciones bien delimitadas y funciones backend para operaciones sensibles.

## Servicios Appwrite previstos

### Auth

| Rol | Uso principal | Nota |
| --- | --- | --- |
| `root` | control total de la plataforma | acceso tecnico y operativo total |
| `admin` | operacion del negocio | gestiona catalogo, ventas, contenido y clientes |
| `customer` | experiencia de compra y reserva | solo sobre sus propios datos |

### Databases

Colecciones canonicas MVP:

| Collection ID | Proposito |
| --- | --- |
| `users_profile` | perfil extendido del usuario Appwrite |
| `contact_leads` | prospectos desde landing o formularios |
| `instructors` | instructores como entidad de contenido |
| `class_types` | catalogo de tipos de clase |
| `classes` | ficha principal de clase |
| `class_sessions` | sesiones reservables |
| `membership_plans` | planes de suscripcion |
| `wellness_products` | productos y extras wellness kitchen |
| `wellness_pkgs` | paquetes combinados |
| `orders` | pedido o venta principal |
| `order_items` | renglones del pedido |
| `bookings` | reservas de clases |
| `memberships` | membresias compradas |
| `promo_codes` | descuentos opcionales |
| `site_content` | contenido editable del sitio |
| `audit_logs` | auditoria interna |
| `app_settings` | configuracion global |

### Storage

| Bucket ID | Uso | Acceso esperado |
| --- | --- | --- |
| `public-media` | imagenes publicas de landing, clases y productos | publico lectura |
| `private-media` | comprobantes y archivos internos | acceso restringido |

### Functions

| Function ID | Superficie | Responsabilidad |
| --- | --- | --- |
| `submit-lead` | public | registrar prospectos desde formularios |
| `get-public-catalog` | public | exponer catalogo publico de clases, planes y productos |
| `create-checkout-order` | public/semi-public | crear orden de checkout |
| `confirm-checkout` | public/semi-public | confirmar pago o cierre del checkout |
| `register-customer-profile` | public/semi-public | crear perfil extendido del cliente autenticado |
| `get-customer-dashboard` | customer | devolver vista consolidada del panel del cliente |
| `cancel-booking` | customer | cancelar una reserva propia |
| `reschedule-booking` | customer | reprogramar una reserva propia |
| `admin-dashboard-metrics` | admin | consolidar metricas operativas |
| `admin-upsert-class` | admin | crear o editar clases |
| `admin-upsert-session` | admin | crear o editar sesiones |
| `admin-upsert-plan` | admin | crear o editar planes de membresia |
| `admin-upsert-package` | admin | crear o editar paquetes wellness |
| `admin-upsert-product` | admin | crear o editar productos |
| `admin-update-order-status` | admin | actualizar estado de pedidos |
| `admin-upsert-content` | admin | editar contenido administrable del sitio |
| `cron-expire-memberships` | cron | expirar membresias segun vigencia |
| `cron-complete-sessions` | cron | cerrar sesiones ya ocurridas |

## Baseline operativo

| Tema | Decision |
| --- | --- |
| Proyecto Appwrite | una sola instancia por MVP |
| Seguridad | sin logica sensible directa en frontend |
| Catalogo publico | lectura controlada por funciones o permisos publicos acotados |
| Operaciones de negocio | ejecucion via funciones protegidas |
| Datos privados | siempre aislados en colecciones o buckets restringidos |

## Notas

- Los limites de naming e indices deben respetar `09_appwrite_platform_limits.md`.
- El detalle de campos, buckets y colecciones vive en `03_appwrite_db_schema.md`.
- La matriz de acceso por rol vive en `05_permissions_and_roles.md`.
