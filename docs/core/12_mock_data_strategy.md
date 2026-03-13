# 12_MOCK_DATA_STRATEGY - YWK

## Regla principal

La mock data debe vivir centralizada y ser consumida mediante servicios o adapters.
No debe estar embebida dentro de componentes.

## Estructura sugerida

```text
docs/mock-data/
  catalog/
    instructors.json
    class-types.json
    classes.json
    class-sessions.json
    membership-plans.json
    wellness-products.json
    wellness-packages.json
  cms/
    site-content.json
  commerce/
    promo-codes.json
    orders.json
    order-items.json
    bookings.json
    memberships.json
  crm/
    contact-leads.json
  users/
    users-profile.json
```
