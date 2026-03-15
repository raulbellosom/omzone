# 05_PERMISSIONS_AND_ROLES - OMZONE

## Referencias

- `02_backend_appwrite_requirements.md`
- `03_appwrite_db_schema.md`
- `06_appwrite_functions_catalog.md`

## Scope

Baseline de roles, labels y permisos para Appwrite en el MVP.

## Roles del sistema

| Rol | Label Appwrite | Alcance |
| --- | --- | --- |
| `root` | `root` | control total de la plataforma; marcado con `isSystemUser: true` en `users_profile` |
| `admin` | `admin` | operacion del negocio: catalogo, ventas, contenido, clientes |
| `client` | `client` | experiencia propia del cliente: compras, reservas, paquetes, QR |

> Regla: `root` no debe aparecer en listados de clientes ni contabilizarse en metricas comerciales. Usar `isSystemUser: true` para filtrarlo.

> Regla: los instructores **no** son usuarios autenticados del sistema en este MVP.

> Regla: no existe rol `customer`. El naming canonico es `client` en todo el sistema.

## Reglas clave

1. `root` puede todo.
2. `admin` puede operar el negocio.
3. `client` solo accede a su propia experiencia.
4. El frontend **nunca** escribe directamente en colecciones criticas. Ver lista en `02_backend_appwrite_requirements.md`.

## Matrix resumida de rutas

| Route group | `root` | `admin` | `client` | `visitor` |
| --- | --- | --- | --- | --- |
| publicas (`/`, `/classes`, `/packages`, `/wellness`) | si | si | si | si |
| `/account/*` | si | si | si | no |
| `/app/*` | si | si | no | no |

## Buckets

| Bucket | Rol | Create | Read | Update | Delete | Nota |
| --- | --- | --- | --- | --- | --- | --- |
| `public-media` | `Any` | - | si | - | - | solo lectura publica |
| `public-media` | `root/admin` | si | si | si | si | administracion completa |
| `private-media` | `root` | si | si | si | si | control total |
| `private-media` | `admin` | si | parcial | si | parcial | acceso segun caso de negocio |

## Baseline de permisos por coleccion

| Coleccion | Lectura publica | Escritura frontend | Escritura via Function | Nota |
| --- | --- | --- | --- | --- |
| `users_profile` | no | no (excepto propio perfil via funcion) | si | solo el propietario ve su perfil |
| `contact_leads` | no | no | si | via `submit-lead` |
| `instructors` | si | no | si (admin) | lectura directa permitida |
| `class_types` | si | no | si (admin) | lectura directa permitida |
| `classes` | si | no | si (admin) | lectura directa permitida |
| `class_sessions` | si | no | si (admin) | lectura directa permitida |
| `wellness_products` | si | no | si (admin) | lectura directa permitida |
| `wellness_packages` | si | no | si (admin) | lectura directa permitida |
| `orders` | no | no | si | via funciones de checkout |
| `order_items` | no | no | si | via funciones de checkout |
| `payments` | no | no | si | via webhooks/funciones de pago |
| `bookings` | no | no | si | via `create-booking` y admin |
| `client_packages` | no | no | si | via funciones de compra y consumo |
| `package_usages` | no | no | si | via `redeem-package-for-session` |
| `access_passes` | no | no | si | generados por funciones; validados por admin |
| `site_content` | si | no | si (admin) | lectura directa permitida |
| `audit_logs` | no | no | si (system/functions) | solo root puede leer |
| `app_settings` | si (parcial) | no | si (root/admin) | lectura controlada |

## Notas

- Las labels de Appwrite deben alinearse con los roles del sistema: `root`, `admin`, `client`.
- Las acciones sensibles deben ejecutarse por `Functions`, no por escritura directa desde frontend.
- El detalle de buckets y colecciones vive en `03_appwrite_db_schema.md`.
- La estrategia de sync CLI vive en `13_appwrite_sync_strategy.md`.
