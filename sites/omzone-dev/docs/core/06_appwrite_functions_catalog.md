# 06_APPWRITE_FUNCTIONS_CATALOG - OMZONE

## Referencias

- `02_backend_appwrite_requirements.md`
- `03_appwrite_db_schema.md`
- `05_permissions_and_roles.md`

## Scope

Catalogo funcional de las Appwrite Functions previstas para el MVP.

## Functions

### Publicas / semi-publicas

| Function ID | Surface | Purpose | Colecciones afectadas |
| --- | --- | --- | --- |
| `submit-lead` | public | registrar prospecto desde formulario | `contact_leads` |
| `get-public-catalog` | public | devolver catalogo visible al visitante (clases, paquetes, productos) | `classes`, `class_sessions`, `wellness_packages`, `wellness_products`, `instructors`, `class_types` |
| `create-checkout-order` | semi-public | crear orden de checkout y reservar sesion o paquete | `orders`, `order_items` |
| `confirm-stripe-checkout` | semi-public (webhook) | confirmar pago Stripe y activar fulfillment | `orders`, `payments`, `bookings`, `client_packages`, `access_passes` |
| `confirm-paypal-order` | semi-public (webhook) | confirmar captura PayPal y activar fulfillment | `orders`, `payments`, `bookings`, `client_packages`, `access_passes` |
| `register-client-profile` | semi-public | crear perfil extendido del cliente recien registrado | `users_profile` |

### Cliente autenticado

| Function ID | Surface | Purpose | Colecciones afectadas |
| --- | --- | --- | --- |
| `get-client-dashboard` | client | consolidar datos del dashboard del cliente | `bookings`, `client_packages`, `orders`, `access_passes` |
| `create-booking` | client | crear reserva para una sesion de clase | `bookings`, `class_sessions`, `access_passes` |
| `cancel-booking` | client | cancelar una reserva propia | `bookings`, `class_sessions`, `access_passes` |
| `reschedule-booking` | client | reprogramar una reserva propia | `bookings`, `class_sessions`, `access_passes` |
| `redeem-package-for-session` | client | consumir credito de paquete al reservar sesion | `client_packages`, `package_usages`, `bookings` |
| `get-my-passes` | client | devolver pases QR activos del cliente | `access_passes` |

### Admin

| Function ID | Surface | Purpose | Colecciones afectadas |
| --- | --- | --- | --- |
| `admin-dashboard-metrics` | admin | devolver metricas operativas del negocio | multiples (lectura) |
| `admin-upsert-class` | admin | crear o editar clases | `classes` |
| `admin-upsert-session` | admin | crear o editar sesiones | `class_sessions` |
| `admin-upsert-package` | admin | crear o editar paquetes wellness | `wellness_packages` |
| `admin-upsert-product` | admin | crear o editar productos wellness | `wellness_products` |
| `admin-upsert-instructor` | admin | crear o editar instructores | `instructors` |
| `admin-update-order-status` | admin | actualizar estado de pedidos u ordenes | `orders` |
| `admin-validate-pass` | admin | validar y marcar como usado un access pass QR | `access_passes`, `audit_logs` |
| `admin-upsert-content` | admin | editar contenido administrable del sitio | `site_content` |

### Cron

| Function ID | Surface | Purpose | Colecciones afectadas |
| --- | --- | --- | --- |
| `cron-expire-client-packages` | cron | marcar como `expired` los paquetes de cliente vencidos | `client_packages` |
| `cron-expire-access-passes` | cron | marcar como `expired` los pases QR vencidos | `access_passes` |
| `cron-complete-sessions` | cron | cerrar sesiones ya ocurridas | `class_sessions` |
| `cron-aggregate-analytics` | cron | consolidar analitica periodica | `audit_logs` (lectura) |

## Baseline de ejecucion

| Tipo | Regla |
| --- | --- |
| public | entrada sin autenticacion; validacion estricta y respuesta acotada |
| semi-public | entrada desde frontend o webhook externo; validacion de firma/token |
| client | requiere identidad autenticada con label `client` y verificacion de ownership |
| admin | requiere label `admin` o `root` |
| cron | ejecucion interna o programada por scheduler de Appwrite |

## Reglas generales

- Cada funcion debe verificar el label del usuario antes de ejecutar operaciones.
- Las funciones de pago deben validar la firma del webhook del proveedor antes de procesar.
- Las funciones de fulfillment (activar paquete, crear booking, emitir pass) deben ser idempotentes.
- Ninguna funcion debe exponer datos de otras entidades que no correspondan al actor solicitante.
- Toda accion significativa debe registrarse en `audit_logs`.

## Notas

- Cada funcion respeta la matriz de roles definida en `05_permissions_and_roles.md`.
- Los documentos afectados por cada funcion se describen en `03_appwrite_db_schema.md`.
- No existe funcion `admin-upsert-plan` ni `cron-expire-memberships`. Las colecciones `membership_plans` y `memberships` no forman parte del MVP.
