/**
 * AdminSlotFormPage — página dedicada para crear/editar un offering_slot.
 * Rutas: /app/agenda/slots/new  |  /app/agenda/slots/:id/edit
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
  useAdminSlots,
  useCreateSlot,
  useUpdateSlot,
} from "@/hooks/useAdmin";
import { useCurrency } from "@/hooks/useCurrency";
import { resolveField } from "@/lib/i18n-data";
import ROUTES from "@/constants/routes";

const EMPTY_FORM = {
  offering_id: "",
  start_at: "",
  end_at: "",
  date_label: "",
  capacity_total: 0,
  capacity_taken: 0,
  price_override: "",
  location_label: "",
  status: "open",
  notes: "",
  enabled: true,
};

const SLOT_STATUS_OPTIONS = ["open", "full", "cancelled", "completed"];

function SettingRow({ label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/20 px-4 py-3">
      <p className="text-sm font-medium text-charcoal">{label}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AdminSlotFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("admin");
  const { t: tOff } = useTranslation("offerings");
  const { currency } = useCurrency();
  const isEditing = !!id;

  const { data: offerings = [] } = useAdminOfferings();
  const { data: slots = [], isLoading: slotsLoading } = useAdminSlots();
  const createMutation = useCreateSlot();
  const updateMutation = useUpdateSlot();

  const [form, setForm] = useState(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);

  const existing = isEditing ? slots.find((s) => s.$id === id) : null;

  useEffect(() => {
    if (isEditing && existing && !initialized) {
      setForm({
        offering_id: existing.offering_id ?? "",
        start_at: existing.start_at ? existing.start_at.slice(0, 16) : "",
        end_at: existing.end_at ? existing.end_at.slice(0, 16) : "",
        date_label: existing.date_label ?? "",
        capacity_total: existing.capacity_total ?? 0,
        capacity_taken: existing.capacity_taken ?? 0,
        price_override: existing.price_override ?? "",
        location_label: existing.location_label ?? "",
        status: existing.status ?? "open",
        notes: existing.notes ?? "",
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

    if (!form.offering_id) {
      toast.error(t("offeringSlots.fields.offering") + " es obligatorio");
      return;
    }
    if (!form.start_at) {
      toast.error(t("offeringSlots.fields.startAt") + " es obligatorio");
      return;
    }

    const payload = {
      ...form,
      capacity_total: Number(form.capacity_total) || 0,
      capacity_taken: Number(form.capacity_taken) || 0,
      price_override: form.price_override
        ? Number(form.price_override)
        : null,
    };

    const mutation = isEditing ? updateMutation : createMutation;
    const mutationPayload = isEditing
      ? { slotId: id, data: payload }
      : payload;

    mutation.mutate(mutationPayload, {
      onSuccess: () => {
        toast.success(
          isEditing
            ? t("offeringSlots.feedback.updated")
            : t("offeringSlots.feedback.created"),
        );
        navigate(ROUTES.ADMIN_AGENDA);
      },
      onError: (error) => {
        const msg =
          error instanceof Error && error.message
            ? error.message
            : t("offeringSlots.feedback.saveError");
        toast.error(msg);
      },
    });
  }

  const offeringOptions = offerings.map((o) => ({
    value: o.$id,
    label: resolveField(o, "title") || o.slug,
    description: tOff(`categories.${o.category}`),
    keywords: [o.title_es, o.title_en, o.slug],
  }));

  const statusOptions = SLOT_STATUS_OPTIONS.map((s) => ({
    value: s,
    label: tOff(`slotStatus.${s}`),
  }));

  const isBusy = createMutation.isPending || updateMutation.isPending;

  if (isEditing && slotsLoading) {
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
          isEditing
            ? t("offeringSlots.dialog.editTitle")
            : t("offeringSlots.dialog.createTitle")
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-warm-gray-dark/40">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>{t("offeringSlots.fields.offering")}</Label>
              <SearchCombobox
                value={form.offering_id}
                onValueChange={(v) => setField("offering_id", v)}
                options={offeringOptions}
                placeholder={t("offeringSlots.fields.offering")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("offeringSlots.fields.startAt")}</Label>
                <Input
                  type="datetime-local"
                  value={form.start_at}
                  onChange={(e) => setField("start_at", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("offeringSlots.fields.endAt")}</Label>
                <Input
                  type="datetime-local"
                  value={form.end_at}
                  onChange={(e) => setField("end_at", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("offeringSlots.fields.dateLabel")}</Label>
              <Input
                value={form.date_label}
                onChange={(e) => setField("date_label", e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("offeringSlots.fields.capacity")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.capacity_total}
                  onChange={(e) => setField("capacity_total", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("offeringSlots.fields.taken")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.capacity_taken}
                  onChange={(e) => setField("capacity_taken", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("offeringSlots.fields.priceOverride")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-charcoal-muted select-none pointer-events-none z-10">
                    {currency}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    className="pl-12"
                    value={form.price_override}
                    onChange={(e) => setField("price_override", e.target.value)}
                    placeholder={t(
                      "offeringSlots.fields.priceOverridePlaceholder",
                    )}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("offeringSlots.fields.location")}</Label>
                <Input
                  value={form.location_label}
                  onChange={(e) => setField("location_label", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("offeringSlots.fields.status")}</Label>
              <SearchCombobox
                value={form.status}
                onValueChange={(v) => setField("status", v)}
                options={statusOptions}
                placeholder={t("offeringSlots.fields.status")}
                searchPlaceholder={t("common.search")}
                emptyMessage={t("common.noData")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("offeringSlots.fields.notes")}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
              />
            </div>

            <SettingRow
              label={t("offeringSlots.fields.enabled")}
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
            {isBusy
              ? t("common.save") + "..."
              : isEditing
                ? t("offeringSlots.actions.save")
                : t("offeringSlots.actions.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
