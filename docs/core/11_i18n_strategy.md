# 11_I18N_STRATEGY - YWK

## Locales previstas
- `es`
- `en`

## Estructura sugerida

```text
src/i18n/
  index.js
  locales/
    es/
      common.json
      landing.json
      classes.json
      booking.json
      checkout.json
      memberships.json
      packages.json
      wellness.json
      customer.json
      admin.json
      validation.json
    en/
      common.json
      landing.json
      classes.json
      booking.json
      checkout.json
      memberships.json
      packages.json
      wellness.json
      customer.json
      admin.json
      validation.json
```

## Reglas
1. El idioma base visible es español.
2. Todo texto de UI debe salir de archivos de traducción.
3. Los campos de negocio críticos pueden existir como `*_es` y `*_en` en DB.
