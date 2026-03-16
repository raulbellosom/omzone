# create-user-profile

Crea automáticamente un documento `users_profile` en la base de datos cada vez que se registra un nuevo usuario en Appwrite Auth.

## Trigger

**Evento:** `users.*.create`
Se dispara automáticamente — no requiere llamada manual desde el frontend.

## Qué hace

1. Recibe el objeto del nuevo usuario via el payload del evento.
2. Verifica que no exista ya un perfil para ese `userId` (idempotente).
3. Parsea `Auth.name` (`"Nombre Apellido"`) en `firstName` + `lastName`.
4. Crea el documento en `users_profile` con valores por defecto:
   - `roleKey: 'client'`
   - `status: 'pending_verification'`
   - `emailVerified: false`
   - `onboardingCompleted: false`
   - Permisos: `read(user:userId)` + `update(user:userId)`

## Variables de entorno requeridas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `APPWRITE_ENDPOINT` | URL del servidor Appwrite | `https://appwrite.racoondevs.com/v1` |
| `APPWRITE_PROJECT_ID` | ID del proyecto | `69b37e1f001cce5d19cc` |
| `APPWRITE_API_KEY` | **Server API Key** — solo en consola, nunca en el repo | *(generar en console)* |
| `APPWRITE_DATABASE_ID` | ID de la base de datos | `main` |
| `APPWRITE_USERS_PROFILE_COLLECTION_ID` | ID de la colección | `users_profile` |

> `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_DATABASE_ID` y `APPWRITE_USERS_PROFILE_COLLECTION_ID` se configuran vía `appwrite.json → functions[].vars` y se despliegan automáticamente con `appwrite push function`.
> `APPWRITE_API_KEY` **debe configurarse manualmente** en Appwrite Console → Functions → create-user-profile → Variables.

## Scopes del API Key

El API Key usado necesita los siguientes scopes:

- `users.read`
- `databases.read`
- `databases.write`

## Despliegue

```bash
# Desde la raíz del repo
appwrite push function --function-id create-user-profile
```

Las vars no-sensibles (`APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_DATABASE_ID`, `APPWRITE_USERS_PROFILE_COLLECTION_ID`) se despliegan automáticamente desde `appwrite.json`.
Después del deploy, agregar `APPWRITE_API_KEY` manualmente en la consola.

## Testing

En la Appwrite Console → Functions → create-user-profile, se puede ejecutar manualmente pasando un payload simulado:

```json
{
  "$id": "test-user-123",
  "email": "test@example.com",
  "name": "María García",
  "emailVerification": false
}
```

Verificar en la colección `users_profile` que se creó el documento.
