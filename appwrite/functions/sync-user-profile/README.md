# sync-user-profile

Sincroniza `firstName + lastName` del documento `users_profile` hacia el campo `name` de Appwrite Auth. Se invoca desde el frontend cuando el usuario actualiza su nombre en el perfil.

## Trigger

**HTTP** — llamada manual desde el frontend via `functions.createExecution`.

## Qué hace

1. Lee `firstName` y `lastName` del documento `users_profile` del usuario.
2. Actualiza `Auth.name` con `"firstName lastName"` usando el Server SDK.
3. Actualiza `profile.fullName` + `profile.updatedAt` para consistencia.
4. Verifica que el caller sea el mismo usuario (`x-appwrite-user-id` header).

## Request body

```json
{ "userId": "<appwrite-auth-user-id>" }
```

## Response

```json
{ "ok": true, "fullName": "Nombre Apellido" }
```

## Variables de entorno requeridas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `APPWRITE_ENDPOINT` | URL del servidor Appwrite | `https://appwrite.racoondevs.com/v1` |
| `APPWRITE_PROJECT_ID` | ID del proyecto | `69b37e1f001cce5d19cc` |
| `APPWRITE_API_KEY` | **Server API Key** — solo en consola, nunca en el repo | *(generar en console)* |
| `APPWRITE_DATABASE_ID` | ID de la base de datos | `main` |
| `APPWRITE_USERS_PROFILE_COLLECTION_ID` | ID de la colección | `users_profile` |

> `APPWRITE_API_KEY` **debe configurarse manualmente** en Appwrite Console → Functions → sync-user-profile → Variables.

## Scopes del API Key

- `users.read`
- `users.write`
- `databases.read`
- `databases.write`

## Cómo lo invoca el frontend

```js
// src/services/appwrite/profileService.js
await functions.createExecution(
  import.meta.env.VITE_APPWRITE_FUNCTION_SYNC_USER_PROFILE_ID,
  JSON.stringify({ userId }),
  false
)
```

## Despliegue

```bash
appwrite push function --function-id sync-user-profile
```

Después del deploy, agregar `APPWRITE_API_KEY` en la consola manualmente.
