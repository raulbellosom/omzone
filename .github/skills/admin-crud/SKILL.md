---
name: admin-crud
description: "Build admin panel CRUD pages with data tables, filters, form dialogs, toggle actions, and status badges. USE FOR: creating /app/* admin pages, building list+detail views for entities like classes, sessions, packages, products, leads, orders, bookings, clients, passes, content, settings. DO NOT USE FOR: public pages (use feature-page), UI primitives (use react-component)."
argument-hint: "Entity name and CRUD operations needed (list, create, edit, toggle, delete)"
---

# Admin CRUD — OMZONE

## When to Use

- Build any `/app/*` admin page
- Create a list view with table, filters, sorting
- Add create/edit dialogs for admin entities
- Implement toggle enable/disable, status changes, or bulk actions

## Current Phase

The project is in **Phase 4 — Panel admin (Frontend)**. All admin pages use mock data via `useAdmin*` hooks. The service layer follows the same mock → Appwrite migration pattern.

## Page Structure Pattern

```
src/
  pages/admin/
    <Entity>Page.jsx           ← main page (list view)
    components/
      <Entity>Table.jsx        ← table component
      <Entity>FormDialog.jsx   ← create/edit dialog
      <Entity>Filters.jsx      ← optional filter bar
```

### 1. Page Component

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminEntityList, useToggleEntity } from "@/hooks/useAdmin";
import EntityTable from "./components/EntityTable";
import EntityFormDialog from "./components/EntityFormDialog";

export default function EntityPage() {
  const { t } = useTranslation("admin");
  const { data: items, isLoading } = useAdminEntityList();
  const toggleMutation = useToggleEntity();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  function handleEdit(item) {
    setEditItem(item);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditItem(null);
    setDialogOpen(true);
  }

  return (
    <>
      <Helmet>
        <title>{t("entity.pageTitle")} — Admin Omzone</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-charcoal">
            {t("entity.title")}
          </h1>
          <p className="text-sm text-charcoal-muted mt-1">
            {t("entity.subtitle")}
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          {t("entity.addNew")}
        </Button>
      </div>

      {/* Table */}
      <EntityTable
        items={items ?? []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onToggle={(id, enabled) => toggleMutation.mutate({ id, enabled })}
      />

      {/* Form Dialog */}
      <EntityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editItem}
      />
    </>
  );
}
```

### 2. Data Table Pattern

```jsx
import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Radix switch
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EntityTable({ items, isLoading, onEdit, onToggle }) {
  const { t } = useTranslation("admin");

  if (isLoading) {
    return (
      <Card className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 mb-2" />
        ))}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-gray-dark/40 bg-warm-gray/50">
              <th className="text-left px-4 py-3 font-medium text-charcoal-muted">
                {t("fields.name")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-charcoal-muted">
                {t("fields.status")}
              </th>
              <th className="text-right px-4 py-3 font-medium text-charcoal-muted">
                {t("fields.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.$id}
                className="border-b border-warm-gray-dark/20 hover:bg-warm-gray/30 transition-colors"
              >
                <td className="px-4 py-3 text-charcoal">{item.name}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={item.enabled}
                    onCheckedChange={(v) => onToggle(item.$id, v)}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

### 3. Form Dialog Pattern

```jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EntityFormDialog({ open, onOpenChange, item }) {
  const { t } = useTranslation("admin");
  const isEditing = !!item;

  const [form, setForm] = useState({ name: "", slug: "" });

  useEffect(() => {
    if (item) setForm({ name: item.name, slug: item.slug });
    else setForm({ name: "", slug: "" });
  }, [item]);

  function handleSubmit(e) {
    e.preventDefault();
    // Call mutation then close
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("entity.editTitle") : t("entity.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("entity.editDescription")
              : t("entity.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("fields.name")}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit">
              {isEditing ? t("actions.save") : t("actions.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Admin Hook Pattern

Hooks live in `src/hooks/useAdmin.js`:

```js
export function useAdminEntityList() {
  return useQuery({
    queryKey: ["adminEntities"],
    queryFn: adminGetAllEntities,
  });
}

export function useToggleEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }) => adminToggleEntity(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminEntities"] }),
  });
}
```

## Status Badge Mapping

```jsx
const statusVariant = {
  active: 'success',
  scheduled: 'default',
  cancelled: 'danger',
  completed: 'sage',
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  expired: 'warm',
}

<Badge variant={statusVariant[item.status]}>{t(`status.${item.status}`)}</Badge>
```

## Admin Entities Reference

| Entity   | Route           | Collection          | Key fields                                   |
| -------- | --------------- | ------------------- | -------------------------------------------- |
| Leads    | `/app/leads`    | `contact_leads`     | fullName, email, interestType, status        |
| Clients  | `/app/clients`  | `users_profile`     | firstName, lastName, email, status           |
| Classes  | `/app/classes`  | `classes`           | titleEs/En, classTypeId, difficulty, enabled |
| Sessions | `/app/sessions` | `class_sessions`    | classId, sessionDate, status, capacityTotal  |
| Packages | `/app/packages` | `wellness_packages` | nameEs/En, price, classCredits, enabled      |
| Products | `/app/products` | `wellness_products` | nameEs/En, productType, price, enabled       |
| Orders   | `/app/orders`   | `orders`            | orderNo, paymentStatus, fulfillmentState     |
| Bookings | `/app/bookings` | `bookings`          | classId, sessionId, status                   |
| Passes   | `/app/passes`   | `access_passes`     | token, type, status, validUntil              |
| Content  | `/app/content`  | `site_content`      | sectionKey, contentEs/En                     |
| Settings | `/app/settings` | `app_settings`      | key, value                                   |

## Checklist

1. Page in `src/pages/admin/<Entity>Page.jsx`
2. Table component in `src/pages/admin/components/<Entity>Table.jsx`
3. Form dialog in `src/pages/admin/components/<Entity>FormDialog.jsx`
4. Hooks in `src/hooks/useAdmin.js` (query + mutations)
5. Mock service functions in `src/services/mocks/` (matching service)
6. Route in `App.jsx` under admin guard
7. Nav item in `AdminSidebar.jsx`
8. i18n keys in `admin.json` (es + en)
9. Loading skeleton state
10. Mobile-responsive table (overflow-x-auto)
