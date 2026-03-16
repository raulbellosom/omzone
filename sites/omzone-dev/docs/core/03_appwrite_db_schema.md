# 03_APPWRITE_DB_SCHEMA - OMZONE APPWRITE 1.8.1 CANON

## Referencias

- `00_project_brief.md`
- `02_backend_appwrite_requirements.md`
- `05_permissions_and_roles.md`
- `06_appwrite_functions_catalog.md`
- `09_appwrite_platform_limits.md`

## Scope

Fuente de verdad para el esquema Appwrite del MVP.

- Endpoint esperado: `https://appwrite.racoondevs.com`
- Database ID sugerido: `main`
- Convencion de naming:
  - recursos Appwrite (`collectionId`, `bucketId`, indices): `snake_case`
  - atributos de documentos y payloads: `camelCase`

## Storage buckets

| Bucket ID       | Purpose                                          | Max size | Public |
| --------------- | ------------------------------------------------ | -------- | ------ |
| `public-media`  | imagenes publicas de landing, clases y productos | `10 MB`  | yes    |
| `private-media` | comprobantes, media privada o archivos internos  | `15 MB`  | no     |

## Active collections

| Collection ID       | Purpose                                          | Row security |
| ------------------- | ------------------------------------------------ | ------------ |
| `users_profile`     | perfil extendido por usuario Appwrite            | off          |
| `contact_leads`     | prospectos desde landing o formularios           | off          |
| `instructors`       | instructores como entidad de contenido           | off          |
| `class_types`       | categorias de clases                             | off          |
| `classes`           | ficha principal de clase                         | off          |
| `class_sessions`    | sesiones reservables                             | off          |
| `wellness_products` | productos o extras wellness kitchen              | off          |
| `wellness_packages` | paquetes prepagados combinados                   | off          |
| `orders`            | pedido o venta principal                         | off          |
| `order_items`       | renglones del pedido                             | off          |
| `payments`          | registro de transacciones y referencias externas | off          |
| `bookings`          | reservas de clases                               | off          |
| `client_packages`   | paquetes comprados por el cliente                | off          |
| `package_usages`    | consumos individuales de creditos de paquete     | off          |
| `access_passes`     | pases QR de acceso fisico                        | off          |
| `site_content`      | contenido editable de landing y secciones        | off          |
| `audit_logs`        | auditoria interna                                | off          |
| `app_settings`      | configuracion global                             | off          |

> `membership_plans` y `memberships` **no existen** en este MVP. Ver `02_backend_appwrite_requirements.md`.

## Collection specs

Nota de lectura:

- `required`, `unique` y `default` solo reflejan lo explicitamente documentado.
- `-` significa "no especificado en la fuente actual", no una regla inferida.
- `constraints` separa tamano, rangos, enums, `nullable` y formatos.
- Convencion usada en este schema: referencias tipo `*Id` se documentan con max `64`, salvo que se indique otra cosa.
- Si un valor estructurado se guarda en `string`, aqui solo se documenta su `max`; el detalle de que contiene JSON va en `notes`.
- Si se usa un array, se documenta en `type` como `string[]`, `integer[]`, etc., y en `constraints` se especifica max por item y/o max de items.

### Collection: `users_profile`

Purpose: perfil extendido del usuario autenticado.

El `$id` del documento **es** el `$id` del usuario Auth — no se almacena campo `userId`.

| key            | type      | required | unique | default | constraints               | notes                |
| -------------- | --------- | -------- | ------ | ------- | ------------------------- | -------------------- |
| `roleKey`      | `enum`    | -        | -      | -       | `root,admin,client`       | rol operativo        |
| `firstName`    | `string`  | -        | -      | -       | max `80`                  | nombre               |
| `lastName`     | `string`  | -        | -      | -       | max `80`                  | apellido             |
| `email`        | `email`   | -        | yes    | -       | valid email               | email del perfil     |
| `phone`        | `string`  | -        | -      | -       | max `20`                  | telefono             |
| `avatarId`     | `string`  | -        | -      | -       | max `64`                  | referencia a storage |
| `status`       | `enum`    | -        | -      | -       | `active,inactive,blocked` | estado de cuenta     |
| `locale`       | `string`  | -        | -      | `es`    | max `10`                  | locale base          |
| `isSystemUser` | `boolean` | -        | -      | `false` | -                         | true solo para root  |
| `enabled`      | `boolean` | -        | -      | `true`  | -                         | soft enable          |

