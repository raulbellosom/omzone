/**
 * AdminPackagesPage — gestión de paquetes.
 * Ruta: /app/packages
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAdminPackages,
  useTogglePackage,
  useCreatePackage,
  useUpdatePackage,
} from "@/hooks/useAdmin";
import { resolveField } from "@/lib/i18n-data";
import { useCurrency } from "@/hooks/useCurrency";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import AdminFormDialog from "@/components/admin/AdminFormDialog";

const EMPTY_FORM = {
  name_es: "",
  name_en: "",
  description_es: "",
  description_en: "",
  price: 0,
  is_featured: false,
  enabled: true,
};

function Toggle({ enabled, onChange, loading }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0 ${enabled ? "bg-sage" : "bg-warm-gray-dark/40"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function AdminPackagesPage() {
  const { t } = useTranslation("admin");
  const { formatPrice, currency } = useCurrency();
  const [pendingId, setPendingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: packages, isLoading } = useAdminPackages();
  const togglePackage = useTogglePackage();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }
  function openEdit(pkg) {
    setEditing(pkg);
    setForm({
      name_es: pkg.name_es ?? "",
      name_en: pkg.name_en ?? "",
      description_es: pkg.description_es ?? "",
      description_en: pkg.description_en ?? "",
      price: pkg.price ?? 0,
      is_featured: pkg.is_featured ?? false,
      enabled: pkg.enabled ?? true,
    });
    setDialogOpen(true);
  }
  function handleSubmit() {
    const mut = editing ? updatePackage : createPackage;
    const payload = editing
      ? { packageId: editing.$id, data: { ...form, price: Number(form.price) } }
      : { ...form, price: Number(form.price) };
    mut.mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false);
        toast.success(editing ? "Paquete actualizado" : "Paquete creado");
      },
      onError: () => toast.error("Error al guardar"),
    });
  }

  function handleToggle(pkg) {
    setPendingId(pkg.$id);
    togglePackage.mutate(
      { packageId: pkg.$id, enabled: !pkg.enabled },
      {
        onSuccess: () => {
          setPendingId(null);
          toast.success(
            pkg.enabled ? "Paquete deshabilitado" : "Paquete habilitado",
          );
        },
        onError: () => {
          setPendingId(null);
          toast.error("Error al actualizar");
        },
      },
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t("packages.title")}
        subtitle={t("packages.subtitle")}
        action={
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="w-4 h-4" />
            {t("packages.newPackage", "Nuevo Paquete")}
          </Button>
        }
      />
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {packages?.map((pkg, idx) => (
            <Card
              key={pkg.$id}
              className={`animate-fade-in-up transition-opacity ${!pkg.enabled ? "opacity-60" : ""}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-charcoal leading-tight">
                    {resolveField(pkg, "name")}
                  </p>
                  {pkg.is_featured && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-amber-400 text-amber-500 shrink-0"
                    >
                      ★ Destacado
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-display font-bold text-sage mb-3">
                  {formatPrice(pkg.price)}
                </p>
                {pkg.items_json?.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {pkg.items_json.map((item, i) => (
                      <li
                        key={i}
                        className="text-xs text-charcoal-muted flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-olive shrink-0" />
                        {resolveField(item, "label")}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-warm-gray-dark/20">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1.5 text-charcoal-subtle hover:text-charcoal text-xs"
                    onClick={() => openEdit(pkg)}
                  >
                    <Pencil className="w-3 h-3" />
                    {t("common.edit", "Editar")}
                  </Button>
                  <Toggle
                    enabled={pkg.enabled}
                    onChange={() => handleToggle(pkg)}
                    loading={pendingId === pkg.$id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AdminFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          editing
            ? t("packages.editPackage", "Editar Paquete")
            : t("packages.newPackage", "Nuevo Paquete")
        }
        onSubmit={handleSubmit}
        isSubmitting={createPackage.isPending || updatePackage.isPending}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>{t("packages.fields.nameEs", "Nombre ES")}</Label>
            <Input
              value={form.name_es}
              onChange={(e) =>
                setForm((f) => ({ ...f, name_es: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <Label>{t("packages.fields.nameEn", "Nombre EN")}</Label>
            <Input
              value={form.name_en}
              onChange={(e) =>
                setForm((f) => ({ ...f, name_en: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>
              {t("packages.fields.descriptionEs", "Descripción ES")}
            </Label>
            <Input
              value={form.description_es}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_es: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>
              {t("packages.fields.descriptionEn", "Descripción EN")}
            </Label>
            <Input
              value={form.description_en}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_en: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>{t("packages.fields.price", "Precio")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-charcoal-muted select-none pointer-events-none z-10">
                {currency}
              </span>
              <Input
                type="number"
                min="0"
                step="50"
                className="pl-12"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-5">
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_featured: e.target.checked }))
                }
                className="accent-sage"
              />
              {t("packages.fields.featured", "Destacado")}
            </label>
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, enabled: e.target.checked }))
                }
                className="accent-sage"
              />
              {t("common.enabled", "Activo")}
            </label>
          </div>
        </div>
      </AdminFormDialog>
    </div>
  );
}
