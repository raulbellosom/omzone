# 01_FRONTEND_REQUIREMENTS - YWK

## Stack objetivo

- React
- Vite
- JavaScript
- Tailwind CSS 4.1
- React Router
- Appwrite Web SDK
- shadcn/ui
- Lucide React
- Phosphor Icons o Remix Icons
- i18n por archivos
- React Query o equivalente

## Principios

1. Mobile-first.
2. Sin data hardcoded en componentes.
3. Componentes reutilizables.
4. UI premium pero simple.
5. Integración limpia con backend/Appwrite.
6. i18n real desde el inicio.

## Estructura sugerida

```text
src/
  app/
  routes/
  layouts/
  pages/
  components/
  features/
    marketing/
    auth/
    classes/
    booking/
    checkout/
    packages/
    wellness/
    customer/
    admin/
    shared/
  services/
    appwrite/
    api/
    mocks/
  hooks/
  lib/
  utils/
  constants/
  i18n/
    locales/
      es/
      en/
    index.js
  env.js
```

## Rutas mínimas

### Públicas
- `/`
- `/classes`
- `/classes/:slug`
- `/packages`
- `/wellness`
- `/checkout`
- `/checkout/confirmation`
- `/login`
- `/register`

### Privadas cliente (`/account/*`)
- `/account`
- `/account/bookings`
- `/account/orders`
- `/account/packages`
- `/account/profile`

### Privadas admin (`/app/*`)
- `/app`
- `/app/leads`
- `/app/clients`
- `/app/classes`
- `/app/sessions`
- `/app/packages`
- `/app/products`
- `/app/orders`
- `/app/bookings`
- `/app/passes`
- `/app/content`
- `/app/settings`
