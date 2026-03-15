# 13_APPWRITE_SYNC_STRATEGY - OMZONE

## Referencias

- `02_backend_appwrite_requirements.md`
- `03_appwrite_db_schema.md`

## Scope

Estrategia para versionar y sincronizar la configuracion de Appwrite desde este repositorio usando la Appwrite CLI.

---

## Principio

El repositorio es la fuente de verdad del schema Appwrite. Ningun cambio debe hacerse directamente en la consola de Appwrite sin reflejarse tambien en el archivo de configuracion versionado (`appwrite.config.json`). El flujo correcto es: editar localmente → push a Appwrite via CLI → commit.

---

## Herramienta

**Appwrite CLI 5.x** (compatible con Appwrite 1.8.x)

Instalacion global:

```bash
npm install -g appwrite-cli
```

Verificar version:

```bash
appwrite --version
```

---

## Estructura de archivos en el repo

```
/
├── appwrite.config.json       # Config del proyecto Appwrite (generada por CLI, commitear)
├── sites/
│   └── omzone-dev/            # Frontend canónico — Appwrite Sites apunta aquí
│       ├── src/               # Codigo fuente React
│       ├── public/
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
├── appwrite/
│   └── functions/             # Codigo fuente de cada Function (cuando se creen)
│       ├── submit-lead/
│       ├── get-public-catalog/
│       ├── create-checkout-order/
│       ├── confirm-stripe-checkout/
│       ├── confirm-paypal-order/
│       ├── register-client-profile/
│       ├── get-client-dashboard/
│       ├── create-booking/
│       ├── cancel-booking/
│       ├── reschedule-booking/
│       ├── redeem-package-for-session/
│       ├── get-my-passes/
│       ├── admin-dashboard-metrics/
│       ├── admin-upsert-class/
│       ├── admin-upsert-session/
│       ├── admin-upsert-package/
│       ├── admin-upsert-product/
│       ├── admin-upsert-instructor/
│       ├── admin-update-order-status/
│       ├── admin-validate-pass/
│       ├── admin-upsert-content/
│       ├── cron-expire-client-packages/
│       ├── cron-expire-access-passes/
│       ├── cron-complete-sessions/
│       └── cron-aggregate-analytics/
└── docs/core/                 # Documentacion canonica
```

> El archivo de config es `appwrite.config.json` (no `appwrite.json`). Generado por CLI 5.x.

> Todo el desarrollo frontend ocurre dentro de `sites/omzone-dev/`. El directorio `src/` que existia en la raiz del repo fue consolidado aqui para evitar duplicados.

---

## Autenticacion CLI

```bash
appwrite login
```

Requerira endpoint y API key. Usar una API key de tipo `server` con permisos de lectura/escritura sobre Databases, Storage y Functions.

Datos del proyecto:

| Campo | Valor |
| --- | --- |
| Endpoint | `https://appwrite.racoondevs.com/v1` |
| Project ID | ver `.env` o consola Appwrite |

---

## Inicializar el proyecto en el repo

Si `appwrite.config.json` aun no existe:

```bash
appwrite init project
```

Esto genera `appwrite.config.json` con el `projectId` y `endpoint`. Commitear este archivo.

> `.env` con API keys **no** debe commitearse. Usar `.env.local` o variables de entorno del sistema.

---

## Pull: traer schema actual desde Appwrite

Usar para sincronizar el repo con cambios hechos directamente en consola (no recomendado como flujo habitual):

```bash
appwrite pull all
```

O por recurso especifico:

```bash
appwrite pull databases
appwrite pull functions
appwrite pull buckets
```

Esto actualiza `appwrite.config.json` con el estado actual de la instancia.

---

## Push: aplicar schema del repo a Appwrite

Flujo principal. Despues de editar `appwrite.config.json` o los archivos de functions:

```bash
appwrite push all
```

O por recurso especifico:

```bash
appwrite push databases
appwrite push functions
appwrite push buckets
```

La CLI aplicara los cambios de forma incremental (crea lo que no existe, actualiza lo que cambio).

