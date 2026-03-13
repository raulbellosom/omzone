# 09_APPWRITE_PLATFORM_LIMITS - APPWRITE 1.8.1

## Scope

Limites y convenciones base para nombrado y modelado en Appwrite.

## Hard limits

| Elemento | Limite |
| --- | --- |
| `databaseId` | `<= 36` chars |
| `collectionId` | `<= 36` chars |
| `functionId` | `<= 36` chars |
| `bucketId` | `<= 36` chars |
| attribute key | `<= 32` chars |
| `index_name` | `<= 36` chars |

## Convenciones

| Tema | Regla |
| --- | --- |
| collections / buckets / indices | usar `snake_case` cuando aplique |
| attributes / payload fields | usar `camelCase` |
| strings | siempre documentar `max` |
| arrays | se permiten; documentar el tipo como `string[]`, `integer[]`, etc. |
| arrays | documentar limites por item y/o cantidad maxima cuando aplique |
| indices | evitar sobreindexar |

## Nota

Todo schema nuevo o modificado debe validarse contra estos limites antes de documentarse o implementarse.
