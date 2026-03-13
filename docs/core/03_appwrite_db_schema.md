# 03_APPWRITE_DB_SCHEMA - YWK APPWRITE 1.8.1 CANON

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

| Collection ID       | Purpose                                   | Row security |
| ------------------- | ----------------------------------------- | ------------ |
| `users_profile`     | perfil extendido por usuario Appwrite     | off          |
| `contact_leads`     | prospectos desde landing o formularios    | off          |
| `instructors`       | instructores como entidad de contenido    | off          |
| `class_types`       | categorias de clases                      | off          |
| `classes`           | ficha principal de clase                  | off          |
| `class_sessions`    | sesiones reservables                      | off          |
| `membership_plans`  | planes de suscripcion                     | off          |
| `wellness_products` | productos o extras wellness kitchen       | off          |
| `wellness_pkgs`     | paquetes combinados                       | off          |
| `orders`            | pedido o venta principal                  | off          |
| `order_items`       | renglones del pedido                      | off          |
| `bookings`          | reservas de clases                        | off          |
| `memberships`       | membresias compradas                      | off          |
| `promo_codes`       | descuentos opcionales                     | off          |
| `site_content`      | contenido editable de landing y secciones | off          |
| `audit_logs`        | auditoria interna                         | off          |
| `app_settings`      | configuracion global                      | off          |

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

| key         | type      | required | unique | default | constraints               | notes                   |
| ----------- | --------- | -------- | ------ | ------- | ------------------------- | ----------------------- |
| `userId`    | `string`  | yes      | yes    | -       | max `64`                  | ID del usuario Appwrite |
| `roleKey`   | `enum`    | -        | -      | -       | `root,admin,customer`     | rol operativo           |
| `firstName` | `string`  | -        | -      | -       | max `80`                  | nombre                  |
| `lastName`  | `string`  | -        | -      | -       | max `80`                  | apellido                |
| `email`     | `email`   | -        | yes    | -       | valid email               | email del perfil        |
| `phone`     | `string`  | -        | -      | -       | max `20`                  | telefono                |
| `avatarId`  | `string`  | -        | -      | -       | max `64`                  | referencia a storage    |
| `status`    | `enum`    | -        | -      | -       | `active,inactive,blocked` | estado de cuenta        |
| `locale`    | `string`  | -        | -      | `es-MX` | max `10`                  | locale base             |
| `enabled`   | `boolean` | -        | -      | `true`  | -                         | soft enable             |

Indexes:

| Index                | Keys      | Sort | Notes             |
| -------------------- | --------- | ---- | ----------------- |
| `uq_profile_user`    | `userId`  | `↑`  | unique            |
| `uq_profile_email`   | `email`   | `↑`  | unique            |
| `idx_profile_role`   | `roleKey` | `↑`  | lookup por rol    |
| `idx_profile_status` | `status`  | `↑`  | lookup por estado |

### Collection: `contact_leads`

Purpose: prospectos capturados desde formularios publicos.

| key            | type     | required | unique | default | constraints                        | notes             |
| -------------- | -------- | -------- | ------ | ------- | ---------------------------------- | ----------------- |
| `fullName`     | `string` | -        | -      | -       | max `120`                          | nombre completo   |
| `email`        | `email`  | -        | -      | -       | valid email                        | contacto          |
| `phone`        | `string` | -        | -      | -       | max `20`                           | contacto          |
| `interestType` | `enum`   | -        | -      | -       | `class,membership,package,product` | interes principal |
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
| `status`        | `enum`     | -        | -      | -       | `scheduled,full,cancelled,completed` | estado de sesion  |
| `locationLabel` | `string`   | -        | -      | -       | max `120`                            | sede o ubicacion  |
| `enabled`       | `boolean`  | -        | -      | -       | -                                    | estado            |

Indexes:

| Index              | Keys          | Sort | Notes               |
| ------------------ | ------------- | ---- | ------------------- |
| `idx_sess_class`   | `classId`     | `↑`  | agenda por clase    |
| `idx_sess_date`    | `sessionDate` | `↑`  | listado cronologico |
| `idx_sess_status`  | `status`      | `↑`  | disponibilidad      |
| `idx_sess_enabled` | `enabled`     | `↑`  | filtro publico      |