Indexes:

| Index                | Keys           | Sort | Notes             |
| -------------------- | -------------- | ---- | ----------------- |
| `uq_profile_email`   | `email`        | `↑`  | unique            |
| `idx_profile_role`   | `roleKey`      | `↑`  | lookup por rol    |
| `idx_profile_status` | `status`       | `↑`  | lookup por estado |
| `idx_profile_system` | `isSystemUser` | `↑`  | excluir de listas |

### Collection: `contact_leads`

Purpose: prospectos capturados desde formularios publicos.

| key            | type     | required | unique | default | constraints                        | notes             |
| -------------- | -------- | -------- | ------ | ------- | ---------------------------------- | ----------------- |
| `fullName`     | `string` | -        | -      | -       | max `120`                          | nombre completo   |
| `email`        | `email`  | -        | -      | -       | valid email                        | contacto          |
| `phone`        | `string` | -        | -      | -       | max `20`                           | contacto          |
| `interestType` | `enum`   | -        | -      | -       | `class,package,wellness,other`     | interes principal |
| `notes`        | `string` | -        | -      | -       | max `4000`                         | detalle libre     |
| `status`       | `enum`   | -        | -      | -       | `new,contacted,qualified,won,lost` | estado CRM        |

Indexes:

| Index                | Keys           | Sort | Notes               |
| -------------------- | -------------- | ---- | ------------------- |
| `idx_leads_email`    | `email`        | `↑`  | lookup por contacto |
| `idx_leads_interest` | `interestType` | `↑`  | filtro por interes  |
| `idx_leads_status`   | `status`       | `↑`  | pipeline comercial  |

### Collection: `instructors`

Purpose: instructores usados como contenido del catalogo.

| key            | type      | required | unique | default | constraints | notes                               |
| -------------- | --------- | -------- | ------ | ------- | ----------- | ----------------------------------- |
| `slug`         | `string`  | -        | yes    | -       | max `100`   | slug publico                        |
| `fullName`     | `string`  | -        | -      | -       | max `120`   | nombre visible                      |
| `shortBio`     | `string`  | -        | -      | -       | max `600`   | bio corta                           |
| `photoId`      | `string`  | -        | -      | -       | max `64`    | asset ref                           |
| `specialties`  | `string`  | -        | -      | -       | max `2000`  | especialidades serializadas en JSON |
| `displayOrder` | `integer` | -        | -      | -       | -           | orden visual                        |
| `enabled`      | `boolean` | -        | -      | -       | -           | estado                              |

Indexes:

| Index              | Keys           | Sort | Notes            |
| ------------------ | -------------- | ---- | ---------------- |
| `uq_inst_slug`     | `slug`         | `↑`  | unique route key |
| `idx_inst_order`   | `displayOrder` | `↑`  | orden de listado |
| `idx_inst_enabled` | `enabled`      | `↑`  | filtro publico   |

### Collection: `class_types`

Purpose: taxonomia de clases.

| key           | type      | required | unique | default | constraints | notes        |
| ------------- | --------- | -------- | ------ | ------- | ----------- | ------------ |
| `slug`        | `string`  | -        | yes    | -       | max `80`    | slug publico |
| `nameEs`      | `string`  | -        | -      | -       | max `80`    | etiqueta ES  |
| `nameEn`      | `string`  | -        | -      | -       | max `80`    | etiqueta EN  |
| `description` | `string`  | -        | -      | -       | max `500`   | descripcion  |
| `enabled`     | `boolean` | -        | -      | -       | -           | estado       |

Indexes:

| Index                 | Keys      | Sort | Notes            |
| --------------------- | --------- | ---- | ---------------- |
| `uq_clstype_slug`     | `slug`    | `↑`  | unique route key |
| `idx_clstype_enabled` | `enabled` | `↑`  | filtro publico   |

### Collection: `classes`

Purpose: entidad principal del catalogo de clases.

