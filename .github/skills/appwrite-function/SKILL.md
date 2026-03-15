---
name: appwrite-function
description: "Create Appwrite Cloud Functions for OMZONE. USE FOR: building server-side logic for checkout, bookings, admin CRUD operations, cron jobs, webhook handlers, lead submission, client dashboard, QR pass validation. Covers role verification, input validation, idempotency, audit logging, and Appwrite Node.js SDK patterns. DO NOT USE FOR: frontend code (use feature-page), schema changes (use appwrite-schema)."
argument-hint: "Function name and purpose (e.g., create-booking, admin-upsert-class)"
---

# Appwrite Function — OMZONE

## When to Use

- Implement any server-side operation from the Functions catalog
- Handle payment webhooks (Stripe, PayPal)
- Build admin CRUD operations that write to protected collections
- Create cron jobs for expiration, cleanup, analytics
- Any operation the frontend cannot do directly

## Project Context

- **Appwrite 1.8.x** self-hosted at `https://appwrite.racoondevs.com`
- **Node.js** runtime for all functions
- Functions source: `appwrite/functions/<function-id>/`
- Database ID: `main`
- Naming: collection/bucket IDs in `snake_case`, attributes in `camelCase`

## Function Categories

| Surface     | Auth                                    | Examples                                           |
| ----------- | --------------------------------------- | -------------------------------------------------- |
| public      | none (validate input strictly)          | `submit-lead`, `get-public-catalog`                |
| semi-public | token/webhook signature                 | `create-checkout-order`, `confirm-stripe-checkout` |
| client      | Appwrite session + label `client`       | `create-booking`, `get-client-dashboard`           |
| admin       | Appwrite session + label `admin`/`root` | `admin-upsert-class`, `admin-dashboard-metrics`    |
| cron        | internal/scheduler (no user)            | `cron-expire-client-packages`                      |

## File Structure

```
appwrite/functions/<function-id>/
├── src/
│   └── main.js          # entry point
├── package.json
└── .gitignore
```

## Function Template

```js
import { Client, Databases, Users, Query } from "node-appwrite";

const DB = "main";

export default async ({ req, res, log, error }) => {
  // 1. Init SDK
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"] ?? "");

  const db = new Databases(client);

  // 2. Verify role (skip for public/cron)
  const userId = req.headers["x-appwrite-user-id"];
  const jwt = req.headers["x-appwrite-user-jwt"];
  if (!userId) {
    return res.json({ ok: false, message: "Unauthorized" }, 401);
  }

  // For admin functions — verify label
  const users = new Users(client);
  const user = await users.get(userId);
  if (!user.labels.includes("admin") && !user.labels.includes("root")) {
    return res.json({ ok: false, message: "Forbidden" }, 403);
  }

  // 3. Parse & validate input
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  if (!body.classId) {
    return res.json({ ok: false, message: "classId required" }, 400);
  }

  // 4. Business logic
  try {
    const result = await db.createDocument(DB, "collection_id", "unique()", {
      // fields
    });

    // 5. Audit log
    await db.createDocument(DB, "audit_logs", "unique()", {
      actorId: userId,
      action: "function-name",
      targetType: "collection",
      targetId: result.$id,
      details: JSON.stringify({
        /* summary */
      }),
    });

    return res.json({ ok: true, data: result });
  } catch (err) {
    error(`Function error: ${err.message}`);
    return res.json({ ok: false, message: "Internal error" }, 500);
  }
};
```

## Role Verification Patterns

```js
// Public function — no auth needed, strict input validation
if (req.method !== "POST")
  return res.json({ error: "Method not allowed" }, 405);

// Client function — verify identity + ownership
const userId = req.headers["x-appwrite-user-id"];
if (!userId) return res.json({ ok: false, message: "Unauthorized" }, 401);
// Verify the booking belongs to this user
const booking = await db.getDocument(DB, "bookings", bookingId);
if (booking.clientUserId !== userId) {
  return res.json({ ok: false, message: "Forbidden" }, 403);
}

// Admin function — verify admin/root label
const user = await users.get(userId);
const isAdmin = user.labels.includes("admin") || user.labels.includes("root");
if (!isAdmin) return res.json({ ok: false, message: "Forbidden" }, 403);

// Webhook — verify signature
import Stripe from "stripe";
const sig = req.headers["stripe-signature"];
const event = stripe.webhooks.constructEvent(req.bodyRaw, sig, endpointSecret);
```

## Collections Reference (protected, write only via Functions)

`orders`, `order_items`, `payments`, `bookings`, `client_packages`, `package_usages`, `access_passes`, `audit_logs`

## Idempotency Pattern

```js
// Check if order already processed
const existing = await db.listDocuments(DB, "payments", [
  Query.equal("externalReference", [stripeSessionId]),
]);
if (existing.total > 0) {
  log("Payment already processed, skipping");
  return res.json({ ok: true, message: "Already processed" });
}
```

## Functions Catalog

See `docs/core/06_appwrite_functions_catalog.md` for the complete list of 25+ functions with their surfaces, purposes, and affected collections.

## Deployment

```bash
# From repo root
appwrite push functions
```

## Checklist

1. Create `appwrite/functions/<function-id>/` directory
2. Add `src/main.js` with proper entry point signature
3. Add `package.json` with `node-appwrite` dependency
4. Verify role/auth per function surface
5. Validate all input before processing
6. Make fulfillment operations idempotent
7. Log significant actions to `audit_logs`
8. Never expose internal errors to the caller
9. Register function in `appwrite.config.json` (via CLI)
10. Test locally before push
