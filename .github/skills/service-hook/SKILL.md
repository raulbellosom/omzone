---
name: service-hook
description: "Create service adapters and React Query hooks for data fetching. USE FOR: adding new mock service functions, creating TanStack Query hooks (useQuery/useMutation), building the mock-to-Appwrite migration layer, adding new data endpoints. DO NOT USE FOR: UI components (use react-component), full pages (use feature-page)."
argument-hint: "Describe the data: entity name, operations needed (list, get, create, update, toggle)"
---

# Service + Hook Layer — OMZONE

## When to Use

- Add a new data endpoint (query or mutation)
- Create a mock service function for a new entity
- Build a React Query hook for a page or feature
- Prepare migration from mock to Appwrite SDK

## Architecture Overview

```
Page / Component
  └── Hook (src/hooks/useXxx.js)
       └── Service adapter (src/services/mocks/xxxService.mock.js)
            └── Mock data (inline or from docs/mock-data/)

# Future (Appwrite real):
Page / Component
  └── Hook (src/hooks/useXxx.js)          ← same hooks, unchanged
       └── Service adapter (src/services/api/xxxService.js)
            └── Appwrite SDK / Functions
```

Hooks never change when switching from mock to real — only the service import path changes.

## Mock Service Pattern

Location: `src/services/mocks/<domain>Service.mock.js`

Existing services:

- `catalogService.mock.js` — classes, sessions, instructors, class types
- `membershipService.mock.js` — membership plans
- `wellnessService.mock.js` — wellness products, packages, class extras
- `commerceService.mock.js` — orders, bookings, checkout
- `userService.mock.js` — auth, profiles, roles
- `cmsService.mock.js` — site content
- `leadService.mock.js` — contact leads

```js
/**
 * entityService.mock.js
 * Adapter for <Entity>.
 * In production: replace with Appwrite SDK calls.
 */
import { delay } from "./_delay";

// ── Mock data ────────────────────────────────────────────────────────────────

const items = [
  {
    $id: "entity_1",
    slug: "example",
    nameEs: "Ejemplo",
    nameEn: "Example",
    enabled: true,
  },
];

// ── Public API ───────────────────────────────────────────────────────────────

export async function getEntities({ featuredOnly } = {}) {
  await delay();
  let result = items.filter((i) => i.enabled);
  if (featuredOnly) result = result.filter((i) => i.isFeatured);
  return result;
}

export async function getEntityBySlug(slug) {
  await delay();
  const item = items.find((i) => i.slug === slug && i.enabled);
  if (!item) throw new Error("Entity not found");
  return item;
}

export async function getEntityById(id) {
  await delay();
  const item = items.find((i) => i.$id === id);
  if (!item) throw new Error("Entity not found");
  return item;
}

// ── Admin API ────────────────────────────────────────────────────────────────

export async function adminGetAllEntities() {
  await delay();
  return [...items]; // return all, including disabled
}

export async function adminToggleEntity(id, enabled) {
  await delay(400);
  const item = items.find((i) => i.$id === id);
  if (!item) throw new Error("Entity not found");
  item.enabled = enabled;
  return { ...item };
}

export async function adminUpsertEntity(data) {
  await delay(600);
  if (data.$id) {
    // Update
    const idx = items.findIndex((i) => i.$id === data.$id);
    if (idx === -1) throw new Error("Entity not found");
    Object.assign(items[idx], data);
    return { ...items[idx] };
  }
  // Create
  const newItem = { $id: `entity_${Date.now()}`, ...data };
  items.push(newItem);
  return { ...newItem };
}
```

## Delay Helper

All mocks use `src/services/mocks/_delay.js`:

```js
export const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));
```

## React Query Hook Patterns

Location: `src/hooks/useXxx.js`

### Query (read)

```js
import { useQuery } from "@tanstack/react-query";
import {
  getEntities,
  getEntityBySlug,
} from "@/services/mocks/entityService.mock";

export function useEntities(options = {}) {
  return useQuery({
    queryKey: ["entities", options],
    queryFn: () => getEntities(options),
  });
}

export function useEntityBySlug(slug) {
  return useQuery({
    queryKey: ["entity", slug],
    queryFn: () => getEntityBySlug(slug),
    enabled: !!slug,
  });
}
```

### Mutation (write)

```js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminToggleEntity,
  adminUpsertEntity,
} from "@/services/mocks/entityService.mock";

export function useToggleEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }) => adminToggleEntity(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminEntities"] }),
  });
}

export function useUpsertEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminUpsertEntity(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminEntities"] }),
  });
}
```

### Auth-dependent query

```js
import { useAuth } from "@/hooks/useAuth.jsx";

export function useMyEntities() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myEntities", user?.$id],
    queryFn: () => getEntitiesByUser(user.$id),
    enabled: !!user,
  });
}
```

## QueryClient Config

Defined in `src/main.jsx`:

```js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
});
```

## Migration to Appwrite (Future)

When replacing mocks with real Appwrite SDK:

1. Create `src/services/api/entityService.js` with identical function signatures.
2. Use `Databases.listDocuments()` / `Databases.getDocument()` instead of in-memory arrays.
3. Change the import path in the hook file from `mocks/` to `api/`.
4. The hooks, pages, and components remain unchanged.

```js
// src/services/api/entityService.js (future)
import { databases, DB_ID } from "@/services/appwrite/client";
import { Query } from "appwrite";

export async function getEntities({ featuredOnly } = {}) {
  const queries = [Query.equal("enabled", true)];
  if (featuredOnly) queries.push(Query.equal("isFeatured", true));
  const { documents } = await databases.listDocuments(
    DB_ID,
    "entities",
    queries,
  );
  return documents;
}
```

## Checklist

1. Mock service in `src/services/mocks/<domain>Service.mock.js`
2. Uses `delay()` for realistic latency simulation
3. Functions are `async` and return plain objects (not Appwrite SDK types)
4. Mock IDs prefixed with entity name: `entity_xxx`
5. `$id` and `$createdAt` fields mimic Appwrite document shape
6. Hook in `src/hooks/useXxx.js`
7. `queryKey` is descriptive and unique
8. `enabled` guard for conditional queries
9. Mutations invalidate related query keys on success
10. Auth-dependent hooks read from `useAuth()` context