| key             | type      | required | unique | default | constraints                                 | notes               |
| --------------- | --------- | -------- | ------ | ------- | ------------------------------------------- | ------------------- |
| `slug`          | `string`  | -        | yes    | -       | max `120`                                   | slug publico        |
| `titleEs`       | `string`  | -        | -      | -       | max `120`                                   | titulo ES           |
| `titleEn`       | `string`  | -        | -      | -       | max `120`                                   | titulo EN           |
| `summaryEs`     | `string`  | -        | -      | -       | max `320`                                   | resumen ES          |
| `summaryEn`     | `string`  | -        | -      | -       | max `320`                                   | resumen EN          |
| `descriptionEs` | `string`  | -        | -      | -       | max `6000`                                  | descripcion ES      |
| `descriptionEn` | `string`  | -        | -      | -       | max `6000`                                  | descripcion EN      |
| `classTypeId`   | `string`  | -        | -      | -       | max `64`                                    | FK logica           |
| `instructorId`  | `string`  | -        | -      | -       | max `64`                                    | FK logica           |
| `difficulty`    | `enum`    | -        | -      | -       | `beginner,intermediate,advanced,all_levels` | dificultad          |
| `durationMin`   | `integer` | -        | -      | -       | -                                           | duracion en minutos |
| `basePrice`     | `float`   | -        | -      | -       | -                                           | precio base         |
| `coverImageId`  | `string`  | -        | -      | -       | max `64`                                    | imagen principal    |
| `isFeatured`    | `boolean` | -        | -      | -       | -                                           | destacado           |
| `enabled`       | `boolean` | -        | -      | -       | -                                           | estado              |

Indexes:

| Index                 | Keys           | Sort | Notes                 |
| --------------------- | -------------- | ---- | --------------------- |
| `uq_classes_slug`     | `slug`         | `↑`  | unique route key      |
| `idx_classes_type`    | `classTypeId`  | `↑`  | filtro por tipo       |
| `idx_classes_instr`   | `instructorId` | `↑`  | filtro por instructor |
| `idx_classes_diff`    | `difficulty`   | `↑`  | filtro por nivel      |
| `idx_classes_feat`    | `isFeatured`   | `↑`  | destacados            |
| `idx_classes_enabled` | `enabled`      | `↑`  | filtro publico        |

### Collection: `class_sessions`

Purpose: sesiones individuales reservables por fecha.

| key             | type       | required | unique | default | constraints                          | notes             |
| --------------- | ---------- | -------- | ------ | ------- | ------------------------------------ | ----------------- |
| `classId`       | `string`   | -        | -      | -       | max `64`                             | FK logica         |
| `sessionDate`   | `datetime` | -        | -      | -       | ISO 8601                             | inicio            |
| `endDate`       | `datetime` | -        | -      | -       | ISO 8601                             | fin               |
| `capacityTotal` | `integer`  | -        | -      | -       | -                                    | capacidad total   |
| `capacityTaken` | `integer`  | -        | -      | -       | -                                    | capacidad ocupada |
| `priceOverride` | `float`    | -        | -      | -       | nullable                             | precio opcional   |
| `instructorId`  | `string`   | -        | -      | -       | max `64`                             | instructor sesion |
| `status`        | `enum`     | -        | -      | -       | `scheduled,full,cancelled,completed` | estado de sesion  |
| `locationLabel` | `string`   | -        | -      | -       | max `120`                            | sede o ubicacion  |
| `enabled`       | `boolean`  | -        | -      | -       | -                                    | estado            |

Indexes:

| Index              | Keys           | Sort | Notes                 |
| ------------------ | -------------- | ---- | --------------------- |
| `idx_sess_class`   | `classId`      | `↑`  | agenda por clase      |
| `idx_sess_date`    | `sessionDate`  | `↑`  | listado cronologico   |
| `idx_sess_status`  | `status`       | `↑`  | disponibilidad        |
| `idx_sess_instr`   | `instructorId` | `↑`  | agenda por instructor |
| `idx_sess_enabled` | `enabled`      | `↑`  | filtro publico        |

### Collection: `wellness_products`

Purpose: productos y extras wellness kitchen.

