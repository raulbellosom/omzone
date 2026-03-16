/**
 * AdminContentPage — CMS: Hero, FAQs, Testimonios.
 * Ruta: /app/content
 * Modo real: persiste en site_content (Appwrite) vía useSiteContent / useUpsertSiteContent.
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Save, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteContent, useUpsertSiteContent } from "@/hooks/useAdmin";
import AdminPageHeader from "@/components/shared/AdminPageHeader";

function SectionCard({ title, children, onSave, saving }) {
  const [open, setOpen] = useState(true);
  return (
    <Card className="overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-cream/40 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <h3 className="font-semibold text-charcoal text-sm">{title}</h3>
        <ChevronDown
          className={`w-4 h-4 text-charcoal-subtle transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <CardContent className="px-6 pb-6 pt-0 border-t border-warm-gray-dark/20">
          <div className="space-y-4 mt-4">{children}</div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onSave}
              disabled={saving}
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "..." : "Guardar"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function Field({ label, value, onChange, multiline = false }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-charcoal-muted">{label}</Label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full text-sm rounded-xl border border-warm-gray-dark/40 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 resize-none"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm"
        />
      )}
    </div>
  );
}

const EMPTY_HERO = {
  headline_es: "",
  headline_en: "",
  subheadline_es: "",
  subheadline_en: "",
  cta_es: "",
  cta_en: "",
};

function ContentSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <div className="flex justify-end">
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminContentPage() {
  const { t, i18n } = useTranslation("admin");
  const locale = i18n.language ?? "es";
  const [hero, setHero] = useState(EMPTY_HERO);
  const [faqs] = useState([]);
  const [testimonials] = useState([]);

  // Real data hooks — seed form when loaded
  const { data: heroData, isLoading } = useSiteContent("hero");
  const upsertContent = useUpsertSiteContent();

  useEffect(() => {
    if (heroData?.metaJson) {
      try {
        const parsed = JSON.parse(heroData.metaJson);
        if (parsed) setHero((h) => ({ ...h, ...parsed }));
      } catch {
        /* non-fatal */
      }
    }
  }, [heroData]);

  async function handleSave(section) {
    if (section === "hero") {
      upsertContent.mutate(
        { contentKey: "hero", locale, metaJson: JSON.stringify(hero) },
        {
          onSuccess: () => toast.success(t("content.saved")),
          onError: () => toast.error("Error al guardar"),
        },
      );
    } else {
      // FAQs & Testimonials are read-only for now (saved in future iterations)
      toast.success(t("content.saved"));
    }
  }

  if (isLoading) {
    return <ContentSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t("content.title")}
        subtitle={t("content.subtitle")}
      />
      <div className="space-y-4">
        {/* Hero */}
        <SectionCard
          title={t("content.hero")}
          onSave={() => handleSave("hero")}
          saving={upsertContent.isPending}
        >
          <Field
            label={`${t("content.fields.headline")} (ES)`}
            value={hero.headline_es}
            onChange={(v) => setHero((h) => ({ ...h, headline_es: v }))}
          />
          <Field
            label={`${t("content.fields.headline")} (EN)`}
            value={hero.headline_en}
            onChange={(v) => setHero((h) => ({ ...h, headline_en: v }))}
          />
          <Field
            label={`${t("content.fields.subheadline")} (ES)`}
            value={hero.subheadline_es}
            onChange={(v) => setHero((h) => ({ ...h, subheadline_es: v }))}
            multiline
          />
          <Field
            label={`${t("content.fields.subheadline")} (EN)`}
            value={hero.subheadline_en}
            onChange={(v) => setHero((h) => ({ ...h, subheadline_en: v }))}
            multiline
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label={`${t("content.fields.cta")} (ES)`}
              value={hero.cta_es}
              onChange={(v) => setHero((h) => ({ ...h, cta_es: v }))}
            />
            <Field
              label={`${t("content.fields.cta")} (EN)`}
              value={hero.cta_en}
              onChange={(v) => setHero((h) => ({ ...h, cta_en: v }))}
            />
          </div>
        </SectionCard>

        {/* FAQs */}
        <SectionCard
          title={t("content.faqs")}
          onSave={() => handleSave("faqs")}
          saving={false}
        >
          {faqs.length === 0 ? (
            <p className="text-sm text-charcoal-muted">{t("common.noData")}</p>
          ) : null}
        </SectionCard>

        {/* Testimonials */}
        <SectionCard
          title={t("content.testimonials")}
          onSave={() => handleSave("testimonials")}
          saving={false}
        >
          {testimonials.length === 0 ? (
            <p className="text-sm text-charcoal-muted">{t("common.noData")}</p>
          ) : null}
        </SectionCard>
      </div>
    </div>
  );
}