### Collection: `membership_plans`

Purpose: planes de membresia comercializables.

| key               | type      | required | unique | default | constraints         | notes                            |
| ----------------- | --------- | -------- | ------ | ------- | ------------------- | -------------------------------- |
| `slug`            | `string`  | -        | yes    | -       | max `100`           | slug publico                     |
| `nameEs`          | `string`  | -        | -      | -       | max `120`           | nombre ES                        |
| `nameEn`          | `string`  | -        | -      | -       | max `120`           | nombre EN                        |
| `descriptionEs`   | `string`  | -        | -      | -       | max `2500`          | descripcion ES                   |
| `descriptionEn`   | `string`  | -        | -      | -       | max `2500`          | descripcion EN                   |
| `billingPeriod`   | `enum`    | -        | -      | -       | `monthly,quarterly` | ciclo de cobro                   |
| `price`           | `float`   | -        | -      | -       | -                   | precio                           |
| `classesPerCycle` | `integer` | -        | -      | -       | nullable            | cupo por ciclo                   |
| `isUnlimited`     | `boolean` | -        | -      | -       | -                   | uso ilimitado                    |
| `includesJson`    | `string`  | -        | -      | -       | max `4000`          | inclusiones serializadas en JSON |
| `enabled`         | `boolean` | -        | -      | -       | -                   | estado                           |
| `isFeatured`      | `boolean` | -        | -      | -       | -                   | destacado                        |

Indexes:

| Index                | Keys            | Sort | Notes              |
| -------------------- | --------------- | ---- | ------------------ |
| `uq_mplans_slug`     | `slug`          | `↑`  | unique route key   |
| `idx_mplans_period`  | `billingPeriod` | `↑`  | filtro por periodo |
| `idx_mplans_feat`    | `isFeatured`    | `↑`  | destacados         |
| `idx_mplans_enabled` | `enabled`       | `↑`  | filtro publico     |

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

### Collection: `wellness_pkgs`

Purpose: paquetes que combinan productos o servicios wellness.

| key             | type      | required | unique | default | constraints | notes                                       |
| --------------- | --------- | -------- | ------ | ------- | ----------- | ------------------------------------------- |
| `slug`          | `string`  | -        | yes    | -       | max `100`   | slug publico                                |
| `nameEs`        | `string`  | -        | -      | -       | max `120`   | nombre ES                                   |
| `nameEn`        | `string`  | -        | -      | -       | max `120`   | nombre EN                                   |
| `descriptionEs` | `string`  | -        | -      | -       | max `3000`  | descripcion ES                              |
| `descriptionEn` | `string`  | -        | -      | -       | max `3000`  | descripcion EN                              |
| `price`         | `float`   | -        | -      | -       | -           | precio                                      |
| `itemsJson`     | `string`  | -        | -      | -       | max `6000`  | composicion del paquete serializada en JSON |
| `enabled`       | `boolean` | -        | -      | -       | -           | estado                                      |
| `isFeatured`    | `boolean` | -        | -      | -       | -           | destacado                                   |

Indexes:

| Index              | Keys         | Sort | Notes            |
| ------------------ | ------------ | ---- | ---------------- |
| `uq_wpkg_slug`     | `slug`       | `↑`  | unique route key |
| `idx_wpkg_feat`    | `isFeatured` | `↑`  | destacados       |
| `idx_wpkg_enabled` | `enabled`    | `↑`  | filtro publico   |

### Collection: `orders`

Purpose: documento principal de compra.

| key                | type       | required | unique | default | constraints                                   | notes                |
| ------------------ | ---------- | -------- | ------ | ------- | --------------------------------------------- | -------------------- |
| `orderNo`          | `string`   | -        | yes    | -       | max `40`                                      | folio de orden       |
| `customerUserId`   | `string`   | -        | -      | -       | max `64`                                      | cliente              |
| `customerEmail`    | `email`    | -        | -      | -       | valid email                                   | snapshot de contacto |
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

