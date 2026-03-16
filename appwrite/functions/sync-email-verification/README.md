# sync-email-verification

Sincroniza el estado real de `emailVerification` desde Appwrite Auth hacia `users_profile.emailVerified`. Además promueve `status: 'pending_verification'` → `'active'` cuando el email queda verificado.

## Trigger

**HTTP** — llamada manual desde el frontend, justo después de que el usuario completa la verificación de email (`account.updateVerification`).

## Qué hace

1. Lee el estado de `emailVerification` directamente desde Appwrite Auth (server SDK) — fuente de verdad, no manipulable desde el cliente.
2. Actualiza `users_profile.emailVerified`.
3. Si `emailVerified = true` y `status = 'pending_verification'` → promueve a `status: 'active'`.
4. Verifica que el caller sea el mismo usuario (`x-appwrite-user-id` header).

## Request body

```json
{ "userId": "<appwrite-auth-user-id>" }
```

## Response

```json
{ "ok": true, "emailVerified": true, "statusUpdated": true }
```

## Variables de entorno requeridas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `APPWRITE_ENDPOINT` | URL del servidor Appwrite | `https://appwrite.racoondevs.com/v1` |
| `APPWRITE_PROJECT_ID` | ID del proyecto | `69b37e1f001cce5d19cc` |
| `APPWRITE_API_KEY` | **Server API Key** — solo en consola, nunca en el repo | *(generar en console)* |
| `APPWRITE_DATABASE_ID` | ID de la base de datos | `main` |
| `APPWRITE_USERS_PROFILE_COLLECTION_ID` | ID de la colección | `users_profile` |

> `APPWRITE_API_KEY` **debe configurarse manualmente** en Appwrite Console → Functions → sync-email-verification → Variables.

## Scopes del API Key

- `users.read`
- `databases.read`
- `databases.write`

## Flujo completo de verificación

```
[Frontend] account.updateVerification(userId, secret)
    ↓
[Frontend] functions.createExecution(FN_SYNC_VERIFY, { userId })
    ↓
[Function] users.get(userId) → emailVerification: true
    ↓
[Function] db.updateDocument(profile, { emailVerified: true, status: 'active' })
    ↓
[Frontend] refreshUser() → perfil actualizado en contexto
```

## Cómo lo invoca el frontend

```js
// src/services/appwrite/profileService.js
await functions.createExecution(
  import.meta.env.VITE_APPWRITE_FUNCTION_SYNC_EMAIL_VERIFICATION_ID,
  JSON.stringify({ userId }),
  false
)
```

## Despliegue

```bash
appwrite push function --function-id sync-email-verification
```

Después del deploy, agregar `APPWRITE_API_KEY` en la consola manualmente.
