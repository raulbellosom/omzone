/**
 * AdminAgendaPage - agenda workspace with calendar + events + blocks + locations + inventory.
 */
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import SearchCombobox from "@/components/shared/SearchCombobox";
import OmzCalendar from "@/components/shared/OmzCalendar";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import {
  useAdminOfferings,
  useAdminEvents,
  useToggleEvent,
  useCancelEvent,
  useDeleteEvent,
  useAdminBlocks,
  useDeleteBlock,
  useAdminLocationProfiles,
  useCreateLocationProfile,
  useDeleteLocationProfile,
  useAdminDailyInventory,
  useMaterializeDailyInventory,
} from "@/hooks/useAdmin";
import { CURRENCY_OPTIONS } from "@/lib/currency";
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

const EMPTY_LOCATION = {
  name: "",
  address: "",
  map_url: "",
  notes: "",
  enabled: true,
};
const EMPTY_INVENTORY = {
  offering_id: "",
  from_date: "",
  to_date: "",
  currency: "MXN",
};

function msg(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function toIsoEndExclusive(dateValue) {
  if (!dateValue) return null;
  const d = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

function SettingRow({ label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/20 px-4 py-3">
      <p className="text-sm font-medium text-charcoal">{label}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AdminAgendaPage() {
  const { t } = useTranslation("admin");
  const { t: tOff } = useTranslation("offerings");
  const navigate = useNavigate();

  const [tab, setTab] = useState("calendar");
  const [search, setSearch] = useState("");
  const [offeringId, setOfferingId] = useState("");
  const [eventToDelete, setEventToDelete] = useState(null);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [locationForm, setLocationForm] = useState(EMPTY_LOCATION);
  const [inventoryForm, setInventoryForm] = useState(EMPTY_INVENTORY);

  const { data: offerings = [] } = useAdminOfferings();
  const { data: events = [], isLoading: loadingEvents } = useAdminEvents({
    offeringId: offeringId || undefined,
  });
  const { data: blocks = [], isLoading: loadingBlocks } = useAdminBlocks({
    offeringId: offeringId || undefined,
  });
  const { data: locations = [], isLoading: loadingLocations } =
    useAdminLocationProfiles();
  const { data: inventory = [], isLoading: loadingInventory } =
    useAdminDailyInventory({
      offeringId: inventoryForm.offering_id || offeringId || undefined,
      fromDate: inventoryForm.from_date
        ? new Date(`${inventoryForm.from_date}T00:00:00Z`).toISOString()
        : undefined,
      toDate: inventoryForm.to_date
        ? toIsoEndExclusive(inventoryForm.to_date)
        : undefined,
    });

  const toggleEvent = useToggleEvent();
  const cancelEvent = useCancelEvent();
  const deleteEvent = useDeleteEvent();
  const deleteBlock = useDeleteBlock();
  const createLocation = useCreateLocationProfile();
  const deleteLocation = useDeleteLocationProfile();
  const materializeInventory = useMaterializeDailyInventory();

  const offeringMap = Object.fromEntries(offerings.map((o) => [o.$id, o]));
  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) =>
      [
        e.title,
        e.instructor_name,
        e.location_label,
        resolveField(offeringMap[e.offering_id] ?? {}, "title"),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [events, offeringMap, search]);

  const filteredBlocks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return blocks;
    return blocks.filter((b) =>
      [
        b.reason,
        b.block_type,
        resolveField(offeringMap[b.offering_id] ?? {}, "title"),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [blocks, offeringMap, search]);

  // Transform events for OmzCalendar
  const calendarEvents = useMemo(() => {
    return filteredEvents.map((e) => ({
      id: e.$id,
      title:
        e.title ||
        resolveField(offeringMap[e.offering_id] ?? {}, "title") ||
        t("agendaWorkspace.calendar.eventFallback"),
      start: e.start_at,
      end: e.end_at || e.start_at,
      status: e.status || "open",
      location_label: e.location_label,
    }));
  }, [filteredEvents, offeringMap, t]);

  // Transform blocks for OmzCalendar
  const calendarBlocks = useMemo(() => {
    return filteredBlocks.map((b) => ({
      id: b.$id,
      start: b.start_at,
      end: b.end_at,
      reason: b.reason,
    }));
  }, [filteredBlocks]);

  const offeringOptions = [
    { value: "", label: t("blocks.fields.offeringGlobalOption") },
    ...offerings.map((o) => ({
      value: o.$id,
      label: resolveField(o, "title") || o.slug,
      description: tOff(`categories.${o.category}`),
    })),
  ];

  function offeringTitle(id) {
    return (
      resolveField(offeringMap[id] ?? {}, "title") ||
      offeringMap[id]?.slug ||
      id ||
      "-"
    );
  }

  function submitLocation(event) {
    event.preventDefault();
    if (!locationForm.name.trim()) {
      toast.error(t("offerings.validation.locationNameRequired"));
      return;
    }
    createLocation.mutate(
      {
        name: locationForm.name.trim(),
        address: locationForm.address.trim() || null,
        map_url: locationForm.map_url.trim() || null,
        notes: locationForm.notes.trim() || null,
        enabled: locationForm.enabled,
      },
      {
        onSuccess: () => {
          toast.success(t("offerings.feedback.locationCreated"));
          setLocationForm(EMPTY_LOCATION);
        },
        onError: (error) =>
          toast.error(msg(error, t("offerings.feedback.locationCreateError"))),
      },
    );
  }

  function submitMaterializeInventory() {
    if (
      !inventoryForm.offering_id ||
      !inventoryForm.from_date ||
      !inventoryForm.to_date
    ) {
      toast.error(t("agendaWorkspace.inventory.validationMissingRange"));
      return;
    }
    materializeInventory.mutate(
      {
        offering_id: inventoryForm.offering_id,
        from_date: inventoryForm.from_date,
        to_date: toIsoEndExclusive(inventoryForm.to_date),
        currency: inventoryForm.currency,
      },
      {
        onSuccess: () => toast.success(t("agendaWorkspace.inventory.materialized")),
        onError: (error) =>
          toast.error(msg(error, t("agendaWorkspace.inventory.materializeError"))),
      },
    );
  }

  // Handle calendar event click
  function handleEventClick(event) {
    navigate(ROUTES.ADMIN_SLOT_EDIT(event.id));
  }

  // Handle calendar date click (create new event)
  function handleDateClick(date) {
    navigate(ROUTES.ADMIN_SLOT_NEW);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <AdminPageHeader
        title={t("offeringSlots.title")}
        subtitle={t("agendaWorkspace.subtitle")}
        action={
          <Button asChild size="sm" className="gap-2">
            <Link
              to={
                tab === "blocks"
                  ? ROUTES.ADMIN_BLOCK_NEW
                  : ROUTES.ADMIN_SLOT_NEW
              }
            >
              <Plus className="h-4 w-4" />
              {tab === "blocks"
                ? t("blocks.actions.new")
                : t("offeringSlots.actions.new")}
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <SearchCombobox
          value={offeringId}
          onValueChange={(value) => {
            setOfferingId(value);
            setInventoryForm((prev) => ({ ...prev, offering_id: value }));
          }}
          options={offeringOptions}
          placeholder={t("blocks.fields.offering")}
          searchPlaceholder={t("common.search")}
          emptyMessage={t("common.noData")}
        />
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-subtle" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 w-full flex-wrap justify-start gap-2 rounded-[24px] bg-warm-gray/70 p-2">
          <TabsTrigger
            value="calendar"
            className="gap-2 rounded-2xl px-4 py-2.5"
          >
            <CalendarDays className="h-4 w-4" />
            {t("agendaWorkspace.tabs.calendar")}
          </TabsTrigger>
          <TabsTrigger value="events" className="rounded-2xl px-4 py-2.5">
            {t("agendaWorkspace.tabs.events")}
          </TabsTrigger>
          <TabsTrigger value="blocks" className="rounded-2xl px-4 py-2.5">
            {t("agendaWorkspace.tabs.blocks")}
          </TabsTrigger>
          <TabsTrigger value="locations" className="rounded-2xl px-4 py-2.5">
            {t("agendaWorkspace.tabs.locations")}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-2xl px-4 py-2.5">
            {t("agendaWorkspace.tabs.inventory")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {(loadingEvents || loadingBlocks) && (
            <div className="flex items-center gap-2 text-sm text-charcoal-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("agendaWorkspace.loadingAgenda")}
            </div>
          )}
          <OmzCalendar
            events={calendarEvents}
            blocks={calendarBlocks}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        </TabsContent>

        <TabsContent value="events" className="space-y-3">
          {loadingEvents ? (
            <Skeleton className="h-40 rounded-[24px]" />
          ) : (
            filteredEvents.map((event) => (
              <Card
                key={event.$id}
                className={cn(
                  "border-warm-gray-dark/40 bg-white",
                  !event.enabled && "opacity-60",
                )}
              >
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <h3 className="text-base font-semibold text-charcoal">
                        {event.title || offeringTitle(event.offering_id)}
                      </h3>
                      <Badge variant={STATUS_BADGE[event.status] ?? "outline"}>
                        {tOff(`slotStatus.${event.status}`)}
                      </Badge>
                    </div>
                    <p className="text-sm text-charcoal-muted">
                      {offeringTitle(event.offering_id)}
                    </p>
                    <p className="mt-1 text-sm text-charcoal-muted">
                      {formatDateTime(event.start_at)}
                      {event.location_label ? ` · ${event.location_label}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.status === "open" && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full text-amber-600"
                        onClick={() => cancelEvent.mutate(event.$id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button type="button" size="icon" variant="ghost" asChild>
                      <Link to={ROUTES.ADMIN_SLOT_EDIT(event.$id)}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full text-red-500"
                      onClick={() => setEventToDelete(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={event.enabled}
                      onCheckedChange={(enabled) =>
                        toggleEvent.mutate({ slotId: event.$id, enabled })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="blocks" className="space-y-3">
          {loadingBlocks ? (
            <Skeleton className="h-32 rounded-[24px]" />
          ) : (
            filteredBlocks.map((block) => (
              <Card
                key={block.$id}
                className="border-warm-gray-dark/40 bg-white"
              >
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <Badge variant="outline">
                      {tOff(`blockType.${block.block_type}`)}
                    </Badge>
                    <p className="mt-2 text-sm text-charcoal-muted">
                      {formatDateTime(block.start_at)} {"—"}{" "}
                      {formatDateTime(block.end_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" asChild>
                      <Link to={ROUTES.ADMIN_BLOCK_EDIT(block.$id)}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => setBlockToDelete(block)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card className="border-warm-gray-dark/40">
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={submitLocation}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>{t("offerings.fields.locationName")}</Label>
                    <Input
                      value={locationForm.name}
                      onChange={(e) =>
                        setLocationForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("offerings.fields.locationAddress")}</Label>
                    <Input
                      value={locationForm.address}
                      onChange={(e) =>
                        setLocationForm((p) => ({
                          ...p,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Input
                  value={locationForm.map_url}
                  onChange={(e) =>
                    setLocationForm((p) => ({ ...p, map_url: e.target.value }))
                  }
                  placeholder={t("offerings.fields.locationMapUrl")}
                />
                <Textarea
                  value={locationForm.notes}
                  onChange={(e) =>
                    setLocationForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder={t("offerings.fields.locationNotes")}
                />
                <SettingRow
                  label={t("common.enabled")}
                  checked={locationForm.enabled}
                  onCheckedChange={(enabled) =>
                    setLocationForm((p) => ({ ...p, enabled }))
                  }
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={createLocation.isPending}>
                    {t("offerings.actions.create")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {loadingLocations ? (
            <Skeleton className="h-28 rounded-[24px]" />
          ) : (
            locations.map((loc) => (
              <Card key={loc.$id} className="border-warm-gray-dark/40 bg-white">
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p className="font-medium text-charcoal">
                      {loc.name || loc.$id}
                    </p>
                    <p className="text-sm text-charcoal-muted">
                      {loc.address || "-"}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => setLocationToDelete(loc)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card className="border-warm-gray-dark/40">
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("blocks.fields.offering")}</Label>
                  <SearchCombobox
                    value={inventoryForm.offering_id}
                    onValueChange={(value) =>
                      setInventoryForm((p) => ({ ...p, offering_id: value }))
                    }
                    options={offeringOptions}
                    placeholder={t("blocks.fields.offering")}
                    searchPlaceholder={t("common.search")}
                    emptyMessage={t("common.noData")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("agendaWorkspace.inventory.currency")}</Label>
                  <SearchCombobox
                    value={inventoryForm.currency}
                    onValueChange={(value) =>
                      setInventoryForm((p) => ({ ...p, currency: value }))
                    }
                    options={CURRENCY_OPTIONS}
                    placeholder={t("agendaWorkspace.inventory.currency")}
                    searchPlaceholder={t("common.search")}
                    emptyMessage={t("common.noData")}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("agendaWorkspace.inventory.fromDate")}</Label>
                  <Input
                    type="date"
                    value={inventoryForm.from_date}
                    onChange={(e) =>
                      setInventoryForm((p) => ({
                        ...p,
                        from_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("agendaWorkspace.inventory.toDate")}</Label>
                  <Input
                    type="date"
                    value={inventoryForm.to_date}
                    onChange={(e) =>
                      setInventoryForm((p) => ({ ...p, to_date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={submitMaterializeInventory}
                  disabled={materializeInventory.isPending}
                >
                  {t("agendaWorkspace.inventory.materializeFromRules")}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warm-gray-dark/40">
            <CardContent className="p-6">
              {loadingInventory ? (
                <div className="flex items-center gap-2 text-sm text-charcoal-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("agendaWorkspace.inventory.loading")}
                </div>
              ) : inventory.length === 0 ? (
                <p className="text-sm text-charcoal-muted">
                  {t("agendaWorkspace.inventory.empty")}
                </p>
              ) : (
                <div className="space-y-2">
                  {inventory.map((row) => (
                    <div
                      key={row.$id}
                      className="rounded-2xl border border-warm-gray-dark/40 px-4 py-3 text-sm"
                    >
                      {t("agendaWorkspace.inventory.rowSummary", {
                        date: new Date(row.date).toLocaleDateString(),
                        status: t(`agendaWorkspace.inventory.status.${row.status}`, {
                          defaultValue: row.status,
                        }),
                        taken: row.capacity_taken,
                        total: row.capacity_total,
                      })}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AdminFormDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        title={t("common.confirmDelete")}
        onSubmit={() =>
          eventToDelete &&
          deleteEvent.mutate(eventToDelete.$id, {
            onSuccess: () => {
              setEventToDelete(null);
              toast.success(t("offeringSlots.feedback.deleted"));
            },
            onError: (error) =>
              toast.error(msg(error, t("offeringSlots.feedback.deleteError"))),
          })
        }
        isSubmitting={deleteEvent.isPending}
        submitLabel={t("common.delete")}
      >
        <p className="text-sm text-charcoal-muted">
          {t("common.confirmDelete")}
        </p>
      </AdminFormDialog>

      <AdminFormDialog
        open={!!blockToDelete}
        onOpenChange={(open) => !open && setBlockToDelete(null)}
        title={t("common.confirmDelete")}
        onSubmit={() =>
          blockToDelete &&
          deleteBlock.mutate(blockToDelete.$id, {
            onSuccess: () => {
              setBlockToDelete(null);
              toast.success(t("blocks.feedback.deleted"));
            },
            onError: (error) =>
              toast.error(msg(error, t("blocks.feedback.deleteError"))),
          })
        }
        isSubmitting={deleteBlock.isPending}
        submitLabel={t("common.delete")}
      >
        <p className="text-sm text-charcoal-muted">
          {t("common.confirmDelete")}
        </p>
      </AdminFormDialog>

      <AdminFormDialog
        open={!!locationToDelete}
        onOpenChange={(open) => !open && setLocationToDelete(null)}
        title={t("common.confirmDelete")}
        onSubmit={() =>
          locationToDelete &&
          deleteLocation.mutate(locationToDelete.$id, {
            onSuccess: () => {
              setLocationToDelete(null);
              toast.success(t("offerings.feedback.deleted"));
            },
            onError: (error) =>
              toast.error(msg(error, t("offerings.feedback.deleteError"))),
          })
        }
        isSubmitting={deleteLocation.isPending}
        submitLabel={t("common.delete")}
      >
        <p className="text-sm text-charcoal-muted">
          {t("common.confirmDelete")}
        </p>
      </AdminFormDialog>
    </div>
  );
}
