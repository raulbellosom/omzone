---
name: mock-data
description: "Create or update centralized mock data for OMZONE entities. USE FOR: adding mock data for new collections, extending existing mock datasets with more realistic entries, aligning mock data with the Appwrite DB schema, feeding the mock service layer. Data lives in docs/mock-data/ as JSON. DO NOT USE FOR: service logic (use service-hook), UI components."
argument-hint: "Entity name and what data to add or update"
---

# Mock Data — OMZONE

## When to Use

- Add mock data for a new entity/collection
- Extend existing mock datasets with more entries
- Align mock data after schema changes
- Create realistic test data for a feature

## Structure

```
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
    bookings.json
    memberships.json
    order-items.json
    orders.json
    promo-codes.json
  crm/
    contact-leads.json
  users/
    users-profile.json
```

## Data Format Rules

1. **Mimic Appwrite document shape**: Include `$id`, `$createdAt`, `$updatedAt`.
2. **Use `camelCase`** for all attribute keys (matches Appwrite attribute naming).
3. **IDs are prefixed** by entity: `instr_ana`, `class_morning_flow`, `sess_mf_1`, `order_001`.
4. **FK references** use the `$id` of the related entity: `classId: "class_morning_flow"`.
5. **Dates** in ISO 8601 format.
6. **Prices** as numbers (no formatting, no currency symbol).
7. **Enums** must match schema values exactly (e.g., `beginner`, `scheduled`, `paid`).
8. **i18n fields** use `*Es` / `*En` pairs: `titleEs`, `titleEn`.

## Document Template

```json
{
  "$id": "entity_unique_id",
  "$createdAt": "2025-01-15T10:00:00.000Z",
  "$updatedAt": "2025-01-15T10:00:00.000Z",
  "slug": "url-friendly-slug",
  "nameEs": "Nombre en español",
  "nameEn": "English name",
  "enabled": true
}
```

## Entity Samples

### Class

```json
{
  "$id": "class_morning_flow",
  "slug": "morning-flow",
  "titleEs": "Morning Flow",
  "titleEn": "Morning Flow",
  "summaryEs": "Activa tu mañana con una práctica fluida.",
  "summaryEn": "Start your day with an energizing flow.",
  "classTypeId": "ctype_vinyasa",
  "instructorId": "instr_mario",
  "difficulty": "beginner",
  "durationMin": 60,
  "basePrice": 180,
  "coverImageId": null,
  "isFeatured": true,
  "enabled": true
}
```

### Session

```json
{
  "$id": "sess_mf_1",
  "classId": "class_morning_flow",
  "sessionDate": "2025-03-20T07:00:00.000Z",
  "endDate": "2025-03-20T08:00:00.000Z",
  "capacityTotal": 12,
  "capacityTaken": 7,
  "priceOverride": null,
  "instructorId": "instr_mario",
  "status": "scheduled",
  "locationLabel": "Sala Principal",
  "enabled": true
}
```

### Order

```json
{
  "$id": "order_001",
  "orderNo": "OMZ-2025-001",
  "clientUserId": "user_customer_1",
  "clientEmail": "valeria@example.com",
  "currency": "MXN",
  "subtotal": 990,
  "discountTotal": 0,
  "taxTotal": 0,
  "grandTotal": 990,
  "paymentStatus": "paid",
  "fulfillmentState": "confirmed",
  "promoCode": null,
  "notes": null,
  "paidAt": "2025-03-10T14:30:00.000Z"
}
```

## Where Mock Data Is Consumed

```
docs/mock-data/*.json
  → src/services/mocks/*Service.mock.js   (inline or imported)
    → src/hooks/use*.js                    (React Query hooks)
      → Pages & Components
```

Currently, most mock services define data inline rather than importing from the JSON files. Both approaches are valid — inline is simpler during active development.

## Adding Mock Data — Procedure

1. Check the collection spec in `docs/core/03_appwrite_db_schema.md`.
2. Create/update the JSON file in `docs/mock-data/<category>/`.
3. Ensure all required fields are present and enums are valid.
4. Add realistic MX-locale data (Spanish names, MXN prices, +52 phones).
5. Include both enabled and disabled entries for admin views.
6. Cross-reference FKs: ensure referenced IDs exist in their parent files.
7. Update the mock service to include the new data.

## Checklist

1. JSON file in correct `docs/mock-data/` subdirectory
2. All docs have `$id`, `$createdAt`, `$updatedAt`
3. Attribute keys match `03_appwrite_db_schema.md` exactly (camelCase)
4. Enum values match schema constraints
5. FK references point to existing mock IDs
6. i18n pairs complete (`*Es` + `*En`)
7. Prices are numbers in MXN (no formatting)
8. Dates are ISO 8601
9. Mix of enabled/disabled, featured/non-featured entries
10. Service mock file updated to use the data
