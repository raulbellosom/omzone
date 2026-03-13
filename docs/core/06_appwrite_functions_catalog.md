# 06_APPWRITE_FUNCTIONS_CATALOG - YWK

## Referencias

- `02_backend_appwrite_requirements.md`
- `03_appwrite_db_schema.md`
- `05_permissions_and_roles.md`

## Scope

Catalogo funcional de las Appwrite Functions previstas para el MVP.

## Functions

| Function ID | Surface | Purpose |
| --- | --- | --- |
| `submit-lead` | public / semi-public | registrar prospectos desde formularios |
| `get-public-catalog` | public / semi-public | devolver catalogo visible al visitante |
| `create-checkout-order` | public / semi-public | crear una orden de checkout |
| `confirm-checkout` | public / semi-public | confirmar el checkout y actualizar estado |
| `register-customer-profile` | public / semi-public | completar el perfil extendido del cliente |
| `get-customer-dashboard` | customer | consolidar datos del dashboard del cliente |
| `cancel-booking` | customer | cancelar una reserva existente |
| `reschedule-booking` | customer | reprogramar una reserva existente |
| `admin-dashboard-metrics` | admin | devolver metricas operativas del negocio |
| `admin-upsert-class` | admin | crear o editar clases |
| `admin-upsert-session` | admin | crear o editar sesiones |
| `admin-upsert-plan` | admin | crear o editar planes de membresia |
| `admin-upsert-package` | admin | crear o editar paquetes |
| `admin-upsert-product` | admin | crear o editar productos wellness |
| `admin-update-order-status` | admin | actualizar estado de ordenes |
| `admin-upsert-content` | admin | editar contenido administrable del sitio |
| `cron-expire-memberships` | cron | marcar membresias vencidas |
| `cron-complete-sessions` | cron | cerrar sesiones finalizadas |
| `cron-analytics-aggregate` | cron | consolidar analitica periodica |

## Baseline de ejecucion

| Tipo | Regla |
| --- | --- |
| public / semi-public | entrada controlada, validacion estricta y respuesta acotada |
| customer | requiere identidad autenticada y ownership |
| admin | requiere rol `admin` o `root` |
| cron | ejecucion interna o programada |

## Notas

- Cada funcion debe respetar la matriz de roles definida en `05_permissions_and_roles.md`.
- Los documentos afectados por cada funcion se describen en `03_appwrite_db_schema.md`.
