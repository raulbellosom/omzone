/**
 * AdminBlockFormPage — página dedicada para crear/editar un availability_block.
 * Rutas: /app/agenda/blocks/new  |  /app/agenda/blocks/:id/edit
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
import SearchCombobox from "@/components/shared/SearchCombobox";
import {
  useAdminOfferings,
  useAdminBlocks,
  useCreateBlock,
  useUpdateBlock,
} from "@/hooks/useAdmin";
import { resolveField } from "@/lib/i18n-data";
import ROUTES from "@/constants/routes";

const EMPTY_FORM = {
  offering_id: "",
  start_at: "",
  end_at: "",
  reason: "",
  block_type: "holiday",
  enabled: true,
};

const BLOCK_TYPE_OPTIONS = ["holiday", "maintenance", "private_event", "custom"];

function SettingRow({ label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/20 px-4 py-3">
      <p className="text-sm font-medium text-charcoal">{label}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AdminBlockFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("admin");
  const { t: tOff } = useTranslation("offerings");
  const isEditing = !!id;

  const { data: offerings = [] } = useAdminOfferings();
  const { data: blocks = [], isLoading: blocksLoading } = useAdminBlocks();
  const createMutation = useCreateBlock();
  const updateMutation = useUpdateBlock();

  const [form, setForm] = useState(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);

  const existing = isEditing ? blocks.find((b) => b.$id === id) : null;

  useEffect(() => {
    if (isEditing && existing && !initialized) {
      setForm({
        offering_id: existing.offering_id ?? "",
        start_at: existing.start_at ? existing.start_at.slice(0, 16) : "",
        end_at: existing.end_at ? existing.end_at.slice(0, 16) : "",
        reason: existing.reason ?? "",
        block_type: existing.block_type ?? "holiday",
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

    if (!form.start_at || !form.end_at) {
      toast.error(
        t("blocks.fields.startAt") +
          " / " +
          t("blocks.fields.endAt") +
          " obligatorios",
      );
      return;
    }

    const payload = {
      ...form,
      offering_id: form.offering_id || null,
    };

    const mutation = isEditing ? updateMutation : createMutation;
    const mutationPayload = isEditing
      ? { blockId: id, data: payload }
      : payload;

    mutation.mutate(mutationPayload, {
      onSuccess: () => {
        toast.success(
          isEditing
            ? t("blocks.feedback.updated")
            : t("blocks.feedback.created"),
        );
        navigate(ROUTES.ADMIN_AGENDA);
      },
      onError: (error) => {
        const msg =
          error instanceof Error && error.message
            ? error.message
            : t("blocks.feedback.created");
        toast.error(msg);
      },
    });
  }

  const offeringOptions = [
    { value: "", label: "— Global —" },
    ...offerings.map((o) => ({
      value: o.$id,
      label: resolveField(o, "title") || o.slug,
      description: tOff(`categories.${o.category}`),
      keywords: [o.title_es, o.title_en, o.slug],
    })),
  ];

  const blockTypeOptions = BLOCK_TYPE_OPTIONS.map((bt) => ({
    value: bt,
    label: tOff(`blockType.${bt}`),
  }));

  const isBusy = createMutation.isPending || updateMutation.isPending;

  if (isEditing && blocksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Link
        to={ROUTES.ADMIN_AGENDA}
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("offeringSlots.title")}
      </Link>

      <AdminPageHeader
        title={
          isEditing ? t("blocks.title") : t("blocks.actions.new")
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-warm-gray-dark/40">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>{t("blocks.fields.offering")}</Label>
              <SearchCombobox
                value={form.offering_id}
                onValueChange={(v) => setField("offering_id", v)}
                options={offeringOptions}
                placeholder={t("blocks.fields.offering")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("blocks.fields.startAt")}</Label>
                <Input
                  type="datetime-local"
                  value={form.start_at}
                  onChange={(e) => setField("start_at", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("blocks.fields.endAt")}</Label>
                <Input
                  type="datetime-local"
                  value={form.end_at}
                  onChange={(e) => setField("end_at", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("blocks.fields.blockType")}</Label>
              <SearchCombobox
                value={form.block_type}
                onValueChange={(v) => setField("block_type", v)}
                options={blockTypeOptions}
                placeholder={t("blocks.fields.blockType")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("blocks.fields.reason")}</Label>
              <Textarea
                value={form.reason}
                onChange={(e) => setField("reason", e.target.value)}
              />
            </div>

            <SettingRow
              label={t("common.enabled")}
              checked={form.enabled}
              onCheckedChange={(checked) => setField("enabled", checked)}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" asChild>
            <Link to={ROUTES.ADMIN_AGENDA}>{t("common.cancel")}</Link>
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? t("common.save") + "..." : t("blocks.actions.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