| Index                 | Keys               | Sort | Notes                  |
| --------------------- | ------------------ | ---- | ---------------------- |
| `uq_orders_no`        | `orderNo`          | `↑`  | unique order lookup    |
| `idx_orders_customer` | `customerUserId`   | `↑`  | historial de cliente   |
| `idx_orders_pay`      | `paymentStatus`    | `↑`  | operaciones de pago    |
| `idx_orders_state`    | `fulfillmentState` | `↑`  | operaciones de entrega |
| `idx_orders_paid`     | `paidAt`           | `↓`  | orden reciente pagada  |

### Collection: `order_items`

Purpose: detalle de items asociados a una orden.

| key             | type      | required | unique | default | constraints                                      | notes                                  |
| --------------- | --------- | -------- | ------ | ------- | ------------------------------------------------ | -------------------------------------- |
| `orderId`       | `string`  | -        | -      | -       | max `64`                                         | FK logica                              |
| `itemType`      | `enum`    | -        | -      | -       | `class_session,membership,package,product,addon` | tipo de renglon                        |
| `referenceId`   | `string`  | -        | -      | -       | max `64`                                         | referencia al item                     |
| `titleSnapshot` | `string`  | -        | -      | -       | max `160`                                        | titulo congelado                       |
| `quantity`      | `integer` | -        | -      | -       | -                                                | cantidad                               |
| `unitPrice`     | `float`   | -        | -      | -       | -                                                | precio unitario                        |
| `lineTotal`     | `float`   | -        | -      | -       | -                                                | total del renglon                      |
| `metaJson`      | `string`  | -        | -      | -       | max `2000`                                       | metadata adicional serializada en JSON |

Indexes:

| Index              | Keys          | Sort | Notes               |
| ------------------ | ------------- | ---- | ------------------- |
| `idx_oitems_order` | `orderId`     | `↑`  | renglones por orden |
| `idx_oitems_ref`   | `referenceId` | `↑`  | lookup reverso      |
| `idx_oitems_type`  | `itemType`    | `↑`  | analitica por tipo  |

### Collection: `bookings`

Purpose: reservas del cliente para clases o sesiones.

| key              | type       | required | unique | default | constraints                                                 | notes                       |
| ---------------- | ---------- | -------- | ------ | ------- | ----------------------------------------------------------- | --------------------------- |
| `customerUserId` | `string`   | -        | -      | -       | max `64`                                                    | cliente                     |
| `sessionId`      | `string`   | -        | -      | -       | max `64`                                                    | sesion reservada            |
| `orderId`        | `string`   | -        | -      | -       | max `64`                                                    | orden origen                |
| `bookingCode`    | `string`   | -        | yes    | -       | max `40`                                                    | codigo de reserva           |
| `status`         | `enum`     | -        | -      | -       | `pending,confirmed,cancelled,completed,no_show,rescheduled` | estado                      |
| `unitPrice`      | `float`    | -        | -      | -       | -                                                           | precio unitario             |
| `extrasJson`     | `string`   | -        | -      | -       | max `2000`                                                  | extras serializados en JSON |
| `reservedAt`     | `datetime` | -        | -      | -       | ISO 8601                                                    | fecha de reserva            |

Indexes:

| Index                   | Keys             | Sort | Notes                 |
| ----------------------- | ---------------- | ---- | --------------------- |
| `uq_bookings_code`      | `bookingCode`    | `↑`  | unique booking lookup |
| `idx_bookings_customer` | `customerUserId` | `↑`  | agenda del cliente    |
| `idx_bookings_session`  | `sessionId`      | `↑`  | roster por sesion     |
| `idx_bookings_order`    | `orderId`        | `↑`  | linkage con orden     |
| `idx_bookings_status`   | `status`         | `↑`  | operacion de reservas |

### Collection: `memberships`

Purpose: membresias activas o historicas por cliente.

