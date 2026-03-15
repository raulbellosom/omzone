# 12_MOCK_DATA_STRATEGY - YWK

## Regla principal

La mock data debe vivir centralizada y ser consumida mediante servicios o adapters.
No debe estar embebida dentro de componentes.

## Estructura

```text
docs/mock-data/
  catalog/
    instructors.json
    class-types.json
    classes.json
    class-sessions.json
    wellness-products.json
    wellness-packages.json
  cms/
    site-content.json
  commerce/
    orders.json
    order-items.json
    bookings.json
    client-packages.json
    package-usages.json
    access-passes.json
  crm/
    contact-leads.json
  users/
    users-profile.json
```

> Archivos **eliminados del modelo**: `membership-plans.json`, `memberships.json`, `promo-codes.json`.
> No existen colecciones correspondientes en DB. No crear mocks para ellos.

## Adapters mock en código

```text
src/services/mocks/
  _delay.js
  catalogService.mock.js
  wellnessService.mock.js
  commerceService.mock.js
  crmService.mock.js
  userService.mock.js
```

> No existe `membershipService.mock.js`. Si algún archivo lo importa, debe refactorizarse a `commerceService` o `packageService`.