| key             | type      | required | unique | default | constraints                                  | notes            |
| --------------- | --------- | -------- | ------ | ------- | -------------------------------------------- | ---------------- |
| `slug`          | `string`  | -        | yes    | -       | max `100`                                    | slug publico     |
| `nameEs`        | `string`  | -        | -      | -       | max `120`                                    | nombre ES        |
| `nameEn`        | `string`  | -        | -      | -       | max `120`                                    | nombre EN        |
| `descriptionEs` | `string`  | -        | -      | -       | max `2500`                                   | descripcion ES   |
| `descriptionEn` | `string`  | -        | -      | -       | max `2500`                                   | descripcion EN   |
| `productType`   | `enum`    | -        | -      | -       | `smoothie,snack,supplement,plan,addon,other` | tipo de producto |
| `price`         | `float`   | -        | -      | -       | -                                            | precio           |
| `coverImageId`  | `string`  | -        | -      | -       | max `64`                                     | imagen principal |
| `isAddonOnly`   | `boolean` | -        | -      | -       | -                                            | solo add-on      |
| `enabled`       | `boolean` | -        | -      | -       | -                                            | estado           |
| `isFeatured`    | `boolean` | -        | -      | -       | -                                            | destacado        |

Indexes:

| Index               | Keys          | Sort | Notes                |
| ------------------- | ------------- | ---- | -------------------- |
| `uq_wprod_slug`     | `slug`        | `↑`  | unique route key     |
| `idx_wprod_type`    | `productType` | `↑`  | filtro por categoria |
| `idx_wprod_addon`   | `isAddonOnly` | `↑`  | filtro de add-ons    |
| `idx_wprod_feat`    | `isFeatured`  | `↑`  | destacados           |
| `idx_wprod_enabled` | `enabled`     | `↑`  | filtro publico       |

### Collection: `wellness_packages`

Purpose: paquetes prepagados que combinan creditos de clases y productos wellness con expiracion.

| key                | type      | required | unique | default | constraints | notes                                              |
| ------------------ | --------- | -------- | ------ | ------- | ----------- | -------------------------------------------------- |
| `slug`             | `string`  | -        | yes    | -       | max `100`   | slug publico                                       |
| `nameEs`           | `string`  | -        | -      | -       | max `120`   | nombre ES                                          |
| `nameEn`           | `string`  | -        | -      | -       | max `120`   | nombre EN                                          |
| `descriptionEs`    | `string`  | -        | -      | -       | max `3000`  | descripcion ES                                     |
| `descriptionEn`    | `string`  | -        | -      | -       | max `3000`  | descripcion EN                                     |
| `price`            | `float`   | -        | -      | -       | -           | precio normal                                      |
| `salePriceEnabled` | `boolean` | -        | -      | `false` | -           | precio oferta activo                               |
| `salePrice`        | `float`   | -        | -      | -       | nullable    | precio oferta                                      |
| `classCredits`     | `integer` | -        | -      | `0`     | -           | creditos para sesiones de clase                    |
| `wellnessCredits`  | `integer` | -        | -      | `0`     | -           | creditos para productos wellness                   |
| `expirationDays`   | `integer` | -        | -      | `30`    | -           | dias de vigencia desde la compra                   |
| `rulesJson`        | `string`  | -        | -      | -       | max `4000`  | reglas del paquete serializadas en JSON            |
| `itemsJson`        | `string`  | -        | -      | -       | max `6000`  | descripcion de items incluidos serializada en JSON |
| `enabled`          | `boolean` | -        | -      | -       | -           | estado                                             |
| `isFeatured`       | `boolean` | -        | -      | -       | -           | destacado                                          |

Indexes:

| Index              | Keys               | Sort | Notes            |
| ------------------ | ------------------ | ---- | ---------------- |
| `uq_wpkg_slug`     | `slug`             | `↑`  | unique route key |
| `idx_wpkg_feat`    | `isFeatured`       | `↑`  | destacados       |
| `idx_wpkg_enabled` | `enabled`          | `↑`  | filtro publico   |
| `idx_wpkg_sale`    | `salePriceEnabled` | `↑`  | filtros oferta   |

### Collection: `orders`

Purpose: documento principal de compra.

