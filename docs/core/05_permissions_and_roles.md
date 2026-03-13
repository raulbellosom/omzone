# 05_PERMISSIONS_AND_ROLES - YWK

## Referencias

- `02_backend_appwrite_requirements.md`
- `03_appwrite_db_schema.md`
- `06_appwrite_functions_catalog.md`

## Scope

Baseline de roles, labels y permisos para Appwrite en el MVP.

## Roles del sistema

| Rol | Label sugerido | Alcance |
| --- | --- | --- |
| `root` | `root` | control total de la plataforma |
| `admin` | `admin` | operacion del negocio |
| `customer` | `customer` | experiencia propia del cliente |

## Reglas clave

1. `root` puede todo.
2. `admin` puede operar el negocio.
3. `customer` solo accede a su propia experiencia.
4. Instructores no son usuarios autenticados del sistema en MVP.

## Matrix resumida de rutas

| Route group | `root` | `admin` | `customer` | `visitor` |
| --- | --- | --- | --- | --- |
| publicas | si | si | si | si |
| `/account/*` | si | si | si | no |
| `/app/*` | si | si | no | no |

## Buckets

| Bucket | Rol | Create | Read | Update | Delete | Nota |
| --- | --- | --- | --- | --- | --- | --- |
| `public-media` | `Any` | - | si | - | - | solo lectura publica |
| `public-media` | `root/admin` | si | si | si | si | administracion completa |
| `private-media` | `root` | si | si | si | si | control total |
| `private-media` | `admin` | si | si parcial | si | parcial | acceso segun caso de negocio |

## Baseline de permisos

| Area | Politica |
| --- | --- |
| contenido publico | lectura publica controlada |
| experiencia de cliente | acceso solo al propietario |
| operaciones administrativas | solo `root` y `admin` |
| auditoria y archivos privados | acceso restringido |

## Notas

- Las labels de Appwrite deben alinearse con los roles del sistema.
- Las acciones sensibles deben ejecutarse por `Functions`, no por escritura directa desde frontend.
- El detalle de buckets y colecciones vive en `03_appwrite_db_schema.md`.
