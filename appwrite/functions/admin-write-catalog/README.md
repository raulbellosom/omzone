# admin-write-catalog

Centraliza las escrituras administrativas del catalogo de clases en una sola Function segura.

## Trigger

HTTP via `functions.createExecution` desde el frontend admin.

## Seguridad

- Requiere usuario autenticado (`x-appwrite-user-id`).
- Valida label `admin` o `root` antes de cualquier write.
- Usa API key server-side para operaciones en colecciones protegidas.

## Operaciones soportadas

- `class.create`, `class.update`, `class.toggle`, `class.delete`
- `instructor.create`, `instructor.update`, `instructor.toggle`, `instructor.delete`
- `classType.create`, `classType.update`, `classType.toggle`, `classType.delete`
- `session.create`, `session.update`, `session.toggle`, `session.cancel`, `session.delete`

## Request body

```json
{
  "operation": "session.create",
  "payload": {
    "class_id": "...",
    "session_date": "2026-01-10T16:00:00.000Z"
  }
}
```

## Variables de entorno requeridas

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_COLLECTION_CLASSES_ID`
- `APPWRITE_COLLECTION_CLASS_SESSIONS_ID`
- `APPWRITE_COLLECTION_CLASS_TYPES_ID`
- `APPWRITE_COLLECTION_INSTRUCTORS_ID`
- `APPWRITE_COLLECTION_BOOKINGS_ID`

## Scopes del API key

- `users.read`
- `databases.read`
- `databases.write`

## Deploy

```bash
appwrite push function --function-id admin-write-catalog
```
