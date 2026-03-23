/**
 * AdminOfferingFormPage - dynamic offering form by flowKey.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import SearchCombobox from "@/components/shared/SearchCombobox";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import MultiImageSelector from "@/components/shared/MultiImageSelector";
import {
  useCreateOffering,
  useUpdateOffering,
  useAdminLocationProfiles,
  useCreateLocationProfile,
} from "@/hooks/useAdmin";
import { useOfferingById } from "@/hooks/useOfferings";
import ROUTES from "@/constants/routes";
import { CURRENCY_OPTIONS } from "@/lib/currency";
import {
  getFlowTemplate,
  ensureOfferingFlow,
  getFlowOptions,
} from "@/lib/offering-flow";

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

const STATUS_OPTIONS = ["draft", "published", "archived"];

const EMPTY_CORE = {
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
  currency: "MXN",
  cta_label_es: "",
  cta_label_en: "",
  images: [],
  is_featured: false,
  show_on_home: false,
  display_order: 0,
  status: "draft",
  enabled: true,
};

/**
 * Parse imagesJson string into array of {id, bucket} objects.
 * Returns empty array if invalid or missing.
 */
function parseImagesJson(jsonStr) {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.filter((img) => img && img.id);
    }
    return [];
  } catch {
    return [];
  }
}

function buildInitialForm() {
  const tpl = getFlowTemplate("wellness_studio", "session");
  return {
    core: { ...EMPTY_CORE },
    flow: {
      flow_key: tpl.flow_key,
      flow_version: tpl.flow_version,
      flow_config: tpl.flow_config,
      terms_config: tpl.terms_config,
    },
    new_location: {
      name: "",
      address: "",
      map_url: "",
      notes: "",
    },
  };
}

