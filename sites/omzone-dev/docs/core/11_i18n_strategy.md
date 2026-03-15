# 11_I18N_STRATEGY - YWK

## Locales previstas
- `es` (primario y default)
- `en` (secundario)

## Estructura

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
      packages.json
      wellness.json
      customer.json
      admin.json
      validation.json
```

> El namespace `memberships.json` fue eliminado. El modelo comercial son paquetes prepagados (`packages`), no membresías recurrentes.
> Si en alguna pantalla se usa lenguaje de "membresía" como término de marketing, el texto debe vivir en `packages.json` o `landing.json`, dejando claro que es un pago único sin renovación automática.

## Reglas
1. El idioma base visible es español; `fallbackLng: 'es'` sin detección por `navigator`.
2. Todo texto de UI debe salir de archivos de traducción, nunca hardcoded.
3. Los campos de negocio críticos pueden existir como `*_es` y `*_en` en DB.
4. Detection: solo `localStorage` — sin `navigator` para que el idioma del browser no override ES.
