/**
 * AdminAgendaPage — listado de offering_slots y availability_blocks.
 * Ruta: /app/agenda
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Pencil,
  Plus,
  Search,
  ShieldBan,
  Trash2,
  XCircle,
} from "lucide-react";
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
  useAdminSlots,
  useToggleSlot,
  useCancelSlot,
  useDeleteSlot,
  useAdminBlocks,
  useDeleteBlock,
  useAdminOfferings,
} from "@/hooks/useAdmin";
import { useCurrency } from "@/hooks/useCurrency";
import { resolveField } from "@/lib/i18n-data";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import ROUTES from "@/constants/routes";

const STATUS_BADGE = {
  open: "sage",
  full: "default",
  cancelled: "destructive",
  completed: "outline",
};

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AdminAgendaPage() {
  const { t } = useTranslation("admin");
  const { t: tOff } = useTranslation("offerings");
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState("slots");
  const [slotSearch, setSlotSearch] = useState("");
  const [blockSearch, setBlockSearch] = useState("");
  const [slotDeleteState, setSlotDeleteState] = useState(null);
  const [blockDeleteState, setBlockDeleteState] = useState(null);

  const { data: slots = [], isLoading: slotsLoading } = useAdminSlots();
  const { data: blocks = [], isLoading: blocksLoading } = useAdminBlocks();
  const { data: offerings = [] } = useAdminOfferings();

  const toggleSlot = useToggleSlot();
  const cancelSlot = useCancelSlot();
  const deleteSlot = useDeleteSlot();
  const deleteBlock = useDeleteBlock();

  const offeringMap = Object.fromEntries(offerings.map((o) => [o.$id, o]));

  function getOfferingTitle(offeringId) {
    const o = offeringMap[offeringId];
    return o ? resolveField(o, "title") || o.slug : offeringId;
  }

  // Slots filter
  const filteredSlots = slots.filter((slot) => {
    const query = slotSearch.trim().toLowerCase();
    if (!query) return true;
    const title = getOfferingTitle(slot.offering_id);
    return [title, slot.location_label, slot.date_label]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  // Blocks filter
  const filteredBlocks = blocks.filter((block) => {
    const query = blockSearch.trim().toLowerCase();
    if (!query) return true;
    const title = block.offering_id
      ? getOfferingTitle(block.offering_id)
      : "";
    return [title, block.reason, block.block_type]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  function handleSlotDeleteConfirm() {
    if (!slotDeleteState) return;
    deleteSlot.mutate(slotDeleteState.$id, {
      onSuccess: () => {
        setSlotDeleteState(null);
        toast.success(t("offeringSlots.feedback.deleted"));
      },
      onError: (error) =>
        toast.error(
          getErrorMessage(error, t("offeringSlots.feedback.deleteError")),
        ),
    });
  }

  function handleBlockDeleteConfirm() {
    if (!blockDeleteState) return;
    deleteBlock.mutate(blockDeleteState.$id, {
      onSuccess: () => {
        setBlockDeleteState(null);
        toast.success(t("blocks.feedback.deleted"));
      },
      onError: (error) =>
        toast.error(getErrorMessage(error, t("blocks.feedback.deleted"))),
    });
  }

  function renderSlotCards() {
    if (slotsLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[28px]" />
          ))}
        </div>
      );
    }

    if (filteredSlots.length === 0) {
      return (
        <Card className="border-dashed border-warm-gray-dark/50 bg-white/70">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-gray text-charcoal-subtle">
              <CalendarDays className="h-6 w-6" />
            </div>
            <p className="text-base font-medium text-charcoal">
              {t("offeringSlots.empty.title")}
            </p>
            <p className="max-w-md text-sm text-charcoal-muted">
              {t("offeringSlots.empty.description")}
            </p>
            <Button asChild className="gap-2">
              <Link to={ROUTES.ADMIN_SLOT_NEW}>
                <Plus className="h-4 w-4" />
                {t("offeringSlots.actions.new")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {filteredSlots.map((slot) => {
          const spotsLeft =
            slot.capacity_total > 0
              ? slot.capacity_total - slot.capacity_taken
              : null;

          return (
            <Card
              key={slot.$id}
              className={cn(
                "overflow-hidden border-warm-gray-dark/40 bg-white",
                !slot.enabled && "opacity-65",
              )}
            >
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-charcoal">
                      {getOfferingTitle(slot.offering_id)}
                    </h3>
                    <Badge variant={STATUS_BADGE[slot.status] ?? "outline"}>
                      {tOff(`slotStatus.${slot.status}`)}
                    </Badge>
                    {!slot.enabled && (
                      <Badge variant="outline">{t("common.disabled")}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-charcoal-muted">
                    <span>{formatDateTime(slot.start_at)}</span>
                    {slot.location_label && <span>{slot.location_label}</span>}
                    {spotsLeft !== null && (
                      <span>
                        {slot.capacity_taken}/{slot.capacity_total}
                      </span>
                    )}
                    {slot.price_override != null && (
                      <span className="font-medium text-sage">
                        {formatPrice(slot.price_override)}
                      </span>
                    )}
                  </div>
                  {slot.notes && (
                    <p className="mt-2 text-xs text-charcoal-muted line-clamp-1">
                      {slot.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {slot.status === "open" && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full text-amber-600 hover:bg-amber-50"
                      onClick={() =>
                        cancelSlot.mutate(slot.$id, {
                          onSuccess: () =>
                            toast.success(t("offeringSlots.feedback.cancelled")),
                          onError: (error) =>
                            toast.error(
                              getErrorMessage(
                                error,
                                t("offeringSlots.feedback.saveError"),
                              ),
                            ),
                        })
                      }
                      disabled={cancelSlot.isPending}
                      title={t("common.cancelAction")}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full"
                    asChild
                  >
                    <Link to={ROUTES.ADMIN_SLOT_EDIT(slot.$id)}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setSlotDeleteState(slot)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 rounded-full border border-warm-gray-dark/40 bg-white px-3 py-1.5">
                    <span className="text-xs font-medium text-charcoal-muted">
                      {t("common.enabled")}
                    </span>
                    <Switch
                      checked={slot.enabled}
                      onCheckedChange={(nextChecked) => {
                        toggleSlot.mutate(
                          { slotId: slot.$id, enabled: nextChecked },
                          {
                            onError: (error) =>
                              toast.error(
                                getErrorMessage(
                                  error,
                                  t("offeringSlots.feedback.saveError"),
                                ),
                              ),
                          },
                        );
                      }}
                      disabled={toggleSlot.isPending}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  function renderBlockCards() {
    if (blocksLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[28px]" />
          ))}
        </div>
      );
    }

    if (filteredBlocks.length === 0) {
      return (
        <Card className="border-dashed border-warm-gray-dark/50 bg-white/70">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-gray text-charcoal-subtle">
              <ShieldBan className="h-6 w-6" />
            </div>
            <p className="text-base font-medium text-charcoal">
              {t("blocks.title")}
            </p>
            <p className="max-w-md text-sm text-charcoal-muted">
              {t("blocks.subtitle")}
            </p>
            <Button asChild className="gap-2">
              <Link to={ROUTES.ADMIN_BLOCK_NEW}>
                <Plus className="h-4 w-4" />
                {t("blocks.actions.new")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {filteredBlocks.map((block) => (
          <Card
            key={block.$id}
            className={cn(
              "overflow-hidden border-warm-gray-dark/40 bg-white",
              !block.enabled && "opacity-65",
            )}
          >
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {tOff(`blockType.${block.block_type}`)}
                  </Badge>
                  {block.offering_id && (
                    <span className="text-sm text-charcoal-muted">
                      {getOfferingTitle(block.offering_id)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-charcoal-muted">
                  <span>{formatDateTime(block.start_at)}</span>
                  <span>→</span>
                  <span>{formatDateTime(block.end_at)}</span>
                </div>
                {block.reason && (
                  <p className="mt-2 text-xs text-charcoal-muted">
                    {block.reason}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full"
                  asChild
                >
                  <Link to={ROUTES.ADMIN_BLOCK_EDIT(block.$id)}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setBlockDeleteState(block)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
        title={t("offeringSlots.title")}
        subtitle={t("offeringSlots.subtitle")}
        action={
          <Button asChild size="sm" className="gap-2">
            <Link
              to={
                activeTab === "slots"
                  ? ROUTES.ADMIN_SLOT_NEW
                  : ROUTES.ADMIN_BLOCK_NEW
              }
            >
              <Plus className="h-4 w-4" />
              {activeTab === "slots"
                ? t("offeringSlots.actions.new")
                : t("blocks.actions.new")}
            </Link>
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full flex-wrap justify-start gap-2 rounded-[24px] bg-warm-gray/70 p-2">
          <TabsTrigger
            value="slots"
            className="gap-2 rounded-2xl px-4 py-2.5"
          >
            <CalendarDays className="h-4 w-4" />
            {t("offeringSlots.title")}
          </TabsTrigger>
          <TabsTrigger
            value="blocks"
            className="gap-2 rounded-2xl px-4 py-2.5"
          >
            <ShieldBan className="h-4 w-4" />
            {t("blocks.title")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slots" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-subtle" />
            <Input
              value={slotSearch}
              onChange={(e) => setSlotSearch(e.target.value)}
              placeholder={t("common.search")}
              className="pl-9"
            />
          </div>
          {renderSlotCards()}
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-subtle" />
            <Input
              value={blockSearch}
              onChange={(e) => setBlockSearch(e.target.value)}
              placeholder={t("common.search")}
              className="pl-9"
            />
          </div>
          {renderBlockCards()}
        </TabsContent>
      </Tabs>

      {/* Slot Delete Confirmation */}
      <AdminFormDialog
        open={!!slotDeleteState}
        onOpenChange={(open) => {
          if (!open) setSlotDeleteState(null);
        }}
        title={t("common.confirmDelete")}
        onSubmit={handleSlotDeleteConfirm}
        isSubmitting={deleteSlot.isPending}
        submitLabel={t("common.delete")}
      >
        <p className="text-sm leading-6 text-charcoal-muted">
          {t("common.confirmDelete")}
        </p>
        {slotDeleteState && (
          <div className="mt-3 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/25 px-4 py-3 text-sm text-charcoal font-medium">
            {getOfferingTitle(slotDeleteState.offering_id)} —{" "}
            {formatDateTime(slotDeleteState.start_at)}
          </div>
        )}
      </AdminFormDialog>

      {/* Block Delete Confirmation */}
      <AdminFormDialog
        open={!!blockDeleteState}
        onOpenChange={(open) => {
          if (!open) setBlockDeleteState(null);
        }}
        title={t("common.confirmDelete")}
        onSubmit={handleBlockDeleteConfirm}
        isSubmitting={deleteBlock.isPending}
        submitLabel={t("common.delete")}
      >
        <p className="text-sm leading-6 text-charcoal-muted">
          {t("common.confirmDelete")}
        </p>
        {blockDeleteState && (
          <div className="mt-3 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/25 px-4 py-3 text-sm text-charcoal font-medium">
            {tOff(`blockType.${blockDeleteState.block_type}`)} —{" "}
            {blockDeleteState.reason || "—"}
          </div>
        )}
      </AdminFormDialog>
    </div>
  );
}