| key                | type       | required | unique | default | constraints                                   | notes                |
| ------------------ | ---------- | -------- | ------ | ------- | --------------------------------------------- | -------------------- |
| `orderNo`          | `string`   | -        | yes    | -       | max `40`                                      | folio de orden       |
| `clientUserId`     | `string`   | -        | -      | -       | max `64`                                      | cliente              |
| `clientEmail`      | `email`    | -        | -      | -       | valid email                                   | snapshot de contacto |
| `currency`         | `string`   | -        | -      | `MXN`   | max `3`                                       | moneda               |
| `subtotal`         | `float`    | -        | -      | -       | -                                             | subtotal             |
| `discountTotal`    | `float`    | -        | -      | -       | -                                             | descuento            |
| `taxTotal`         | `float`    | -        | -      | -       | -                                             | impuestos            |
| `grandTotal`       | `float`    | -        | -      | -       | -                                             | total                |
| `paymentStatus`    | `enum`     | -        | -      | -       | `pending,paid,failed,refunded,partial_refund` | estado de pago       |
| `fulfillmentState` | `enum`     | -        | -      | -       | `pending,confirmed,cancelled,completed`       | estado operativo     |
| `promoCode`        | `string`   | -        | -      | -       | max `40`                                      | codigo aplicado      |
| `notes`            | `string`   | -        | -      | -       | max `1500`                                    | notas operativas     |
| `paidAt`           | `datetime` | -        | -      | -       | ISO 8601                                      | fecha de pago        |

Indexes:

| Index               | Keys               | Sort | Notes                  |
| ------------------- | ------------------ | ---- | ---------------------- |
| `uq_orders_no`      | `orderNo`          | `↑`  | unique order lookup    |
| `idx_orders_client` | `clientUserId`     | `↑`  | historial de cliente   |
| `idx_orders_pay`    | `paymentStatus`    | `↑`  | operaciones de pago    |
| `idx_orders_state`  | `fulfillmentState` | `↑`  | operaciones de entrega |
| `idx_orders_paid`   | `paidAt`           | `↓`  | orden reciente pagada  |

### Collection: `order_items`

Purpose: detalle de items asociados a una orden.

| key             | type      | required | unique | default | constraints                                    | notes                                  |
| --------------- | --------- | -------- | ------ | ------- | ---------------------------------------------- | -------------------------------------- |
| `orderId`       | `string`  | -        | -      | -       | max `64`                                       | FK logica                              |
| `itemType`      | `enum`    | -        | -      | -       | `class_session,wellness_package,product,addon` | tipo de renglon                        |
| `referenceId`   | `string`  | -        | -      | -       | max `64`                                       | referencia al item                     |
| `titleSnapshot` | `string`  | -        | -      | -       | max `160`                                      | titulo congelado                       |
| `quantity`      | `integer` | -        | -      | -       | -                                              | cantidad                               |
| `unitPrice`     | `float`   | -        | -      | -       | -                                              | precio unitario                        |
| `lineTotal`     | `float`   | -        | -      | -       | -                                              | total del renglon                      |
| `metaJson`      | `string`  | -        | -      | -       | max `2000`                                     | metadata adicional serializada en JSON |

Indexes:

| Index              | Keys          | Sort | Notes               |
| ------------------ | ------------- | ---- | ------------------- |
| `idx_oitems_order` | `orderId`     | `↑`  | renglones por orden |
| `idx_oitems_ref`   | `referenceId` | `↑`  | lookup reverso      |
| `idx_oitems_type`  | `itemType`    | `↑`  | analitica por tipo  |

### Collection: `payments`

Purpose: registro de transacciones con referencias externas a proveedores de pago.

> Regla: NUNCA almacenar numero de tarjeta, CVV, PAN ni datos sensibles de pago. Solo referencias del proveedor.

| key                 | type       | required | unique | default | constraints                                  | notes                       |
| ------------------- | ---------- | -------- | ------ | ------- | -------------------------------------------- | --------------------------- |
| `orderId`           | `string`   | -        | -      | -       | max `64`                                     | FK logica                   |
| `provider`          | `enum`     | -        | -      | -       | `stripe,paypal`                              | proveedor de pago           |
| `providerPaymentId` | `string`   | -        | -      | -       | max `200`                                    | payment intent o capture ID |
| `providerSessionId` | `string`   | -        | -      | -       | max `200`                                    | session/checkout ID externo |
| `amount`            | `float`    | -        | -      | -       | -                                            | monto cobrado               |
| `currency`          | `string`   | -        | -      | `MXN`   | max `3`                                      | moneda                      |
| `status`            | `enum`     | -        | -      | -       | `pending,succeeded,failed,refunded,disputed` | estado del pago             |
| `rawSummary`        | `string`   | -        | -      | -       | max `4000`                                   | JSON resumido del webhook   |
| `paidAt`            | `datetime` | -        | -      | -       | ISO 8601                                     | timestamp de confirmacion   |
| `refundedAt`        | `datetime` | -        | -      | -       | ISO 8601                                     | timestamp de reembolso      |

