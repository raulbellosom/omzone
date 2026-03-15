---
name: i18n-content
description: "Add or update i18n translations for OMZONE features. USE FOR: adding translation keys for new pages or components, creating new locale namespaces, updating existing translations in es/en, ensuring translation completeness across locales. DO NOT USE FOR: i18n infrastructure setup (already configured), changing i18n library."
argument-hint: "Feature or namespace name and the keys to add"
---

# i18n Content — OMZONE

## When to Use

- Add translation keys for a new page or feature
- Add a new namespace (locale file)
- Update or fix existing translations
- Verify es/en parity for a namespace

## Stack

- **i18next** + **react-i18next** + **i18next-browser-languagedetector**
- Namespace-based file organization
- Default language: `es`
- Supported: `es`, `en`

## File Structure

```
src/i18n/
  index.js                  # i18next config
  locales/
    es/
      common.json           # shared: nav, footer, actions, labels
      landing.json          # landing page
      classes.json          # classes catalog + detail
      booking.json          # booking flow
      checkout.json         # checkout flow
      memberships.json      # membership/plans page
      packages.json         # packages page
      wellness.json         # wellness kitchen page
      customer.json         # customer area
      admin.json            # admin panel
      validation.json       # form validation messages
    en/
      (same files)
```

## Usage in Components

```jsx
import { useTranslation } from 'react-i18next'

export default function MyComponent() {
  const { t } = useTranslation('namespace') // e.g., 'common', 'classes', 'admin'

  return (
    <h1>{t('section.title')}</h1>
    <p>{t('section.description')}</p>
    <button>{t('actions.save')}</button>
  )
}
```

### With interpolation

```jsx
t("greeting", { name: user.firstName });
// JSON: "greeting": "Hola, {{name}}"
```

### With pluralization

```jsx
t("items", { count: 3 });
// JSON: "items_one": "{{count}} artículo", "items_other": "{{count}} artículos"
```

### Multiple namespaces

```jsx
const { t } = useTranslation(["admin", "common"]);
t("admin:entity.title");
t("common:actions.save");
```

## Key Naming Convention

Use dot notation for nested keys. Keep hierarchy shallow (max 3 levels):

```json
{
  "page": {
    "title": "Clases de yoga",
    "description": "Encuentra la clase perfecta para ti"
  },
  "filters": {
    "all": "Todas",
    "difficulty": "Nivel",
    "type": "Tipo"
  },
  "card": {
    "bookNow": "Reservar ahora",
    "spotsLeft": "{{count}} lugares disponibles"
  },
  "empty": {
    "title": "No hay clases disponibles",
    "description": "Vuelve pronto para nuevas clases"
  }
}
```

## Common Shared Keys (`common.json`)

These keys are reused across features:

```json
{
  "nav": {
    "classes": "Clases",
    "memberships": "Membresías",
    "packages": "Paquetes",
    "wellness": "Wellness Kitchen",
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "adminPanel": "Panel admin"
  },
  "actions": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "create": "Crear",
    "confirm": "Confirmar",
    "back": "Volver",
    "next": "Siguiente",
    "bookClass": "Reservar clase",
    "viewDetails": "Ver detalle",
    "learnMore": "Saber más"
  },
  "status": {
    "active": "Activo",
    "inactive": "Inactivo",
    "pending": "Pendiente",
    "confirmed": "Confirmado",
    "cancelled": "Cancelado",
    "completed": "Completado",
    "paid": "Pagado",
    "expired": "Expirado"
  },
  "fields": {
    "name": "Nombre",
    "email": "Correo",
    "phone": "Teléfono",
    "status": "Estado",
    "actions": "Acciones",
    "price": "Precio",
    "date": "Fecha"
  }
}
```

## DB Fields with i18n

Business data uses paired fields: `titleEs`/`titleEn`, `nameEs`/`nameEn`, `descriptionEs`/`descriptionEn`.

Helper to pick the right locale field:

```js
// src/lib/i18n-data.js
import i18n from "@/i18n/index.js";

export function localized(obj, field) {
  const lang = (i18n.resolvedLanguage ?? "es").slice(0, 2);
  const key = `${field}${lang === "en" ? "En" : "Es"}`;
  return obj?.[key] ?? obj?.[`${field}Es`] ?? "";
}

// Usage: localized(classItem, 'title') → classItem.titleEs or titleEn
```

## Adding Translations — Procedure

1. Identify the namespace (existing or new).
2. Add keys to `src/i18n/locales/es/<namespace>.json`.
3. Add equivalent keys to `src/i18n/locales/en/<namespace>.json`.
4. If new namespace: register it in `src/i18n/index.js` resources.
5. Use `useTranslation('<namespace>')` in the component.
6. Never hardcode UI text in components.

## Checklist

1. Both `es` and `en` files updated with identical key structure
2. Keys use dot notation, max 3 levels deep
3. Dynamic values use `{{variable}}` interpolation
4. Pluralization uses `_one` / `_other` suffixes
5. Common labels reuse keys from `common.json`
6. New namespaces registered in i18n config
7. DB content uses `localized()` helper, not raw field access
