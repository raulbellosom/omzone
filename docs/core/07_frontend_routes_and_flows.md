# 07_FRONTEND_ROUTES_AND_FLOWS - YWK

## Public routes
- `/`
- `/classes`
- `/classes/:slug`
- `/memberships`
- `/packages`
- `/wellness`
- `/checkout`
- `/login`
- `/register`

## Customer routes
- `/account`
- `/account/bookings`
- `/account/orders`
- `/account/membership`
- `/account/profile`

## Admin routes
- `/app`
- `/app/leads`
- `/app/customers`
- `/app/classes`
- `/app/sessions`
- `/app/memberships`
- `/app/packages`
- `/app/products`
- `/app/orders`
- `/app/bookings`
- `/app/content`
- `/app/settings`

## Flujos

### Landing to purchase
1. visitante entra a landing
2. explora clases, planes o wellness kitchen
3. entra al detalle correspondiente
4. agrega selección
5. pasa a checkout
6. paga o simula pago
7. ve confirmación

### Booking
1. cliente ve clase
2. selecciona sesión
3. agrega extras si aplica
4. inicia sesión o se registra
5. crea orden
6. confirma pago
7. se crea `booking`

### Membership
1. cliente explora plan
2. inicia checkout
3. se crea orden
4. se confirma pago
5. se crea `membership`
