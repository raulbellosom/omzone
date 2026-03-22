/**
 * AdminOfferingsPage — listado de offerings con tabs de categoría.
 * Ruta: /app/offerings
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import {
  useAdminOfferings,
  useToggleOffering,
  useDeleteOffering,
} from "@/hooks/useAdmin";
import { useCurrency } from "@/hooks/useCurrency";
import { resolveField } from "@/lib/i18n-data";
import { cn } from "@/lib/utils";
import ROUTES from "@/constants/routes";

const CATEGORY_OPTIONS = [
  "wellness_studio",
  "immersion",
  "service",
  "stay",
  "experience",
];

const STATUS_BADGE = {
  draft: "outline",
  published: "sage",
  archived: "default",
};

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AdminOfferingsPage() {
  const { t } = useTranslation("admin");
  const { t: tOff } = useTranslation("offerings");
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteState, setDeleteState] = useState(null);

  const { data: offerings = [], isLoading } = useAdminOfferings();
  const toggleMutation = useToggleOffering();
  const deleteMutation = useDeleteOffering();

  const filtered = offerings.filter((item) => {
    if (activeTab !== "all" && item.category !== activeTab) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [item.title_es, item.title_en, item.slug, item.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  function handleDeleteConfirm() {
    if (!deleteState) return;
    deleteMutation.mutate(deleteState.$id, {
      onSuccess: () => {
        setDeleteState(null);
        toast.success(t("offerings.feedback.deleted"));
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, t("offerings.feedback.deleteError")),
        );
      },
    });
  }

  function renderCards() {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-[28px]" />
          ))}
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <Card className="border-dashed border-warm-gray-dark/50 bg-white/70">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-gray text-charcoal-subtle">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-medium text-charcoal">
                {t("offerings.empty.title")}
              </p>
              <p className="mt-1 max-w-md text-sm text-charcoal-muted">
                {t("offerings.empty.description")}
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link to={ROUTES.ADMIN_OFFERING_NEW}>
                <Plus className="h-4 w-4" />
                {t("offerings.actions.new")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map((item) => (
          <Card
            key={item.$id}
            className={cn(
              "overflow-hidden border-warm-gray-dark/40 bg-[radial-gradient(circle_at_top_left,rgba(181,201,188,0.24),transparent_50%),linear-gradient(180deg,#fff_0%,#f9f5ed_100%)]",
              !item.enabled && "opacity-65",
            )}
          >
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {tOff(`categories.${item.category}`)}
                  </Badge>
                  <Badge variant={STATUS_BADGE[item.status] ?? "outline"}>
                    {tOff(`status.${item.status}`)}
                  </Badge>
                  {item.is_featured && (
                    <Badge variant="outline">
                      {t("offerings.fields.featured")}
                    </Badge>
                  )}
                  {!item.enabled && (
                    <Badge variant="outline">{t("common.disabled")}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal">
                      {resolveField(item, "title")}
                    </h3>
                    <p className="mt-1 text-sm text-charcoal-muted">
                      {item.slug}
                    </p>
                  </div>
                  {item.base_price > 0 && (
                    <div className="rounded-2xl bg-white/85 px-4 py-3 text-right shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-charcoal-subtle">
                        {t("offerings.fields.basePrice")}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-charcoal">
                        {formatPrice(item.base_price)}
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-charcoal-muted line-clamp-2">
                  {resolveField(item, "summary")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-charcoal-muted">
                  {item.duration_min > 0 && (
                    <span className="rounded-full bg-white/80 px-3 py-1.5">
                      {t("offerings.fields.duration")}: {item.duration_min} min
                    </span>
                  )}
                  <span className="rounded-full bg-white/80 px-3 py-1.5">
                    {tOff(`bookingMode.${item.booking_mode}`)}
                  </span>
                  <span className="rounded-full bg-white/80 px-3 py-1.5">
                    {tOff(`pricingMode.${item.pricing_mode}`)}
                  </span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full"
                  asChild
                >
                  <Link to={ROUTES.ADMIN_OFFERING_EDIT(item.$id)}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setDeleteState(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 rounded-full border border-warm-gray-dark/40 bg-white px-3 py-1.5">
                  <span className="text-xs font-medium text-charcoal-muted">
                    {t("common.enabled")}
                  </span>
                  <Switch
                    checked={item.enabled}
                    onCheckedChange={(nextChecked) => {
                      toggleMutation.mutate(
                        { offeringId: item.$id, enabled: nextChecked },
                        {
                          onSuccess: () =>
                            toast.success(
                              nextChecked
                                ? t("offerings.feedback.enabled")
                                : t("offerings.feedback.disabled"),
                            ),
                          onError: (error) =>
                            toast.error(
                              getErrorMessage(
                                error,
                                t("offerings.feedback.toggleError"),
                              ),
                            ),
                        },
                      );
                    }}
                    disabled={toggleMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <AdminPageHeader
        title={t("offerings.title")}
        subtitle={t("offerings.subtitle")}
        action={
          <Button asChild size="sm" className="gap-2">
            <Link to={ROUTES.ADMIN_OFFERING_NEW}>
              <Plus className="h-4 w-4" />
              {t("offerings.actions.new")}
            </Link>
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full flex-wrap justify-start gap-2 rounded-[24px] bg-warm-gray/70 p-2">
          <TabsTrigger value="all" className="rounded-2xl px-4 py-2.5">
            {t("offerings.tabs.all")}
          </TabsTrigger>
          {CATEGORY_OPTIONS.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="rounded-2xl px-4 py-2.5"
            >
              {t(`offerings.tabs.${cat}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {["all", ...CATEGORY_OPTIONS].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-subtle" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("offerings.searchPlaceholder")}
                className="pl-9"
              />
            </div>
            {renderCards()}
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation */}
      <AdminFormDialog
        open={!!deleteState}
        onOpenChange={(open) => {
          if (!open) setDeleteState(null);
        }}
        title={t("offerings.delete.title")}
        onSubmit={handleDeleteConfirm}
        isSubmitting={deleteMutation.isPending}
        submitLabel={t("offerings.delete.confirm")}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-charcoal-muted">
            {t("offerings.delete.description")}
          </p>
          {deleteState && (
            <div className="rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/25 px-4 py-3 text-sm text-charcoal">
              <span className="font-medium">
                {resolveField(deleteState, "title") || deleteState.slug}
              </span>
            </div>
          )}
        </div>
      </AdminFormDialog>
    </div>
  );
}