Indexes:

| Index              | Keys                | Sort | Notes                |
| ------------------ | ------------------- | ---- | -------------------- |
| `idx_pay_order`    | `orderId`           | `↑`  | pagos por orden      |
| `idx_pay_provider` | `provider`          | `↑`  | filtro por proveedor |
| `idx_pay_ext_id`   | `providerPaymentId` | `↑`  | lookup externo       |
| `idx_pay_status`   | `status`            | `↑`  | operaciones de pago  |
| `idx_pay_paid`     | `paidAt`            | `↓`  | recientes            |

### Collection: `bookings`

Purpose: reservas del cliente para sesiones de clase.

| key            | type       | required | unique | default | constraints                                                 | notes                       |
| -------------- | ---------- | -------- | ------ | ------- | ----------------------------------------------------------- | --------------------------- |
| `clientUserId` | `string`   | -        | -      | -       | max `64`                                                    | cliente                     |
| `sessionId`    | `string`   | -        | -      | -       | max `64`                                                    | sesion reservada            |
| `orderId`      | `string`   | -        | -      | -       | max `64`                                                    | orden origen                |
| `bookingCode`  | `string`   | -        | yes    | -       | max `40`                                                    | codigo de reserva           |
| `status`       | `enum`     | -        | -      | -       | `pending,confirmed,cancelled,completed,no_show,rescheduled` | estado                      |
| `unitPrice`    | `float`    | -        | -      | -       | -                                                           | precio unitario             |
| `extrasJson`   | `string`   | -        | -      | -       | max `2000`                                                  | extras serializados en JSON |
| `reservedAt`   | `datetime` | -        | -      | -       | ISO 8601                                                    | fecha de reserva            |

Indexes:

| Index                  | Keys           | Sort | Notes                 |
| ---------------------- | -------------- | ---- | --------------------- |
| `uq_bookings_code`     | `bookingCode`  | `↑`  | unique booking lookup |
| `idx_bookings_client`  | `clientUserId` | `↑`  | agenda del cliente    |
| `idx_bookings_session` | `sessionId`    | `↑`  | roster por sesion     |
| `idx_bookings_order`   | `orderId`      | `↑`  | linkage con orden     |
| `idx_bookings_status`  | `status`       | `↑`  | operacion de reservas |

### Collection: `client_packages`

Purpose: paquetes comprados por un cliente. Registra creditos disponibles y fecha de expiracion.

| key                        | type       | required | unique | default | constraints                          | notes                          |
| -------------------------- | ---------- | -------- | ------ | ------- | ------------------------------------ | ------------------------------ |
| `clientUserId`             | `string`   | -        | -      | -       | max `64`                             | cliente propietario            |
| `packageId`                | `string`   | -        | -      | -       | max `64`                             | FK a `wellness_packages`       |
| `orderId`                  | `string`   | -        | -      | -       | max `64`                             | orden origen                   |
| `purchasedAt`              | `datetime` | -        | -      | -       | ISO 8601                             | fecha de compra                |
| `expiresAt`                | `datetime` | -        | -      | -       | ISO 8601                             | fecha de expiracion            |
| `totalClassCredits`        | `integer`  | -        | -      | `0`     | -                                    | creditos de clases totales     |
| `totalWellnessCredits`     | `integer`  | -        | -      | `0`     | -                                    | creditos wellness totales      |
| `remainingClassCredits`    | `integer`  | -        | -      | `0`     | -                                    | creditos de clases disponibles |
| `remainingWellnessCredits` | `integer`  | -        | -      | `0`     | -                                    | creditos wellness disponibles  |
| `status`                   | `enum`     | -        | -      | -       | `active,exhausted,expired,cancelled` | estado del paquete             |

