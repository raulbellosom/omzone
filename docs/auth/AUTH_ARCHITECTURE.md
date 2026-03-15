# Omzone — Arquitectura de Autenticación

> Versión 1.0 | 2026-03-14

---

## 1. Visión general

Omzone usa **Appwrite Auth** para sesiones e identidad, y una colección de base de datos llamada **`users_profile`** para datos extendidos del usuario. Ambos se mantienen sincronizados mediante Appwrite Functions.

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  LoginPage / RegisterPage / VerifyEmailPage                 │
│                    ↓              ↓                         │
│          authService.js     profileService.js               │
│          (Appwrite SDK)     (Appwrite SDK + Functions)       │
└──────────────────────────────────────────────────────────────┘
                    ↓                    ↓
┌─────────────────────────────────────────────────────────────┐
│                     APPWRITE BACKEND                        │
│                                                             │
│  Auth Service         Database: main                        │
│  ├─ sessions          └─ users_profile (rowSecurity: true)  │
│  ├─ email verify                                            │
│  └─ name                                                    │
│                                                             │
│  Functions                                                  │
│  ├─ create-user-profile   (event: users.*.create)           │
│  ├─ sync-user-profile     (HTTP: actualiza Auth.name)       │
│  └─ sync-email-verification (HTTP: sincroniza emailVerified)│
└─────────────────────────────────────────────────────────────┘
```

**Regla de oro:**
- `Appwrite Auth` es la fuente de verdad para: sesión, contraseña, `emailVerification`.
- `users_profile` es la fuente de verdad para: nombre, rol, teléfono, avatar, estado, locale.
- El frontend **nunca** escribe `roleKey`, `status`, ni `emailVerified` directamente.

---

## 2. Colección `users_profile`

### Campos

| Campo                | Tipo      | Default                  | Editable por cliente |
|----------------------|-----------|--------------------------|----------------------|
| `userId`             | string    | —                        | No                   |
| `roleKey`            | enum      | `client`                 | No (Function only)   |
| `firstName`          | string    | —                        | Sí                   |
| `lastName`           | string    | —                        | Sí                   |
| `fullName`           | string    | —                        | No (calculado)       |
| `email`              | string    | —                        | No (Auth gestiona)   |
| `emailVerified`      | boolean   | `false`                  | No (Function only)   |
| `phone`              | string    | null                     | Sí                   |
| `avatarId`           | string    | null                     | Sí                   |
| `status`             | enum      | `pending_verification`   | No (Function only)   |
| `onboardingCompleted`| boolean   | `false`                  | Sí (cuando aplique)  |
| `provider`           | string    | `email`                  | No                   |
| `locale`             | string    | `es`                     | Sí                   |
| `isSystemUser`       | boolean   | `false`                  | No                   |
| `enabled`            | boolean   | `true`                   | No                   |
| `createdAt`          | datetime  | (al crear)               | No                   |
| `updatedAt`          | datetime  | (al actualizar)          | No                   |

### Roles (`roleKey`)

| Valor   | Descripción                          | Acceso                     |
|---------|--------------------------------------|----------------------------|
| `client`| Usuario final (cliente de la app)    | `/account/**`              |
| `admin` | Operador del negocio                 | `/app/**` + `/account/**`  |
| `root`  | Superusuario técnico (`isSystemUser`)| Todo, no aparece en listas |

### Permisos (rowSecurity: true)

Cada documento se crea con:
```
Permission.read(Role.user(userId))    — el dueño puede leer su perfil
Permission.update(Role.user(userId))  — el dueño puede actualizar su perfil
```
Las Functions (API key server-side) bypasean estos permisos y pueden actualizar cualquier documento.

---

## 3. Flujos

### 3.1 Registro

```
RegisterPage
  └─ useAuth.register({ firstName, lastName, email, password })
       └─ authService.registerWithEmailPassword(...)
            ├─ 1. account.create(id, email, password, fullName)
            │      └─ EVENTO: users.*.create
            │           └─ Function: create-user-profile
            │                └─ Crea users_profile con roleKey='client', status='pending_verification'
            ├─ 2. account.createEmailPasswordSession(email, password)
            └─ 3. account.createVerification(redirectUrl)
                   └─ Appwrite envía email con enlace → /auth/verify-email?userId=...&secret=...
  └─ Navigate → /auth/check-email?email=...
```

### 3.2 Verificación de email

```
Usuario hace clic en el enlace del correo → /auth/verify-email?userId=xxx&secret=xxx

VerifyEmailPage
  ├─ authService.confirmEmailVerification(userId, secret)
  │    └─ account.updateVerification(userId, secret)
  ├─ profileService.syncEmailVerification(userId)
  │    └─ Function: sync-email-verification
  │         ├─ Verifica que el llamante es el mismo usuario
  │         ├─ Lee Auth.emailVerification (server SDK)
  │         ├─ Actualiza profile.emailVerified = true
  │         └─ Si status era 'pending_verification' → status = 'active'
  └─ useAuth.refreshUser() → actualiza contexto
  └─ Navigate → /account (dashboard)
```

### 3.3 Inicio de sesión

```
LoginPage
  └─ useAuth.login(email, password)
       ├─ (mock) loginMock(email)
       └─ (real) authService.loginWithEmailPassword(email, password)
                  └─ account.createEmailPasswordSession(email, password)
            └─ profileService.getMyUserProfile(authUser.$id)
            └─ profileService.normalizeProfile(authUser, profile)
  └─ Si email_verified === false → mostrar aviso + botón reenviar
  └─ Si email_verified === true → navigate(from || /account)
```

### 3.4 Actualización de perfil

```
CustomerProfilePage
  └─ profileService.updateMyUserProfile(userId, { firstName, lastName, phone, ... })
       ├─ Filtra solo campos CLIENT_WRITABLE
       ├─ Recalcula fullName localmente
       ├─ databases.updateDocument(...)
       └─ Si cambió firstName o lastName:
            └─ Function: sync-user-profile
                 ├─ Verifica que el llamante es el mismo usuario
                 ├─ Lee firstName/lastName del perfil
                 ├─ Construye fullName normalizado (trim, sin dobles espacios)
                 └─ users.updateName(userId, fullName) — actualiza Auth.name
```

### 3.5 Reenvío de verificación

```
LoginPage / CheckEmailPage
  └─ authService.sendEmailVerification()
       └─ account.createVerification(redirectUrl)
            └─ Appwrite envía nuevo email (usa SMTP configurado en el servidor)
```

---

## 4. Modo dual (mock / real)

El proyecto soporta dos modos controlados por `VITE_USE_MOCKS`:

| Variable          | Comportamiento                                      |
|-------------------|-----------------------------------------------------|
| `VITE_USE_MOCKS=true`  | Usa `userService.mock.js`. No llama a Appwrite. Demo: `valeria@example.com` |
| `VITE_USE_MOCKS=false` | Usa `authService.js` + `profileService.js` reales.  |

El hook `useAuth` detecta este flag en tiempo de build y enruta las llamadas correspondientes. Ambos modos exponen la misma interfaz pública del contexto.

---

## 5. Despliegue de Functions con Appwrite CLI

### Requisitos previos

```bash
# Instalar Appwrite CLI (v5.x)
npm install -g appwrite-cli

# Iniciar sesión
appwrite login

# Apuntar al proyecto (usar el archivo de config)
appwrite init project --config appwrite.config.json
```

### Push (desplegar) todas las functions

```bash
# El CLI lee appwrite.json del directorio actual — no hay flag --config
# Desde la raíz del repo
appwrite deploy function --all
```

### Push de una function específica

```bash
appwrite deploy function --functionId create-user-profile
appwrite deploy function --functionId sync-user-profile
appwrite deploy function --functionId sync-email-verification
```

> `appwrite.json` es el archivo que lee el CLI. `appwrite.config.json` es la referencia de esquema del proyecto y no interfiere.

### Configurar variables de entorno de cada Function

Vía Appwrite Console → Functions → [nombre] → Variables, o con CLI:

```bash
# CLI 5.x: appwrite push / pull (no deploy)
appwrite functions createVariable \
  --functionId create-user-profile \
  --key APPWRITE_ENDPOINT \
  --value https://appwrite.racoondevs.com/v1

appwrite functions createVariable \
  --functionId create-user-profile \
  --key APPWRITE_PROJECT_ID \
  --value <tu_project_id>

appwrite functions createVariable \
  --functionId create-user-profile \
  --key APPWRITE_API_KEY \
  --value <tu_api_key>

appwrite functions createVariable \
  --functionId create-user-profile \
  --key APPWRITE_DATABASE_ID \
  --value main

appwrite functions createVariable \
  --functionId create-user-profile \
  --key APPWRITE_USERS_PROFILE_COLLECTION_ID \
  --value users_profile
```

Repetir para `sync-user-profile` y `sync-email-verification`.

### Conectar el evento `users.*.create`

Después de desplegar `create-user-profile`, conectar el evento en Appwrite Console:

```
Functions → create-user-profile → Settings → Events → Add event
→ users.*.create
```

O en `appwrite.config.json` ya está declarado en `functions[0].events`.

### Obtener IDs de las functions desplegadas

Después del deploy, copiar los `$id` asignados por Appwrite y agregarlos al `.env`:

```
VITE_APPWRITE_FUNCTION_CREATE_USER_PROFILE_ID=<id>
VITE_APPWRITE_FUNCTION_SYNC_USER_PROFILE_ID=<id>
VITE_APPWRITE_FUNCTION_SYNC_EMAIL_VERIFICATION_ID=<id>
```

---

## 6. Variables de entorno

### Frontend (`sites/omzone-dev/.env`)

```env
VITE_APPWRITE_ENDPOINT=https://appwrite.racoondevs.com/v1
VITE_APPWRITE_PROJECT_ID=<project_id>
VITE_APPWRITE_DATABASE_ID=main
VITE_APPWRITE_APP_URL=https://omzone.com

VITE_APPWRITE_COLLECTION_USERS_PROFILE_ID=users_profile

VITE_APPWRITE_FUNCTION_CREATE_USER_PROFILE_ID=<id>
VITE_APPWRITE_FUNCTION_SYNC_USER_PROFILE_ID=<id>
VITE_APPWRITE_FUNCTION_SYNC_EMAIL_VERIFICATION_ID=<id>

VITE_USE_MOCKS=false   # ← cambiar a false para producción
```

### Functions (configuradas en Appwrite Console, NO en .env del repo)

```env
APPWRITE_ENDPOINT=https://appwrite.racoondevs.com/v1
APPWRITE_PROJECT_ID=<project_id>
APPWRITE_API_KEY=<server_api_key>          # key con permisos de users + databases
APPWRITE_DATABASE_ID=main
APPWRITE_USERS_PROFILE_COLLECTION_ID=users_profile
```

---

## 7. API Key recomendada

Crear una API key en Appwrite Console → Settings → API Keys con los siguientes scopes:

| Scope             | Necesario para                              |
|-------------------|---------------------------------------------|
| `users.read`      | Leer auth user en sync functions            |
| `users.write`     | Actualizar Auth.name en sync-user-profile   |
| `databases.read`  | Leer users_profile en todas las functions   |
| `databases.write` | Crear/actualizar users_profile              |

---

## 8. Objeto de usuario normalizado

`profileService.normalizeProfile(authUser, profile)` retorna:

```javascript
{
  $id:                  string,  // Auth user.$id
  email:                string,
  email_verified:       boolean,
  first_name:           string,  // profile.firstName
  last_name:            string,  // profile.lastName
  full_name:            string,  // profile.fullName
  role_key:             string,  // 'client' | 'admin' | 'root'
  status:               string,  // 'pending_verification' | 'active' | ...
  onboarding_completed: boolean,
  phone:                string|null,
  avatar_id:            string|null,
  locale:               string,
  provider:             string,
  _profile:             object,  // raw users_profile document
  _authUser:            object,  // raw Appwrite Auth user
}
```

Snake_case para compatibilidad con el código existente que fue construido sobre el mock.

---

## 9. TODOs / Mejoras futuras

### Alta prioridad
- [ ] **Recuperación de contraseña**: implementar `account.createRecovery(email, url)` + página `/auth/reset-password?userId=...&secret=...`
- [ ] **Onboarding**: flujo post-registro para completar perfil (`onboardingCompleted = true`)

### Media prioridad
- [ ] **Cambio de email**: flujo seguro con `account.updateEmail` + nueva verificación. No implementado en esta fase por requerir confirmación del email anterior.
- [ ] **Social login**: habilitar Google OAuth en Appwrite + mapear `provider` correctamente en el perfil
- [ ] **Roles avanzados**: crear Function `assign-role` para que admins cambien `roleKey` de usuarios

### Baja prioridad
- [ ] **Sincronización de avatar**: al subir foto, actualizar `profile.avatarId` + generar URL pública con Storage SDK
- [ ] **Auditoría**: registrar eventos de auth en `audit_logs` collection
- [ ] **Webhook externo**: conectar `users.*.create` a un CRM via webhook de Appwrite

---

## 10. Estructura de archivos

```
sites/omzone-dev/src/
├── services/appwrite/
│   ├── client.js          — Appwrite SDK singleton (account, databases, functions, storage)
│   ├── authService.js     — Auth operations (register, login, logout, verify)
│   └── profileService.js  — Profile CRUD + normalizeProfile
├── hooks/
│   └── useAuth.jsx        — Contexto dual-mode (mock/real): login, register, logout, refreshUser
├── pages/auth/
│   ├── LoginPage.jsx      — Login + unverified email warning + resend
│   ├── RegisterPage.jsx   — Registro → /auth/check-email
│   ├── CheckEmailPage.jsx — "Revisa tu correo" + reenviar
│   └── VerifyEmailPage.jsx — Confirma token de email + sync Function
└── routes/
    └── guards.jsx          — RequireAuth({ roles: ['client','admin','root'] })

appwrite/functions/
├── create-user-profile/   — Event: users.*.create
├── sync-user-profile/     — HTTP: Auth.name ← profile firstName+lastName
└── sync-email-verification/ — HTTP: profile.emailVerified ← Auth.emailVerification
```
