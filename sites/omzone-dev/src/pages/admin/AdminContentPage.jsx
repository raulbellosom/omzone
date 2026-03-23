/**
 * AdminContentPage — listado de secciones editoriales (content_sections).
 * Ruta: /app/content
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import {
  useAdminContentSections,
  useAdminOfferings,
  useToggleContentSection,
  useDeleteContentSection,
} from "@/hooks/useAdmin";
import { resolveField } from "@/lib/i18n-data";
import { cn } from "@/lib/utils";
import ROUTES from "@/constants/routes";

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AdminContentPage() {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useState("");
  const [deleteState, setDeleteState] = useState(null);

  const { data: sections = [], isLoading } = useAdminContentSections();
  const { data: offerings = [] } = useAdminOfferings();
  const toggleMutation = useToggleContentSection();
  const deleteMutation = useDeleteContentSection();
  const offeringMap = Object.fromEntries(offerings.map((item) => [item.$id, item]));

  const filtered = sections.filter((item) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [item.section_key, item.title_es, item.title_en]
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
        toast.success(t("contentSections.feedback.deleted"));
      },
      onError: (error) =>
        toast.error(
          getErrorMessage(error, t("contentSections.feedback.saveError")),
        ),
    });
  }

  function renderCards() {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-[28px]" />
          ))}
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <Card className="border-dashed border-warm-gray-dark/50 bg-white/70">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-gray text-charcoal-subtle">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-base font-medium text-charcoal">
              {t("contentSections.empty.title")}
            </p>
            <p className="max-w-md text-sm text-charcoal-muted">
              {t("contentSections.empty.description")}
            </p>
            <Button asChild className="gap-2">
              <Link to={ROUTES.ADMIN_CONTENT_NEW}>
                <Plus className="h-4 w-4" />
                {t("contentSections.actions.new")}
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
              "overflow-hidden border-warm-gray-dark/40 bg-white",
              !item.enabled && "opacity-65",
            )}
          >
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-charcoal">
                    {resolveField(item, "title") || item.section_key}
                  </h3>
                  <Badge variant="outline">{item.section_key}</Badge>
                  {!item.enabled && (
                    <Badge variant="outline">{t("common.disabled")}</Badge>
                  )}
                </div>
                {(item.subtitle_es || item.subtitle_en) && (
                  <p className="text-sm text-charcoal-muted line-clamp-1">
                    {resolveField(item, "subtitle")}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-charcoal-muted">
                  <span className="rounded-full bg-warm-gray/50 px-3 py-1.5">
                    {t("contentSections.chips.scope")}:{" "}
                    {t(`contentSections.scope.${item.scope || "global"}`)}
                  </span>
                  {item.offering_id && (
                    <span className="rounded-full bg-warm-gray/50 px-3 py-1.5">
                      {t("contentSections.chips.offering")}:{" "}
                      {resolveField(offeringMap[item.offering_id], "title") ||
                        item.offering_id}
                    </span>
                  )}
                  <span className="rounded-full bg-warm-gray/50 px-3 py-1.5">
                    {t("contentSections.fields.displayOrder")}:{" "}
                    {item.display_order ?? 0}
                  </span>
                  {item.cta_url && (
                    <span className="rounded-full bg-warm-gray/50 px-3 py-1.5">
                      {t("contentSections.chips.cta")}
                      {" -> "}
                      {item.cta_url}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full"
                  asChild
                >
                  <Link to={ROUTES.ADMIN_CONTENT_EDIT(item.$id)}>
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
                        { sectionId: item.$id, enabled: nextChecked },
                        {
                          onError: (error) =>
                            toast.error(
                              getErrorMessage(
                                error,
                                t("contentSections.feedback.saveError"),
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
        title={t("contentSections.title")}
        subtitle={t("contentSections.subtitle")}
        action={
          <Button asChild size="sm" className="gap-2">
            <Link to={ROUTES.ADMIN_CONTENT_NEW}>
              <Plus className="h-4 w-4" />
              {t("contentSections.actions.new")}
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-subtle" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="pl-9"
          />
        </div>
        {renderCards()}
      </div>

      {/* Delete Confirmation */}
      <AdminFormDialog
        open={!!deleteState}
        onOpenChange={(open) => {
          if (!open) setDeleteState(null);
        }}
        title={t("common.confirmDelete")}
        onSubmit={handleDeleteConfirm}
        isSubmitting={deleteMutation.isPending}
        submitLabel={t("common.delete")}
      >
        <p className="text-sm leading-6 text-charcoal-muted">
          {t("common.confirmDelete")}
        </p>
        {deleteState && (
          <div className="mt-3 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/25 px-4 py-3 text-sm text-charcoal font-medium">
            {resolveField(deleteState, "title") || deleteState.section_key}
          </div>
        )}
      </AdminFormDialog>
    </div>
  );
}