Indexes:

| Index              | Keys           | Sort | Notes                |
| ------------------ | -------------- | ---- | -------------------- |
| `idx_cpkg_client`  | `clientUserId` | `↑`  | paquetes del cliente |
| `idx_cpkg_package` | `packageId`    | `↑`  | reporte por producto |
| `idx_cpkg_order`   | `orderId`      | `↑`  | linkage con compra   |
| `idx_cpkg_status`  | `status`       | `↑`  | lifecycle ops        |
| `idx_cpkg_expires` | `expiresAt`    | `↑`  | cron de expiracion   |

### Collection: `package_usages`

Purpose: registro de cada consumo individual de credito de un paquete. Trazabilidad completa.

| key               | type       | required | unique | default | constraints                      | notes                        |
| ----------------- | ---------- | -------- | ------ | ------- | -------------------------------- | ---------------------------- |
| `clientPackageId` | `string`   | -        | -      | -       | max `64`                         | FK a `client_packages`       |
| `clientUserId`    | `string`   | -        | -      | -       | max `64`                         | cliente (desnormalizado)     |
| `bookingId`       | `string`   | -        | -      | -       | max `64`                         | FK a `bookings` si aplica    |
| `orderItemId`     | `string`   | -        | -      | -       | max `64`                         | FK a `order_items` si aplica |
| `usageType`       | `enum`     | -        | -      | -       | `class_session,wellness_product` | tipo de consumo              |
| `quantity`        | `integer`  | -        | -      | `1`     | -                                | creditos consumidos          |
| `consumedAt`      | `datetime` | -        | -      | -       | ISO 8601                         | timestamp del consumo        |

Indexes:

| Index                 | Keys              | Sort | Notes                |
| --------------------- | ----------------- | ---- | -------------------- |
| `idx_pkguse_cpkg`     | `clientPackageId` | `↑`  | consumos del paquete |
| `idx_pkguse_client`   | `clientUserId`    | `↑`  | consumos del cliente |
| `idx_pkguse_booking`  | `bookingId`       | `↑`  | linkage con reserva  |
| `idx_pkguse_type`     | `usageType`       | `↑`  | analitica por tipo   |
| `idx_pkguse_consumed` | `consumedAt`      | `↓`  | historial reciente   |

### Collection: `access_passes`

Purpose: pases QR de acceso fisico. Un pass representa derecho de entrada a un evento o sesion.

> Regla: el QR solo contiene un token opaco (`qrToken`). El backend es el unico que valida su significado.

| key            | type       | required | unique | default | constraints                     | notes                       |
| -------------- | ---------- | -------- | ------ | ------- | ------------------------------- | --------------------------- |
| `clientUserId` | `string`   | -        | -      | -       | max `64`                        | propietario del pase        |
| `passType`     | `enum`     | -        | -      | -       | `booking,order,package`         | tipo de pase                |
| `referenceId`  | `string`   | -        | -      | -       | max `64`                        | ID del booking, order o pkg |
| `qrToken`      | `string`   | -        | yes    | -       | max `200`                       | token unico opaco           |
| `status`       | `enum`     | -        | -      | -       | `active,used,expired,cancelled` | estado del pase             |
| `validFrom`    | `datetime` | -        | -      | -       | ISO 8601                        | inicio de validez           |
| `validUntil`   | `datetime` | -        | -      | -       | ISO 8601                        | fin de validez              |
| `usedAt`       | `datetime` | -        | -      | -       | ISO 8601                        | timestamp de uso            |
| `usedBy`       | `string`   | -        | -      | -       | max `64`                        | admin que valido el pase    |
| `notes`        | `string`   | -        | -      | -       | max `500`                       | notas opcionales            |

Indexes:

| Index             | Keys           | Sort | Notes               |
| ----------------- | -------------- | ---- | ------------------- |
| `uq_pass_token`   | `qrToken`      | `↑`  | unique token lookup |
| `idx_pass_client` | `clientUserId` | `↑`  | pases del cliente   |
| `idx_pass_type`   | `passType`     | `↑`  | filtro por tipo     |
| `idx_pass_ref`    | `referenceId`  | `↑`  | lookup reverso      |
| `idx_pass_status` | `status`       | `↑`  | operacion de pases  |
| `idx_pass_until`  | `validUntil`   | `↑`  | cron de expiracion  |