| key              | type       | required | unique | default | constraints                               | notes                 |
| ---------------- | ---------- | -------- | ------ | ------- | ----------------------------------------- | --------------------- |
| `customerUserId` | `string`   | -        | -      | -       | max `64`                                  | cliente               |
| `planId`         | `string`   | -        | -      | -       | max `64`                                  | plan                  |
| `orderId`        | `string`   | -        | -      | -       | max `64`                                  | orden origen          |
| `status`         | `enum`     | -        | -      | -       | `active,paused,cancelled,expired,pending` | estado                |
| `startedAt`      | `datetime` | -        | -      | -       | ISO 8601                                  | inicio                |
| `endsAt`         | `datetime` | -        | -      | -       | ISO 8601                                  | fin                   |
| `renewalAt`      | `datetime` | -        | -      | -       | ISO 8601                                  | renovacion            |
| `classesUsed`    | `integer`  | -        | -      | -       | -                                         | clases consumidas     |
| `classesAllowed` | `integer`  | -        | -      | -       | -                                         | clases permitidas     |
| `isUnlimited`    | `boolean`  | -        | -      | -       | -                                         | consumo ilimitado     |
| `cancelReason`   | `string`   | -        | -      | -       | max `1000`                                | motivo de cancelacion |

Indexes:

| Index                 | Keys             | Sort | Notes                  |
| --------------------- | ---------------- | ---- | ---------------------- |
| `idx_mships_customer` | `customerUserId` | `↑`  | membresias por cliente |
| `idx_mships_plan`     | `planId`         | `↑`  | reporte por plan       |
| `idx_mships_order`    | `orderId`        | `↑`  | linkage con compra     |
| `idx_mships_status`   | `status`         | `↑`  | lifecycle ops          |
| `idx_mships_renewal`  | `renewalAt`      | `↑`  | renovaciones           |

### Collection: `promo_codes`

Purpose: codigos promocionales y descuentos.

| key             | type       | required | unique | default | constraints     | notes              |
| --------------- | ---------- | -------- | ------ | ------- | --------------- | ------------------ |
| `code`          | `string`   | -        | yes    | -       | max `40`        | codigo             |
| `discountType`  | `enum`     | -        | -      | -       | `percent,fixed` | forma de descuento |
| `discountValue` | `float`    | -        | -      | -       | -               | valor              |
| `startsAt`      | `datetime` | -        | -      | -       | ISO 8601        | inicio             |
| `endsAt`        | `datetime` | -        | -      | -       | ISO 8601        | fin                |
| `usageLimit`    | `integer`  | -        | -      | -       | -               | limite de uso      |
| `usedCount`     | `integer`  | -        | -      | -       | -               | usos acumulados    |
| `enabled`       | `boolean`  | -        | -      | -       | -               | estado             |

Indexes:

| Index               | Keys           | Sort | Notes               |
| ------------------- | -------------- | ---- | ------------------- |
| `uq_promo_code`     | `code`         | `↑`  | unique code lookup  |
| `idx_promo_type`    | `discountType` | `↑`  | analitica           |
| `idx_promo_start`   | `startsAt`     | `↑`  | ventana de vigencia |
| `idx_promo_end`     | `endsAt`       | `↑`  | expiracion          |
| `idx_promo_enabled` | `enabled`      | `↑`  | filtros activos     |

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

Indexes:

No additional indexes documentados. Se asume un documento singleton para configuracion global.

### Collection: `audit_logs`

Purpose: auditoria interna para acciones relevantes.

| key           | type       | required | unique | default | constraints                  | notes                        |
| ------------- | ---------- | -------- | ------ | ------- | ---------------------------- | ---------------------------- |
| `actorUserId` | `string`   | -        | -      | -       | max `64`                     | actor                        |
| `actorRole`   | `enum`     | -        | -      | -       | `system,root,admin,customer` | rol del actor                |
| `action`      | `string`   | -        | -      | -       | max `100`                    | accion                       |
| `targetType`  | `string`   | -        | -      | -       | max `60`                     | tipo de entidad              |
| `targetId`    | `string`   | -        | -      | -       | max `64`                     | entidad objetivo             |
| `summary`     | `string`   | -        | -      | -       | max `1000`                   | resumen                      |
| `metaJson`    | `string`   | -        | -      | -       | max `4000`                   | metadata serializada en JSON |
| `createdAt`   | `datetime` | -        | -      | -       | ISO 8601                     | timestamp                    |

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
