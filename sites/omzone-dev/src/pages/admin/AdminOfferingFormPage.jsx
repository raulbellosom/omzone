/**
 * AdminOfferingFormPage — página dedicada para crear/editar un offering.
 * Rutas: /app/offerings/new  |  /app/offerings/:id/edit
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import ImageSourceSelector from "@/components/shared/ImageSourceSelector";
import SearchCombobox from "@/components/shared/SearchCombobox";
import {
  useCreateOffering,
  useUpdateOffering,
} from "@/hooks/useAdmin";
import { useOfferingById } from "@/hooks/useOfferings";
import { CURRENCY_OPTIONS } from "@/lib/currency";
import ROUTES from "@/constants/routes";

const EMPTY_FORM = {
  slug: "",
  title_es: "",
  title_en: "",
  summary_es: "",
  summary_en: "",
  description_es: "",
  description_en: "",
  category: "wellness_studio",
  type: "session",
  yoga_style: "",
  booking_mode: "scheduled",
  pricing_mode: "fixed_price",
  base_price: 0,
  currency: "MXN",
  duration_min: 60,
  min_guests: 1,
  max_guests: 1,
  location_label: "",
  cta_label_es: "",
  cta_label_en: "",
  cover_image_id: "",
  cover_image_bucket: "",
  is_featured: false,
  show_on_home: false,
  display_order: 0,
  status: "draft",
  enabled: true,
};

const CATEGORY_OPTIONS = [
  "wellness_studio",
  "immersion",
  "service",
  "stay",
  "experience",
];

const TYPE_OPTIONS = [
  "session",
  "program",
  "immersion",
  "service",
  "stay",
  "experience",
];

const BOOKING_MODE_OPTIONS = [
  "scheduled",
  "request_only",
  "always_available",
  "date_range",
];

const PRICING_MODE_OPTIONS = ["fixed_price", "from_price", "request_quote"];
const STATUS_OPTIONS = ["draft", "published", "archived"];

function SettingRow({ label, description, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/20 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-charcoal">{label}</p>
        {description && (
          <p className="text-xs text-charcoal-muted">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <Card className="border-warm-gray-dark/40">
      <CardContent className="p-6 space-y-4">
        {title && (
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-charcoal-subtle mb-2">
            {title}
          </h3>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export default function AdminOfferingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("admin");
  const { t: tOff } = useTranslation("offerings");
  const isEditing = !!id;

  const { data: existing, isLoading: loadingExisting } = useOfferingById(id);
  const createMutation = useCreateOffering();
  const updateMutation = useUpdateOffering();

  const [form, setForm] = useState(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isEditing && existing && !initialized) {
      setForm({
        slug: existing.slug ?? "",
        title_es: existing.title_es ?? "",
        title_en: existing.title_en ?? "",
        summary_es: existing.summary_es ?? "",
        summary_en: existing.summary_en ?? "",
        description_es: existing.description_es ?? "",
        description_en: existing.description_en ?? "",
        category: existing.category ?? "wellness_studio",
        type: existing.type ?? "session",
        yoga_style: existing.yoga_style ?? "",
        booking_mode: existing.booking_mode ?? "scheduled",
        pricing_mode: existing.pricing_mode ?? "fixed_price",
        base_price: existing.base_price ?? 0,
        currency: existing.currency ?? "MXN",
        duration_min: existing.duration_min ?? 60,
        min_guests: existing.min_guests ?? 1,
        max_guests: existing.max_guests ?? 1,
        location_label: existing.location_label ?? "",
        cta_label_es: existing.cta_label_es ?? "",
        cta_label_en: existing.cta_label_en ?? "",
        cover_image_id: existing.cover_image_id ?? "",
        cover_image_bucket: existing.cover_image_bucket ?? "",
        is_featured: existing.is_featured ?? false,
        show_on_home: existing.show_on_home ?? false,
        display_order: existing.display_order ?? 0,
        status: existing.status ?? "draft",
        enabled: existing.enabled ?? true,
      });
      setInitialized(true);
    }
  }, [isEditing, existing, initialized]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.title_es.trim()) {
      toast.error(t("offerings.fields.titleEs") + " es obligatorio");
      return;
    }

    const payload = {
      ...form,
      base_price: Number(form.base_price) || 0,
      duration_min: Number(form.duration_min) || 0,
      min_guests: Number(form.min_guests) || 1,
      max_guests: Number(form.max_guests) || 1,
      display_order: Number(form.display_order) || 0,
    };

    const mutation = isEditing ? updateMutation : createMutation;
    const mutationPayload = isEditing
      ? { offeringId: id, data: payload }
      : payload;

    mutation.mutate(mutationPayload, {
      onSuccess: () => {
        toast.success(
          isEditing
            ? t("offerings.feedback.updated")
            : t("offerings.feedback.created"),
        );
        navigate(ROUTES.ADMIN_OFFERINGS);
      },
      onError: (error) => {
        const msg =
          error instanceof Error && error.message
            ? error.message
            : t("offerings.feedback.saveError");
        toast.error(msg);
      },
    });
  }

  // Combobox option builders
  function enumOptions(keys, ns) {
    return keys.map((k) => ({ value: k, label: tOff(`${ns}.${k}`) }));
  }

  const categoryOpts = enumOptions(CATEGORY_OPTIONS, "categories");
  const typeOpts = enumOptions(TYPE_OPTIONS, "types");
  const bookingModeOpts = enumOptions(BOOKING_MODE_OPTIONS, "bookingMode");
  const pricingModeOpts = enumOptions(PRICING_MODE_OPTIONS, "pricingMode");
  const statusOpts = enumOptions(STATUS_OPTIONS, "status");

  const isBusy = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingExisting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Link
        to={ROUTES.ADMIN_OFFERINGS}
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("offerings.title")}
      </Link>

      <AdminPageHeader
        title={
          isEditing
            ? t("offerings.dialog.editTitle")
            : t("offerings.dialog.createTitle")
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity */}
        <FormSection title={t("offerings.fields.titleEs")?.split(" ")[0]}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.titleEs")}</Label>
              <Input
                value={form.title_es}
                onChange={(e) => setField("title_es", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.titleEn")}</Label>
              <Input
                value={form.title_en}
                onChange={(e) => setField("title_en", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.slug")}</Label>
              <Input
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                placeholder={t("offerings.fields.slugPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.duration")}</Label>
              <Input
                type="number"
                min="0"
                max="10080"
                value={form.duration_min}
                onChange={(e) => setField("duration_min", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* Classification */}
        <FormSection title={t("offerings.fields.category")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.category")}</Label>
              <SearchCombobox
                value={form.category}
                onValueChange={(v) => setField("category", v)}
                options={categoryOpts}
                placeholder={t("offerings.fields.category")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.type")}</Label>
              <SearchCombobox
                value={form.type}
                onValueChange={(v) => setField("type", v)}
                options={typeOpts}
                placeholder={t("offerings.fields.type")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
          </div>
          {form.category === "wellness_studio" && (
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.yogaStyle")}</Label>
              <Input
                value={form.yoga_style}
                onChange={(e) => setField("yoga_style", e.target.value)}
                placeholder="vinyasa, hatha, yin..."
              />
            </div>
          )}
        </FormSection>

        {/* Booking & Pricing */}
        <FormSection title={t("offerings.fields.bookingMode")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.bookingMode")}</Label>
              <SearchCombobox
                value={form.booking_mode}
                onValueChange={(v) => setField("booking_mode", v)}
                options={bookingModeOpts}
                placeholder={t("offerings.fields.bookingMode")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.pricingMode")}</Label>
              <SearchCombobox
                value={form.pricing_mode}
                onValueChange={(v) => setField("pricing_mode", v)}
                options={pricingModeOpts}
                placeholder={t("offerings.fields.pricingMode")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.currency")}</Label>
              <SearchCombobox
                value={form.currency}
                onValueChange={(v) => setField("currency", v)}
                options={CURRENCY_OPTIONS}
                placeholder={t("offerings.fields.currency")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.basePrice")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-charcoal-muted select-none pointer-events-none z-10">
                  {form.currency}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="10"
                  className="pl-12"
                  value={form.base_price}
                  onChange={(e) => setField("base_price", e.target.value)}
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Capacity & Location */}
        <FormSection title={t("offerings.fields.location")}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.minGuests")}</Label>
              <Input
                type="number"
                min="1"
                value={form.min_guests}
                onChange={(e) => setField("min_guests", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.maxGuests")}</Label>
              <Input
                type="number"
                min="1"
                value={form.max_guests}
                onChange={(e) => setField("max_guests", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.location")}</Label>
              <Input
                value={form.location_label}
                onChange={(e) => setField("location_label", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* Summaries */}
        <FormSection title={t("offerings.fields.summaryEs")?.split(" ")[0]}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.summaryEs")}</Label>
              <Textarea
                className="min-h-24"
                value={form.summary_es}
                onChange={(e) => setField("summary_es", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.summaryEn")}</Label>
              <Textarea
                className="min-h-24"
                value={form.summary_en}
                onChange={(e) => setField("summary_en", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* Descriptions */}
        <FormSection title={t("offerings.fields.descriptionEs")?.split(" ")[0]}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.descriptionEs")}</Label>
              <Textarea
                className="min-h-36"
                value={form.description_es}
                onChange={(e) => setField("description_es", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.descriptionEn")}</Label>
              <Textarea
                className="min-h-36"
                value={form.description_en}
                onChange={(e) => setField("description_en", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* CTA */}
        <FormSection title="CTA">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.ctaLabelEs")}</Label>
              <Input
                value={form.cta_label_es}
                onChange={(e) => setField("cta_label_es", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.ctaLabelEn")}</Label>
              <Input
                value={form.cta_label_en}
                onChange={(e) => setField("cta_label_en", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* Cover Image */}
        <FormSection>
          <ImageSourceSelector
            fileId={form.cover_image_id}
            bucketId={form.cover_image_bucket}
            onFileChange={(fileId, bucketId) => {
              setField("cover_image_id", fileId);
              setForm((prev) => ({ ...prev, cover_image_bucket: bucketId }));
            }}
            label={t("offerings.fields.featured")}
            aspectRatio="16/9"
          />
        </FormSection>

        {/* Publication */}
        <FormSection title={t("offerings.fields.status")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.status")}</Label>
              <SearchCombobox
                value={form.status}
                onValueChange={(v) => setField("status", v)}
                options={statusOpts}
                placeholder={t("offerings.fields.status")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.displayOrder")}</Label>
              <Input
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => setField("display_order", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* Toggles */}
        <FormSection>
          <div className="space-y-2">
            <SettingRow
              label={t("offerings.fields.featured")}
              checked={form.is_featured}
              onCheckedChange={(checked) => setField("is_featured", checked)}
            />
            <SettingRow
              label={t("offerings.fields.showOnHome")}
              checked={form.show_on_home}
              onCheckedChange={(checked) => setField("show_on_home", checked)}
            />
            <SettingRow
              label={t("offerings.fields.enabled")}
              checked={form.enabled}
              onCheckedChange={(checked) => setField("enabled", checked)}
            />
          </div>
        </FormSection>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link to={ROUTES.ADMIN_OFFERINGS}>
              {t("common.cancel")}
            </Link>
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy
              ? t("common.save") + "..."
              : isEditing
                ? t("offerings.actions.save")
                : t("offerings.actions.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
