# 07_FRONTEND_ROUTES_AND_FLOWS - YWK

> **PAGOS**: Solo pagos únicos (Stripe / PayPal). Sin suscripciones, sin cargos recurrentes, sin renovación automática de ningún tipo.

## Public routes
- `/`
- `/classes`
- `/classes/:slug`
- `/packages`
- `/wellness`
- `/checkout`
- `/checkout/confirmation`
- `/login`
- `/register`

## Customer routes (`/account/*`)
- `/account`
- `/account/bookings`
- `/account/orders`
- `/account/packages`
- `/account/profile`

## Admin routes (`/app/*`)
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

## Flujos

### Landing to purchase
1. visitante entra a landing
2. explora clases, paquetes o wellness
3. entra al detalle correspondiente
4. pasa a checkout
5. paga (Stripe o PayPal) — pago único
6. ve confirmación

### Booking — sesión individual
1. cliente ve clase
2. selecciona sesión
3. agrega extras si aplica
4. inicia sesión o se registra
5. crea `order` + `order_item`
6. confirma pago único
7. se crea `booking` + `access_pass` con QR

### Package purchase — paquete prepagado
1. cliente explora paquetes en `/packages`
2. selecciona paquete
3. inicia checkout
4. paga único (Stripe o PayPal) — sin cargo recurrente
5. se crea `order` + `order_item`
6. se crea `client_package` con créditos y fecha de expiración
7. se genera `access_pass` tipo `package`
8. cliente usa créditos reservando sesiones → `package_usage`

### Wellness product
1. cliente agrega producto wellness
2. checkout → pago único
3. se crea `order` + `order_item`
4. se genera voucher / `access_pass` tipo `order` si aplica

## Regla de pagos
- Proveedor: **Stripe** o **PayPal**
- Tipo: **pago único en una sola exhibición**
- Prohibido: suscripciones, webhooks de renovación, cobro automático recurrente
- Nunca almacenar datos de tarjeta; solo referencias del proveedor (`paymentIntentId`, `captureId`)