> Appwrite CLI no elimina recursos automaticamente para evitar perdida accidental de datos. Para eliminar una coleccion o atributo hay que hacerlo explicitamente desde consola o via la API.

---

## Scripts npm recomendados

Agregar en `package.json`:

```json
{
  "scripts": {
    "appwrite:pull": "appwrite pull all",
    "appwrite:push": "appwrite push all",
    "appwrite:push:db": "appwrite push databases",
    "appwrite:push:functions": "appwrite push functions",
    "appwrite:push:storage": "appwrite push buckets",
    "appwrite:login": "appwrite login"
  }
}
```

Uso:

```bash
npm run appwrite:push
npm run appwrite:push:functions
```

---

## Flujo de trabajo recomendado

### Agregar una nueva coleccion

1. Documentar el schema en `03_appwrite_db_schema.md`.
2. Editar `appwrite.config.json` para agregar la coleccion, atributos e indices.
3. Ejecutar `npm run appwrite:push:db`.
4. Verificar en consola Appwrite.
5. Commitear `appwrite.config.json` y el doc actualizado.

### Agregar o modificar una Function

1. Crear o editar el directorio en `appwrite/functions/<function-id>/`.
2. Agregar entry point segun runtime (ej. `src/main.js` para Node.js).
3. Actualizar `appwrite.config.json` con la funcion si es nueva.
4. Ejecutar `npm run appwrite:push:functions`.
5. Commitear cambios.

### Cambio de permisos o labels

1. Actualizar `05_permissions_and_roles.md`.
2. Aplicar cambios desde consola Appwrite (labels se gestionan en Auth, no en `appwrite.config.json`).
3. Documentar el cambio en `audit_logs` o commit message.

---

## Variables de entorno para Functions

Cada Function usa variables de entorno inyectadas desde Appwrite (no desde `.env` del repo).

Variables tipicas:

| Variable | Uso |
| --- | --- |
| `APPWRITE_ENDPOINT` | endpoint de la instancia |
| `APPWRITE_PROJECT_ID` | ID del proyecto |
| `APPWRITE_API_KEY` | API key de servidor |
| `APPWRITE_DB_ID` | ID de la database (`main`) |
| `STRIPE_SECRET_KEY` | clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | firma de webhook Stripe |
| `PAYPAL_CLIENT_ID` | client ID de PayPal |
| `PAYPAL_CLIENT_SECRET` | secret de PayPal |
| `PAYPAL_WEBHOOK_ID` | ID de webhook PayPal |

Configurar desde consola Appwrite > Functions > [nombre] > Settings > Variables.

---

## Consideraciones de seguridad

- Nunca commitear API keys, secrets de Stripe/PayPal ni `APPWRITE_API_KEY`.
- El archivo `appwrite.config.json` solo contiene estructura (IDs, atributos, permisos). No contiene secretos.
- Agregar a `.gitignore`: `.appwrite/`, archivos `*.env` y cualquier secret generado localmente.

---

## GitHub Actions (opcional, Fase 8)

Ejemplo de workflow para auto-deploy de Functions al hacer push a `main`:

```yaml
# .github/workflows/appwrite-deploy.yml
name: Deploy Appwrite Functions

on:
  push:
    branches: [main]
    paths:
      - 'appwrite/functions/**'
      - 'appwrite.config.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Appwrite CLI
        run: npm install -g appwrite-cli
      - name: Login to Appwrite
        run: appwrite login --endpoint ${{ secrets.APPWRITE_ENDPOINT }} --projectId ${{ secrets.APPWRITE_PROJECT_ID }} --key ${{ secrets.APPWRITE_API_KEY }}
      - name: Deploy functions
        run: appwrite push functions
```

Secrets requeridos en GitHub: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`.

---

## Notas

- `appwrite.config.json` debe commitearse siempre que refleje el estado real de la instancia.
- La CLI 5.x soporta Appwrite 1.8.x. Verificar compatibilidad si se actualiza la instancia.
- Ver limites de naming en `09_appwrite_platform_limits.md` antes de crear nuevos recursos.
