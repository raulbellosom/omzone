/**
 * AdminContentFormPage — pagina dedicada para crear/editar una content_section.
 * Rutas: /app/content/new  |  /app/content/:id/edit
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
import {
  useAdminContentSections,
  useCreateContentSection,
  useUpdateContentSection,
} from "@/hooks/useAdmin";
import ROUTES from "@/constants/routes";

const EMPTY_FORM = {
  section_key: "",
  title_es: "",
  title_en: "",
  subtitle_es: "",
  subtitle_en: "",
  body_es: "",
  body_en: "",
  cta_label_es: "",
  cta_label_en: "",
  cta_url: "",
  image_id: "",
  image_bucket: "",
  display_order: 0,
  enabled: true,
};

function SettingRow({ label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/20 px-4 py-3">
      <p className="text-sm font-medium text-charcoal">{label}</p>
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

export default function AdminContentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("admin");
  const isEditing = !!id;

  const { data: sections = [], isLoading: sectionsLoading } =
    useAdminContentSections();
  const createMutation = useCreateContentSection();
  const updateMutation = useUpdateContentSection();

  const [form, setForm] = useState(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);

  const existing = isEditing ? sections.find((s) => s.$id === id) : null;

  useEffect(() => {
    if (isEditing && existing && !initialized) {
      setForm({
        section_key: existing.section_key ?? "",
        title_es: existing.title_es ?? "",
        title_en: existing.title_en ?? "",
        subtitle_es: existing.subtitle_es ?? "",
        subtitle_en: existing.subtitle_en ?? "",
        body_es: existing.body_es ?? "",
        body_en: existing.body_en ?? "",
        cta_label_es: existing.cta_label_es ?? "",
        cta_label_en: existing.cta_label_en ?? "",
        cta_url: existing.cta_url ?? "",
        image_id: existing.image_id ?? "",
        image_bucket: existing.image_bucket ?? "",
        display_order: existing.display_order ?? 0,
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

    if (!form.section_key.trim()) {
      toast.error(
        t("contentSections.fields.sectionKey") + " es obligatorio",
      );
      return;
    }

    const payload = {
      ...form,
      display_order: Number(form.display_order) || 0,
    };

    const mutation = isEditing ? updateMutation : createMutation;
    const mutationPayload = isEditing
      ? { sectionId: id, data: payload }
      : payload;

    mutation.mutate(mutationPayload, {
      onSuccess: () => {
        toast.success(
          isEditing
            ? t("contentSections.feedback.updated")
            : t("contentSections.feedback.created"),
        );
        navigate(ROUTES.ADMIN_CONTENT);
      },
      onError: (error) => {
        const msg =
          error instanceof Error && error.message
            ? error.message
            : t("contentSections.feedback.saveError");
        toast.error(msg);
      },
    });
  }

  const isBusy = createMutation.isPending || updateMutation.isPending;

  if (isEditing && sectionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Link
        to={ROUTES.ADMIN_CONTENT}
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("contentSections.title")}
      </Link>

      <AdminPageHeader
        title={
          isEditing
            ? t("contentSections.dialog.editTitle")
            : t("contentSections.dialog.createTitle")
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Key */}
        <FormSection title={t("contentSections.fields.sectionKey")}>
          <div className="space-y-1.5">
            <Label>{t("contentSections.fields.sectionKey")}</Label>
            <Input
              value={form.section_key}
              onChange={(e) => setField("section_key", e.target.value)}
              placeholder="hero, about, testimonials..."
              required
            />
          </div>
        </FormSection>

        {/* Titles */}
        <FormSection title={t("contentSections.fields.titleEs")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("contentSections.fields.titleEs")}</Label>
              <Input
                value={form.title_es}
                onChange={(e) => setField("title_es", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("contentSections.fields.titleEn")}</Label>
              <Input
                value={form.title_en}
                onChange={(e) => setField("title_en", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* Subtitles */}
        <FormSection title={t("contentSections.fields.subtitleEs")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("contentSections.fields.subtitleEs")}</Label>
              <Input
                value={form.subtitle_es}
                onChange={(e) => setField("subtitle_es", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("contentSections.fields.subtitleEn")}</Label>
              <Input
                value={form.subtitle_en}
                onChange={(e) => setField("subtitle_en", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* Body */}
        <FormSection title={t("contentSections.fields.bodyEs")}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("contentSections.fields.bodyEs")}</Label>
              <Textarea
                className="min-h-36"
                value={form.body_es}
                onChange={(e) => setField("body_es", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("contentSections.fields.bodyEn")}</Label>
              <Textarea
                className="min-h-36"
                value={form.body_en}
                onChange={(e) => setField("body_en", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* CTA */}
        <FormSection title="CTA">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("contentSections.fields.ctaLabelEs")}</Label>
              <Input
                value={form.cta_label_es}
                onChange={(e) => setField("cta_label_es", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("contentSections.fields.ctaLabelEn")}</Label>
              <Input
                value={form.cta_label_en}
                onChange={(e) => setField("cta_label_en", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("contentSections.fields.ctaUrl")}</Label>
            <Input
              value={form.cta_url}
              onChange={(e) => setField("cta_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </FormSection>

        {/* Image */}
        <FormSection>
          <ImageSourceSelector
            fileId={form.image_id}
            bucketId={form.image_bucket}
            onFileChange={(fileId, bucketId) => {
              setField("image_id", fileId);
              setForm((prev) => ({ ...prev, image_bucket: bucketId }));
            }}
            label={t("contentSections.fields.titleEs")}
            aspectRatio="16/9"
          />
        </FormSection>

        {/* Options */}
        <FormSection>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("contentSections.fields.displayOrder")}</Label>
              <Input
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => setField("display_order", e.target.value)}
              />
            </div>
          </div>
          <SettingRow
            label={t("contentSections.fields.enabled")}
            checked={form.enabled}
            onCheckedChange={(checked) => setField("enabled", checked)}
          />
        </FormSection>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" asChild>
            <Link to={ROUTES.ADMIN_CONTENT}>{t("common.cancel")}</Link>
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy
              ? t("common.save") + "..."
              : isEditing
                ? t("contentSections.actions.save")
                : t("contentSections.actions.new")}
          </Button>
        </div>
      </form>
    </div>
  );
}