function FormSection({ title, children }) {
  return (
    <Card className="border-warm-gray-dark/40">
      <CardContent className="p-6 space-y-4">
        {title && (
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-charcoal-subtle">
            {title}
          </h3>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

function SettingRow({ label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/20 px-4 py-3">
      <p className="text-sm font-medium text-charcoal">{label}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AdminOfferingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("admin");
  const { t: tOff } = useTranslation("offerings");
  const isEditing = !!id;

  const { data: existing, isLoading: loadingExisting } = useOfferingById(id);
  const { data: locationProfiles = [] } = useAdminLocationProfiles();
  const createOfferingMutation = useCreateOffering();
  const updateOfferingMutation = useUpdateOffering();
  const createLocationMutation = useCreateLocationProfile();

  const [form, setForm] = useState(buildInitialForm());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isEditing || !existing || initialized) return;
    const flow = ensureOfferingFlow({
      category: existing.category,
      type: existing.type,
      flow_key: existing.flow_key,
      flow_version: existing.flow_version,
      flow_config: existing.flow_config,
      terms_config: existing.terms_config,
    });

    setForm({
      core: {
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
        currency: existing.currency ?? "MXN",
        cta_label_es: existing.cta_label_es ?? "",
        cta_label_en: existing.cta_label_en ?? "",
        images: parseImagesJson(existing.images_json),
        is_featured: existing.is_featured ?? false,
        show_on_home: existing.show_on_home ?? false,
        display_order: existing.display_order ?? 0,
        status: existing.status ?? "draft",
        enabled: existing.enabled ?? true,
      },
      flow: {
        flow_key: flow.flow_key,
        flow_version: flow.flow_version,
        flow_config: flow.flow_config,
        terms_config: flow.terms_config,
      },
      new_location: {
        name: "",
        address: "",
        map_url: "",
        notes: "",
      },
    });
    setInitialized(true);
  }, [isEditing, existing, initialized]);

  function setCoreField(key, value) {
    setForm((prev) => ({ ...prev, core: { ...prev.core, [key]: value } }));
  }

  function setFlowConfig(path, value) {
    setForm((prev) => ({
      ...prev,
      flow: {
        ...prev.flow,
        flow_config: {
          ...prev.flow.flow_config,
          [path.section]: {
            ...prev.flow.flow_config[path.section],
            [path.key]: value,
          },
        },
      },
    }));
  }

  function setTermsField(key, value) {
    setForm((prev) => ({
      ...prev,
      flow: {
        ...prev.flow,
        terms_config: {
          ...prev.flow.terms_config,
          [key]: value,
        },
      },
    }));
  }

  function applyTemplate(category, type) {
    const next = getFlowTemplate(category, type);
    setForm((prev) => {
      const mergedFlow = ensureOfferingFlow({
        category,
        type,
        flow_key: next.flow_key,
        flow_version: next.flow_version,
        flow_config: {
          ...next.flow_config,
          booking: {
            ...next.flow_config.booking,
            ...(prev.flow.flow_config?.booking ?? {}),
          },
          pricing: {
            ...next.flow_config.pricing,
            ...(prev.flow.flow_config?.pricing ?? {}),
          },
          guest_policy: {
            ...next.flow_config.guest_policy,
            ...(prev.flow.flow_config?.guest_policy ?? {}),
          },
          location: {
            ...next.flow_config.location,
            ...(prev.flow.flow_config?.location ?? {}),
          },
        },
        terms_config: {
          ...next.terms_config,
          ...(prev.flow.terms_config ?? {}),
        },
      });
      return {
        ...prev,
        flow: {
          flow_key: mergedFlow.flow_key,
          flow_version: mergedFlow.flow_version,
          flow_config: mergedFlow.flow_config,
          terms_config: mergedFlow.terms_config,
        },
      };
    });
  }

  const flowOptions = useMemo(
    () => getFlowOptions(form.core.category, form.core.type),
    [form.core.category, form.core.type],
  );

  const bookingOptions = flowOptions.booking_modes.map((value) => ({
    value,
    label: tOff(`bookingMode.${value}`),
  }));
  const pricingOptions = flowOptions.pricing_modes.map((value) => ({
    value,
    label: tOff(`pricingMode.${value}`),
  }));
  const categoryOptions = CATEGORY_OPTIONS.map((value) => ({
    value,
    label: tOff(`categories.${value}`),
  }));
  const typeOptions = TYPE_OPTIONS.map((value) => ({
    value,
    label: tOff(`types.${value}`),
  }));
  const statusOptions = STATUS_OPTIONS.map((value) => ({
    value,
    label: tOff(`status.${value}`),
  }));
  const locationOptions = locationProfiles.map((location) => ({
    value: location.$id,
    label: location.name || location.address || location.$id,
    description: location.address || "",
  }));

  async function createLocationAndAssign() {
    if (!form.new_location.name.trim()) {
      toast.error(t("offerings.validation.locationNameRequired"));
      return;
    }
    createLocationMutation.mutate(
      {
        name: form.new_location.name.trim(),
        address: form.new_location.address.trim() || null,
        map_url: form.new_location.map_url.trim() || null,
        notes: form.new_location.notes.trim() || null,
        enabled: true,
      },
      {
        onSuccess: (location) => {
          setFlowConfig(
            { section: "location", key: "default_location_profile_id" },
            location.$id,
          );
          setForm((prev) => ({
            ...prev,
            new_location: { name: "", address: "", map_url: "", notes: "" },
          }));
          toast.success(t("offerings.feedback.locationCreated"));
        },
        onError: (error) =>
          toast.error(
            error.message || t("offerings.feedback.locationCreateError"),
          ),
      },
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.core.title_es.trim()) {
      toast.error(`${t("offerings.fields.titleEs")} es obligatorio`);
      return;
    }

    const flow = ensureOfferingFlow({
      category: form.core.category,
      type: form.core.type,
      flow_key: form.flow.flow_key,
      flow_version: form.flow.flow_version,
      flow_config: {
        ...form.flow.flow_config,
        pricing: {
          ...form.flow.flow_config.pricing,
          base_price:
            form.flow.flow_config.pricing?.base_price === "" ||
            form.flow.flow_config.pricing?.base_price === null
              ? null
              : Number(form.flow.flow_config.pricing?.base_price ?? 0),
        },
        schedule: {
          ...form.flow.flow_config.schedule,
          duration_min:
            form.flow.flow_config.schedule?.duration_min === "" ||
            form.flow.flow_config.schedule?.duration_min === null
              ? null
              : Number(form.flow.flow_config.schedule?.duration_min ?? 0),
        },
        guest_policy: {
          ...form.flow.flow_config.guest_policy,
          min_per_booking:
            Number(form.flow.flow_config.guest_policy?.min_per_booking ?? 1) ||
            1,
          max_per_booking:
            Number(form.flow.flow_config.guest_policy?.max_per_booking ?? 1) ||
            1,
        },
      },
      terms_config: form.flow.terms_config,
    });

    // Serialize images array to JSON string, excluding the 'images' field from core
    const { images, ...coreWithoutImages } = form.core;
    const imagesJson = images.length > 0 ? JSON.stringify(images) : null;

    const payload = {
      core: {
        ...coreWithoutImages,
        images_json: imagesJson,
        display_order: Number(form.core.display_order) || 0,
      },
      flow: {
        flow_key: flow.flow_key,
        flow_version: flow.flow_version,
        flow_config: flow.flow_config,
        terms_config: flow.terms_config,
      },
    };

    const mutation = isEditing
      ? updateOfferingMutation
      : createOfferingMutation;
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
      onError: (error) =>
        toast.error(error.message || t("offerings.feedback.saveError")),
    });
  }

  const isBusy =
    createOfferingMutation.isPending || updateOfferingMutation.isPending;

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
        <FormSection title={t("offerings.sections.identity")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.titleEs")}</Label>
              <Input
                value={form.core.title_es}
                onChange={(e) => setCoreField("title_es", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.titleEn")}</Label>
              <Input
                value={form.core.title_en}
                onChange={(e) => setCoreField("title_en", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("offerings.fields.slug")}</Label>
            <Input
              value={form.core.slug}
              onChange={(e) => setCoreField("slug", e.target.value)}
              placeholder={t("offerings.fields.slugPlaceholder")}
            />
          </div>
        </FormSection>

        <FormSection title={t("offerings.fields.category")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.category")}</Label>
              <SearchCombobox
                value={form.core.category}
                onValueChange={(value) => {
                  setCoreField("category", value);
                  applyTemplate(value, form.core.type);
                }}
                options={categoryOptions}
                placeholder={t("offerings.fields.category")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.type")}</Label>
              <SearchCombobox
                value={form.core.type}
                onValueChange={(value) => {
                  setCoreField("type", value);
                  applyTemplate(form.core.category, value);
                }}
                options={typeOptions}
                placeholder={t("offerings.fields.type")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
          </div>
          {form.core.category === "wellness_studio" && (
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.yogaStyle")}</Label>
              <Input
                value={form.core.yoga_style}
                onChange={(e) => setCoreField("yoga_style", e.target.value)}
              />
            </div>
          )}
        </FormSection>

        <FormSection title={t("offerings.sections.flow")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.bookingMode")}</Label>
              <SearchCombobox
                value={form.flow.flow_config.booking?.mode}
                onValueChange={(value) =>
                  setFlowConfig({ section: "booking", key: "mode" }, value)
                }
                options={bookingOptions}
                placeholder={t("offerings.fields.bookingMode")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.pricingMode")}</Label>
              <SearchCombobox
                value={form.flow.flow_config.pricing?.mode}
                onValueChange={(value) =>
                  setFlowConfig({ section: "pricing", key: "mode" }, value)
                }
                options={pricingOptions}
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
                value={form.core.currency}
                onValueChange={(value) => setCoreField("currency", value)}
                options={CURRENCY_OPTIONS}
                placeholder={t("offerings.fields.currency")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.basePrice")}</Label>
              <Input
                type="number"
                min="0"
                value={form.flow.flow_config.pricing?.base_price ?? ""}
                onChange={(e) =>
                  setFlowConfig(
                    { section: "pricing", key: "base_price" },
                    e.target.value,
                  )
                }
              />
            </div>
          </div>

          {flowOptions.supports_duration && (
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.duration")}</Label>
              <Input
                type="number"
                min="0"
                value={form.flow.flow_config.schedule?.duration_min ?? ""}
                onChange={(e) =>
                  setFlowConfig(
                    { section: "schedule", key: "duration_min" },
                    e.target.value,
                  )
                }
              />
            </div>
          )}

          {flowOptions.supports_guest_policy && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("offerings.fields.minGuests")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={
                    form.flow.flow_config.guest_policy?.min_per_booking ?? 1
                  }
                  onChange={(e) =>
                    setFlowConfig(
                      { section: "guest_policy", key: "min_per_booking" },
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("offerings.fields.maxGuests")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={
                    form.flow.flow_config.guest_policy?.max_per_booking ?? 1
                  }
                  onChange={(e) =>
                    setFlowConfig(
                      { section: "guest_policy", key: "max_per_booking" },
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          )}
        </FormSection>

        <FormSection title={t("offerings.fields.location")}>
          <div className="space-y-1.5">
            <Label>{t("offerings.fields.locationProfile")}</Label>
            <SearchCombobox
              value={
                form.flow.flow_config.location?.default_location_profile_id ??
                ""
              }
              onValueChange={(value) =>
                setFlowConfig(
                  { section: "location", key: "default_location_profile_id" },
                  value,
                )
              }
              options={locationOptions}
              placeholder={t("offerings.fields.locationProfilePlaceholder")}
              searchPlaceholder={t("common.search")}
              emptyMessage={t("common.noData")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("offerings.fields.locationFallbackLabel")}</Label>
            <Input
              value={form.flow.flow_config.location?.fallback_label ?? ""}
              onChange={(e) =>
                setFlowConfig(
                  { section: "location", key: "fallback_label" },
                  e.target.value,
                )
              }
              placeholder={t("offerings.fields.locationFallbackPlaceholder")}
            />
          </div>
          <div className="rounded-2xl border border-dashed border-warm-gray-dark/50 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.12em] text-charcoal-subtle">
              {t("offerings.sections.quickCreateLocation")}
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={form.new_location.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    new_location: {
                      ...prev.new_location,
                      name: e.target.value,
                    },
                  }))
                }
                placeholder={t("offerings.fields.locationName")}
              />
              <Input
                value={form.new_location.address}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    new_location: {
                      ...prev.new_location,
                      address: e.target.value,
                    },
                  }))
                }
                placeholder={t("offerings.fields.locationAddress")}
              />
            </div>
            <Input
              value={form.new_location.map_url}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  new_location: {
                    ...prev.new_location,
                    map_url: e.target.value,
                  },
                }))
              }
              placeholder={t("offerings.fields.locationMapUrl")}
            />
            <Textarea
              value={form.new_location.notes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  new_location: { ...prev.new_location, notes: e.target.value },
                }))
              }
              placeholder={t("offerings.fields.locationNotes")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={createLocationAndAssign}
              disabled={createLocationMutation.isPending}
            >
              <Plus className="w-4 h-4" />
              {t("offerings.actions.createLocationAndAssign")}
            </Button>
          </div>
        </FormSection>

        <FormSection title={t("offerings.sections.terms")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.cancellationEs")}</Label>
              <Textarea
                value={form.flow.terms_config.cancellation_policy_es ?? ""}
                onChange={(e) =>
                  setTermsField("cancellation_policy_es", e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("offerings.fields.cancellationEn")}</Label>
              <Textarea
                value={form.flow.terms_config.cancellation_policy_en ?? ""}
                onChange={(e) =>
                  setTermsField("cancellation_policy_en", e.target.value)
                }
              />
            </div>
          </div>
        </FormSection>

        <FormSection title={t("offerings.fields.summaryEs")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Textarea
              value={form.core.summary_es}
              onChange={(e) => setCoreField("summary_es", e.target.value)}
            />
            <Textarea
              value={form.core.summary_en}
              onChange={(e) => setCoreField("summary_en", e.target.value)}
            />
          </div>
        </FormSection>

        <FormSection title={t("offerings.fields.descriptionEs")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Textarea
              className="min-h-36"
              value={form.core.description_es}
              onChange={(e) => setCoreField("description_es", e.target.value)}
            />
            <Textarea
              className="min-h-36"
              value={form.core.description_en}
              onChange={(e) => setCoreField("description_en", e.target.value)}
            />
          </div>
        </FormSection>

        <FormSection title={t("offerings.sections.cta")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              value={form.core.cta_label_es}
              onChange={(e) => setCoreField("cta_label_es", e.target.value)}
              placeholder={t("offerings.fields.ctaLabelEs")}
            />
            <Input
              value={form.core.cta_label_en}
              onChange={(e) => setCoreField("cta_label_en", e.target.value)}
              placeholder={t("offerings.fields.ctaLabelEn")}
            />
          </div>
        </FormSection>

        <FormSection title={t("offerings.sections.images")}>
          <MultiImageSelector
            images={form.core.images}
            onChange={(newImages) => setCoreField("images", newImages)}
            maxImages={3}
            label={t("offerings.fields.images")}
            aspectRatio="16/9"
          />
        </FormSection>

        <FormSection title={t("offerings.fields.status")}>
          <div className="grid gap-4 md:grid-cols-2">
            <SearchCombobox
              value={form.core.status}
              onValueChange={(value) => setCoreField("status", value)}
              options={statusOptions}
              placeholder={t("offerings.fields.status")}
              searchPlaceholder={t("common.search")}
              emptyMessage={t("common.noData")}
            />
            <Input
              type="number"
              min="0"
              value={form.core.display_order}
              onChange={(e) => setCoreField("display_order", e.target.value)}
              placeholder={t("offerings.fields.displayOrder")}
            />
          </div>
          <div className="space-y-2">
            <SettingRow
              label={t("offerings.fields.featured")}
              checked={form.core.is_featured}
              onCheckedChange={(value) => setCoreField("is_featured", value)}
            />
            <SettingRow
              label={t("offerings.fields.showOnHome")}
              checked={form.core.show_on_home}
              onCheckedChange={(value) => setCoreField("show_on_home", value)}
            />
            <SettingRow
              label={t("offerings.fields.enabled")}
              checked={form.core.enabled}
              onCheckedChange={(value) => setCoreField("enabled", value)}
            />
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link to={ROUTES.ADMIN_OFFERINGS}>{t("common.cancel")}</Link>
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy
              ? `${t("common.save")}...`
              : isEditing
                ? t("offerings.actions.save")
                : t("offerings.actions.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
