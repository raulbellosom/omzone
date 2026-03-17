/**
 * AdminProductsPage — Wellness Kitchen: gestión de productos.
 * Ruta: /app/products
 */
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Leaf } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAdminProducts,
  useToggleProduct,
  useCreateProduct,
  useUpdateProduct,
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
  product_type: "snack",
  price: 0,
  is_addon_only: false,
  is_featured: false,
  enabled: true,
};

const ALL_TYPES = ["all", "smoothie", "snack", "supplement", "plan", "addon"];

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

export default function AdminProductsPage() {
  const { t } = useTranslation("admin");
  const { formatPrice, currency } = useCurrency();
  const [activeType, setActiveType] = useState("all");
  const [pendingId, setPendingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: products, isLoading } = useAdminProducts();
  const toggleProduct = useToggleProduct();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }
  function openEdit(p) {
    setEditing(p);
    setForm({
      name_es: p.name_es ?? "",
      name_en: p.name_en ?? "",
      description_es: p.description_es ?? "",
      description_en: p.description_en ?? "",
      product_type: p.product_type ?? "snack",
      price: p.price ?? 0,
      is_addon_only: p.is_addon_only ?? false,
      is_featured: p.is_featured ?? false,
      enabled: p.enabled ?? true,
    });
    setDialogOpen(true);
  }
  function handleSubmit() {
    const mut = editing ? updateProduct : createProduct;
    const payload = editing
      ? { productId: editing.$id, data: { ...form, price: Number(form.price) } }
      : { ...form, price: Number(form.price) };
    mut.mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false);
        toast.success(editing ? "Producto actualizado" : "Producto creado");
      },
      onError: () => toast.error("Error al guardar"),
    });
  }

  const filtered = useMemo(() => {
    if (!products) return [];
    if (activeType === "all") return products;
    return products.filter((p) => p.product_type === activeType);
  }, [products, activeType]);

  function handleToggle(product) {
    setPendingId(product.$id);
    toggleProduct.mutate(
      { productId: product.$id, enabled: !product.enabled },
      {
        onSuccess: () => {
          setPendingId(null);
          toast.success(
            product.enabled ? "Producto deshabilitado" : "Producto habilitado",
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
        title={t("products.title")}
        subtitle={t("products.subtitle")}
        action={
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="w-4 h-4" />
            {t("products.newProduct", "Nuevo Producto")}
          </Button>
        }
      />

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
              activeType === type
                ? "bg-sage text-white"
                : "bg-white border border-warm-gray-dark/40 text-charcoal hover:border-sage/50"
            }`}
          >
            {t(`products.types.${type}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((product, idx) => (
            <Card
              key={product.$id}
              className={`animate-fade-in-up transition-opacity ${!product.enabled ? "opacity-60" : ""}`}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-charcoal text-sm">
                      {resolveField(product, "name")}
                    </p>
                    {product.is_featured && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-amber-400 text-amber-500"
                      >
                        ★
                      </Badge>
                    )}
                    {product.is_addon_only && (
                      <Badge variant="outline" className="text-[10px]">
                        Add-on
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                    <Badge variant="default" className="text-[10px]">
                      {t(`products.types.${product.product_type}`)}
                    </Badge>
                    <span>{formatPrice(product.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-charcoal-subtle hover:text-charcoal"
                    onClick={() => openEdit(product)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Toggle
                    enabled={product.enabled}
                    onChange={() => handleToggle(product)}
                    loading={pendingId === product.$id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <Leaf className="w-10 h-10 text-charcoal-subtle mx-auto mb-3" />
            <p className="text-sm text-charcoal-muted">{t("common.noData")}</p>
          </CardContent>
        </Card>
      )}

      <AdminFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          editing
            ? t("products.editProduct", "Editar Producto")
            : t("products.newProduct", "Nuevo Producto")
        }
        onSubmit={handleSubmit}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>{t("products.fields.nameEs", "Nombre ES")}</Label>
            <Input
              value={form.name_es}
              onChange={(e) =>
                setForm((f) => ({ ...f, name_es: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <Label>{t("products.fields.nameEn", "Nombre EN")}</Label>
            <Input
              value={form.name_en}
              onChange={(e) =>
                setForm((f) => ({ ...f, name_en: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>
              {t("products.fields.descriptionEs", "Descripción ES")}
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
              {t("products.fields.descriptionEn", "Descripción EN")}
            </Label>
            <Input
              value={form.description_en}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_en: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>{t("products.fields.type", "Tipo")}</Label>
            <select
              className="w-full h-9 rounded-lg border border-sand bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30"
              value={form.product_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, product_type: e.target.value }))
              }
            >
              {["smoothie", "snack", "supplement", "plan", "addon"].map(
                (type) => (
                  <option key={type} value={type}>
                    {t(`products.types.${type}`, type)}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="space-y-1">
            <Label>{t("products.fields.price", "Precio")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-charcoal-muted select-none pointer-events-none z-10">
                {currency}
              </span>
              <Input
                type="number"
                min="0"
                step="5"
                className="pl-12"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_addon_only}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_addon_only: e.target.checked }))
                }
                className="accent-sage"
              />
              {t("products.fields.addonOnly", "Solo add-on")}
            </label>
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_featured: e.target.checked }))
                }
                className="accent-sage"
              />
              {t("products.fields.featured", "Destacado")}
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