### Collection: `site_content`

Purpose: contenido editable de landing y modulos del sitio.

| key          | type      | required | unique | default | constraints | notes                        |
| ------------ | --------- | -------- | ------ | ------- | ----------- | ---------------------------- |
| `contentKey` | `string`  | -        | -      | -       | max `80`    | clave de contenido           |
| `locale`     | `string`  | -        | -      | -       | max `10`    | locale                       |
| `title`      | `string`  | -        | -      | -       | max `200`   | titulo                       |
| `body`       | `string`  | -        | -      | -       | max `12000` | cuerpo                       |
| `metaJson`   | `string`  | -        | -      | -       | max `4000`  | metadata serializada en JSON |
| `enabled`    | `boolean` | -        | -      | -       | -           | estado                       |

Indexes:

| Index                 | Keys         | Sort | Notes             |
| --------------------- | ------------ | ---- | ----------------- |
| `idx_content_key`     | `contentKey` | `↑`  | lookup por bloque |
| `idx_content_locale`  | `locale`     | `↑`  | filtro por idioma |
| `idx_content_enabled` | `enabled`    | `↑`  | contenido activo  |

### Collection: `app_settings`

Purpose: configuracion global del negocio y de la experiencia.

| key               | type     | required | unique | default | constraints | notes              |
| ----------------- | -------- | -------- | ------ | ------- | ----------- | ------------------ |
| `appName`         | `string` | -        | -      | -       | max `100`   | nombre de la app   |
| `defaultLocale`   | `string` | -        | -      | -       | max `10`    | locale por defecto |
| `defaultCurrency` | `string` | -        | -      | -       | max `3`     | moneda por defecto |
| `supportEmail`    | `email`  | -        | -      | -       | valid email | email de soporte   |
| `contactPhone`    | `string` | -        | -      | -       | max `20`    | telefono           |
| `bookingNotice`   | `string` | -        | -      | -       | max `1000`  | aviso operativo    |

Indexes: No adicionales. Se asume documento singleton para configuracion global.

### Collection: `audit_logs`

Purpose: auditoria interna para acciones relevantes.

| key           | type       | required | unique | default | constraints                | notes                        |
| ------------- | ---------- | -------- | ------ | ------- | -------------------------- | ---------------------------- |
| `actorUserId` | `string`   | -        | -      | -       | max `64`                   | actor                        |
| `actorRole`   | `enum`     | -        | -      | -       | `system,root,admin,client` | rol del actor                |
| `action`      | `string`   | -        | -      | -       | max `100`                  | accion                       |
| `targetType`  | `string`   | -        | -      | -       | max `60`                   | tipo de entidad              |
| `targetId`    | `string`   | -        | -      | -       | max `64`                   | entidad objetivo             |
| `summary`     | `string`   | -        | -      | -       | max `1000`                 | resumen                      |
| `metaJson`    | `string`   | -        | -      | -       | max `4000`                 | metadata serializada en JSON |
| `createdAt`   | `datetime` | -        | -      | -       | ISO 8601                   | timestamp                    |

Indexes:

| Index                   | Keys          | Sort | Notes               |
| ----------------------- | ------------- | ---- | ------------------- |
| `idx_audit_actor`       | `actorUserId` | `↑`  | timeline por actor  |
| `idx_audit_action`      | `action`      | `↑`  | filtro por accion   |
| `idx_audit_target_type` | `targetType`  | `↑`  | lookup por entidad  |
| `idx_audit_target_id`   | `targetId`    | `↑`  | lookup por registro |
| `idx_audit_created`     | `createdAt`   | `↓`  | auditoria reciente  |

## Notas de implementacion

- Todos los nombres deben respetar los limites documentados en `09_appwrite_platform_limits.md`.
- Las relaciones entre colecciones se modelan con IDs string (`*Id`) en esta version del MVP.
- La seguridad fina por rol se documenta en `05_permissions_and_roles.md`.
- El campo `customerUserId` fue renombrado a `clientUserId` en `orders` y `bookings` para consistencia con el rol `client`.
- `wellness_pkgs` fue renombrado a `wellness_packages` para claridad.
