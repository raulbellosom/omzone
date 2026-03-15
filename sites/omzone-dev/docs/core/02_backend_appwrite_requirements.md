# 02_BACKEND_APPWRITE_REQUIREMENTS - OMZONE

## Referencias

- `00_project_brief.md`
- `03_appwrite_db_schema.md`
- `05_permissions_and_roles.md`
- `06_appwrite_functions_catalog.md`
- `09_appwrite_platform_limits.md`

## Scope

Documento canonico para el backend Appwrite del MVP de OMZONE.

- Modelo operativo: un solo proyecto Appwrite.
- Seguridad base: `Auth` + labels + permissions + `Functions`.
- Database sugerida: `main`.

## Principio arquitectonico

La aplicacion usa un solo proyecto Appwrite para el MVP.
La separacion de responsabilidades se resuelve con controles de acceso, colecciones bien delimitadas y funciones backend para operaciones sensibles.

El frontend NUNCA escribe directamente en colecciones criticas como `orders`, `bookings`, `client_packages`, `package_usages`, `access_passes`, `payments` o `audit_logs`. Estas operaciones pasan obligatoriamente por Functions.

## Roles del sistema

| Rol | Label Appwrite | Alcance |
| --- | --- | --- |
| `root` | `root` | control total de la plataforma; no aparece listado como cliente comercial |
| `admin` | `admin` | operacion del negocio: catalogo, ventas, contenido, clientes |
| `client` | `client` | experiencia de compra y reserva; solo accede a sus propios datos |

> Nota: el rol `client` reemplaza el naming anterior `customer` en toda la plataforma. Los instructores **no** son usuarios autenticados del sistema en este MVP.

## Servicios Appwrite previstos

### Auth

Labels Appwrite: `root`, `admin`, `client`.
El campo `roleKey` en `users_profile` refleja el label operativo del usuario.

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
| `wellness_products` | productos y extras wellness kitchen |
| `wellness_packages` | paquetes prepagados combinados (yoga + wellness) |
| `orders` | pedido o venta principal |
| `order_items` | renglones del pedido |
| `payments` | registro de pagos y referencias externas |
| `bookings` | reservas de clases |
| `client_packages` | paquetes comprados por el cliente |
| `package_usages` | consumos individuales de creditos de un paquete |
| `access_passes` | pases QR de acceso fisico |
| `promo_codes` | descuentos opcionales |
| `site_content` | contenido editable del sitio |
| `audit_logs` | auditoria interna |
| `app_settings` | configuracion global |

> Colecciones `membership_plans` y `memberships` **no existen** en este MVP. Los paquetes prepagados con expiracion son el modelo comercial real.

### Storage

| Bucket ID | Uso | Acceso esperado |
| --- | --- | --- |
| `public-media` | imagenes publicas de landing, clases y productos | publico lectura |
| `private-media` | comprobantes y archivos internos | acceso restringido |

### Functions

| Function ID | Superficie | Responsabilidad |
| --- | --- | --- |
| `submit-lead` | public | registrar prospectos desde formularios |
| `get-public-catalog` | public | exponer catalogo publico de clases, paquetes y productos |
| `create-checkout-order` | public/semi-public | crear orden de checkout |
| `confirm-stripe-checkout` | public/semi-public | confirmar pago via Stripe webhook |
| `confirm-paypal-order` | public/semi-public | confirmar captura de pago via PayPal |
| `register-client-profile` | public/semi-public | crear perfil extendido del cliente autenticado |
| `get-client-dashboard` | client | devolver vista consolidada del panel del cliente |
| `create-booking` | client | crear reserva para una sesion |
| `cancel-booking` | client | cancelar una reserva propia |
| `reschedule-booking` | client | reprogramar una reserva propia |
| `redeem-package-for-session` | client | consumir credito de paquete al reservar sesion |
| `get-my-passes` | client | devolver pases QR activos del cliente |
| `admin-dashboard-metrics` | admin | consolidar metricas operativas |
| `admin-upsert-class` | admin | crear o editar clases |
| `admin-upsert-session` | admin | crear o editar sesiones |
| `admin-upsert-package` | admin | crear o editar paquetes wellness |
| `admin-upsert-product` | admin | crear o editar productos |
| `admin-upsert-instructor` | admin | crear o editar instructores |
| `admin-update-order-status` | admin | actualizar estado de pedidos |
| `admin-validate-pass` | admin | validar y marcar como usado un access pass QR |
| `admin-upsert-content` | admin | editar contenido administrable del sitio |
| `cron-expire-client-packages` | cron | expirar paquetes de cliente segun fecha de vencimiento |
| `cron-expire-access-passes` | cron | expirar pases QR vencidos |
| `cron-complete-sessions` | cron | cerrar sesiones ya ocurridas |
| `cron-aggregate-analytics` | cron | consolidar analitica periodica |

## Baseline operativo

| Tema | Decision |
| --- | --- |
| Proyecto Appwrite | una sola instancia por MVP |
| Seguridad | sin logica sensible directa en frontend |
| Catalogo publico | lectura controlada por funciones o permisos publicos acotados |
| Operaciones de negocio | ejecucion via funciones protegidas |
| Datos privados | siempre aislados en colecciones o buckets restringidos |
| Pagos | solo se almacenan referencias externas (Stripe/PayPal IDs); nunca datos de tarjeta |
| QR | tokens opacos validados por backend; no contienen datos sensibles en el payload |
| Suscripciones recurrentes | **fuera del MVP** |
| Panel de instructores | **fuera del MVP** |
| Multi-admin del negocio | **fuera del MVP** |

## Notas

- Los limites de naming e indices deben respetar `09_appwrite_platform_limits.md`.
- El detalle de campos, buckets y colecciones vive en `03_appwrite_db_schema.md`.
- La matriz de acceso por rol vive en `05_permissions_and_roles.md`.
- La estrategia de sincronizacion CLI vive en `13_appwrite_sync_strategy.md`.
