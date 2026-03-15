# 08_ENV_REFERENCE - YWK

> **PAGOS**: Solo Stripe y PayPal con pago único. Sin suscripciones ni cargos recurrentes.
> Nunca almacenar datos de tarjeta (PAN, CVV). Solo guardar referencias externas del proveedor.

## Core

```bash
APP_NAME="Yoga Wellness Kitchen"
APP_ENV=development
APP_BASE_URL=http://localhost:5173
APP_VERSION=1.0.0
DEFAULT_LOCALE=es
DEFAULT_CURRENCY=MXN
```

## Appwrite

```bash
APPWRITE_ENDPOINT=https://appwrite.racoondevs.com/v1
APPWRITE_PROJECT_ID=
APPWRITE_DATABASE_ID=main
```

## Colecciones Appwrite

```bash
APPWRITE_COLLECTION_USERS_PROFILE_ID=users_profile
APPWRITE_COLLECTION_CONTACT_LEADS_ID=contact_leads
APPWRITE_COLLECTION_INSTRUCTORS_ID=instructors
APPWRITE_COLLECTION_CLASS_TYPES_ID=class_types
APPWRITE_COLLECTION_CLASSES_ID=classes
APPWRITE_COLLECTION_CLASS_SESSIONS_ID=class_sessions
APPWRITE_COLLECTION_WELLNESS_PRODUCTS_ID=wellness_products
APPWRITE_COLLECTION_WELLNESS_PACKAGES_ID=wellness_packages
APPWRITE_COLLECTION_ORDERS_ID=orders
APPWRITE_COLLECTION_ORDER_ITEMS_ID=order_items
APPWRITE_COLLECTION_PAYMENTS_ID=payments
APPWRITE_COLLECTION_BOOKINGS_ID=bookings
APPWRITE_COLLECTION_CLIENT_PACKAGES_ID=client_packages
APPWRITE_COLLECTION_PACKAGE_USAGES_ID=package_usages
APPWRITE_COLLECTION_ACCESS_PASSES_ID=access_passes
APPWRITE_COLLECTION_SITE_CONTENT_ID=site_content
APPWRITE_COLLECTION_AUDIT_LOGS_ID=audit_logs
APPWRITE_COLLECTION_APP_SETTINGS_ID=app_settings
```

> Colecciones **eliminadas del modelo**: `membership_plans`, `memberships`, `promo_codes`.
> No existen en DB, no crear variables para ellas.

## Storage buckets

```bash
APPWRITE_BUCKET_PUBLIC_MEDIA_ID=public-media
APPWRITE_BUCKET_PRIVATE_MEDIA_ID=private-media
```

## Pagos — Stripe

```bash
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

> Usar Checkout Session o Payment Element (hosted). Sin Billing, sin Subscriptions API.

## Pagos — PayPal

```bash
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_MODE=sandbox
```

> Usar Orders API v2. Sin Billing Plans, sin Subscriptions API.
