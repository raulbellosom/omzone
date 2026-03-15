---
name: feature-page
description: 'Create a complete feature page with routing, layout, guards, SEO, i18n, and data fetching. USE FOR: new public pages, customer area pages, admin pages, booking/checkout flows. DO NOT USE FOR: individual UI components (use react-component), admin CRUD lists (use admin-crud).'
argument-hint: 'Describe the page: route, surface (public/customer/admin), data needs'
---

# Feature Page — OMZONE

## When to Use

- Create a new route/page for any surface (public, customer, admin)
- Add a new step to an existing flow (booking, checkout)
- Implement a detail or listing page with data fetching

## Procedure

### 1. Register the route constant

Add the route to `src/constants/routes.js`:

```js
// Static route
ADMIN_PASSES: '/app/passes',

// Dynamic route
CLASS_DETAIL: (slug) => `/classes/${slug}`,
```

### 2. Create the page component

| Surface | Path | Layout |
|---------|------|--------|
| Public | `src/pages/public/<Name>Page.jsx` | `PublicLayout` (Navbar + Footer) |
| Customer | `src/pages/customer/<Name>Page.jsx` | `CustomerLayout` (Navbar + SideNav + BottomNav) |
| Admin | `src/pages/admin/<Name>Page.jsx` | `AdminLayout` (AdminSidebar + AdminTopbar) |
| Booking | `src/pages/booking/<Name>Page.jsx` | `PublicLayout` |
| Checkout | `src/pages/checkout/<Name>Page.jsx` | `PublicLayout` |
| Auth | `src/pages/auth/<Name>Page.jsx` | `PublicLayout` |

### 3. Page structure pattern

```jsx
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useXxx } from '@/hooks/useXxx'
import { PageSkeleton } from './components/PageSkeleton'

export default function ExamplePage() {
  const { t } = useTranslation('<namespace>')
  const { data, isLoading } = useXxx()

  if (isLoading) return <PageSkeleton />

  return (
    <>
      <Helmet>
        <title>{t('page.title')} — Omzone</title>
        <meta name="description" content={t('page.description')} />
      </Helmet>

      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-6">
          {t('page.heading')}
        </h1>
        {/* Page content */}
      </section>
    </>
  )
}
```

### 4. Register in App.jsx router

```jsx
// Lazy import at top
const NewPage = lazy(() => import('@/pages/<surface>/NewPage'))

// Inside <Routes>
// Public:
<Route element={<PublicLayout />}>
  <Route path="new-route" element={<NewPage />} />
</Route>

// Customer (protected):
<Route element={<RequireAuth roles={['customer', 'admin', 'root']} />}>
  <Route element={<CustomerLayout />}>
    <Route path="account/new" element={<NewPage />} />
  </Route>
</Route>

// Admin (protected):
<Route element={<RequireAuth roles={['admin', 'root']} />}>
  <Route element={<AdminLayout />}>
    <Route path="app/new" element={<NewPage />} />
  </Route>
</Route>
```

### 5. Wire up data fetching

Create or extend a hook in `src/hooks/`:

```js
import { useQuery } from '@tanstack/react-query'
import { getXxx } from '@/services/mocks/xxxService.mock'

export function useXxx(options = {}) {
  return useQuery({
    queryKey: ['xxx', options],
    queryFn: () => getXxx(options),
  })
}
```

### 6. Add i18n keys

Add translation keys in `src/i18n/locales/es/<namespace>.json` and `en/<namespace>.json`.

### 7. Add navigation link (if applicable)

- Public: update `Navbar.jsx` nav links
- Customer: update `BottomNav.jsx` or `CustomerSideNav.jsx`
- Admin: update `AdminSidebar.jsx` nav items

## Guards Reference

| Surface | Guard | Roles |
|---------|-------|-------|
| Public | none | — |
| Customer | `RequireAuth` | `['customer', 'admin', 'root']` |
| Admin | `RequireAuth` | `['admin', 'root']` |

## Layout Containers

| Surface | Max width | Padding |
|---------|-----------|---------|
| Public | `max-w-6xl mx-auto px-4` | `py-8 md:py-12` |
| Customer | `max-w-5xl mx-auto px-4` | `py-6 md:py-8` |
| Admin | (fills `<main>`) | `p-4 md:p-6 lg:p-8` (from layout) |

## Checklist

1. Route constant in `routes.js`
2. Page component with lazy import
3. Route registered in `App.jsx` under correct layout + guard
4. SEO via `<Helmet>` with translated title + description
5. Data fetching via React Query hook
6. Loading state with `Skeleton` components
7. i18n keys for both `es` and `en`
8. Mobile-first responsive layout
9. Navigation entry added if the page is a main section
