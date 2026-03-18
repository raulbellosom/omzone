/**
 * AdminSessionsPage — CRUD completo de sesiones.
 * Ruta: /app/sessions
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import {
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import ImageSourceSelector from "@/components/shared/ImageSourceSelector";
import SearchCombobox from "@/components/shared/SearchCombobox";
import {
  useAdminClasses,
  useAdminInstructors,
  useAdminSessions,
  useCreateSession,
  useDeleteSession,
  useToggleSession,
  useUpdateSession,
} from "@/hooks/useAdmin";
import { resolveField } from "@/lib/i18n-data";
import { getPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";

const STATUS_BADGE = {
  scheduled: "sage",
  full: "default",
  cancelled: "destructive",
  completed: "outline",
};

const STATUS_VALUES = ["scheduled", "full", "completed", "cancelled"];

const EMPTY_FORM = {
  class_id: "",
  session_date: "",
  end_date: "",
  capacity_total: 15,
  price_override: "",
  instructor_id: "",
  status: "scheduled",
  location_label: "",
  cover_image_id: "",
  cover_image_bucket: "",
  enabled: true,
};

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function toInputDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-subtle" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="border-dashed border-warm-gray-dark/50 bg-white/70">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-gray text-charcoal-subtle">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-medium text-charcoal">{title}</p>
          <p className="mt-1 max-w-md text-sm text-charcoal-muted">
            {description}
          </p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

function SessionActions({
  onEdit,
  onDelete,
  enabled,
  onToggle,
  toggleDisabled,
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 rounded-full"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 rounded-full border border-warm-gray-dark/40 bg-white px-3 py-1.5">
        <span className="text-xs font-medium text-charcoal-muted">Enabled</span>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={toggleDisabled}
        />
      </div>
    </div>
  );
}

export default function AdminSessionsPage() {
  const { t, i18n } = useTranslation("admin");
  const { currency } = useCurrency();
  const dateFnsLocale = i18n.language === "es" ? es : enUS;

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: sessions = [], isLoading } = useAdminSessions();
  const { data: classes = [] } = useAdminClasses();
  const { data: instructors = [] } = useAdminInstructors();

  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const toggleSession = useToggleSession();
  const deleteSession = useDeleteSession();

  const classOptions = classes.map((item) => ({
    value: item.$id,
    label: resolveField(item, "title") || item.slug,
    description: item.slug,
    keywords: [item.title_es, item.title_en, item.slug],
  }));

  const instructorOptions = [
    {
      value: "",
      label: t("sessions.fields.instructorPlaceholder", "Sin instructor"),
      description: t(
        "sessions.fields.instructorHint",
        "Usar instructor principal de la clase",
      ),
      keywords: ["none", "null", "sin instructor"],
    },
    ...instructors.map((item) => ({
      value: item.$id,
      label: item.full_name,
      description: item.specialties,
      keywords: [item.slug, item.short_bio, item.specialties],
    })),
  ];

  const filteredSessions = sessions.filter((item) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const instructor = instructors.find(
      (entry) => entry.$id === item.instructor_id,
    );

    return [
      resolveField(item.class ?? {}, "title"),
      item.location_label,
      item.status,
      instructor?.full_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  function openCreateDialog() {
    setEditingSession(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(item) {
    setEditingSession(item);
    setForm({
      class_id: item.class_id ?? "",
      session_date: toInputDateTime(item.session_date),
      end_date: toInputDateTime(item.end_date),
      capacity_total: item.capacity_total ?? 15,
      price_override: item.price_override ?? "",
      instructor_id: item.instructor_id ?? "",
      status: item.status ?? "scheduled",
      location_label: item.location_label ?? "",
      cover_image_id: item.cover_image_id ?? "",
      cover_image_bucket: item.cover_image_bucket ?? "",
      enabled: item.enabled ?? true,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.class_id) {
      toast.error(
        t("sessions.validation.classRequired", "Selecciona una clase"),
      );
      return;
    }
    if (!form.session_date) {
      toast.error(
        t("sessions.validation.dateRequired", "Selecciona fecha de inicio"),
      );
      return;
    }

    const sessionDateIso = toIsoDateTime(form.session_date);
    if (!sessionDateIso) {
      toast.error(
        t("sessions.validation.dateInvalid", "Fecha de inicio invalida"),
      );
      return;
    }

    const endDateIso = toIsoDateTime(form.end_date);
    const payload = {
      class_id: form.class_id,
      session_date: sessionDateIso,
      end_date: endDateIso,
      capacity_total: Number(form.capacity_total) || 0,
      price_override:
        form.price_override === "" || form.price_override === null
          ? null
          : Number(form.price_override),
      instructor_id: form.instructor_id || null,
      status: form.status,
      location_label: form.location_label || null,
      cover_image_id: form.cover_image_id || null,
      enabled: Boolean(form.enabled),
    };

    const mutation = editingSession ? updateSession : createSession;
    const mutationPayload = editingSession
      ? { sessionId: editingSession.$id, data: payload }
      : payload;

    mutation.mutate(mutationPayload, {
      onSuccess: () => {
        setDialogOpen(false);
        toast.success(
          editingSession
            ? t("sessions.feedback.updated", "Sesion actualizada")
            : t("sessions.feedback.created", "Sesion creada"),
        );
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(
            error,
            t("sessions.feedback.saveError", "No se pudo guardar la sesion"),
          ),
        );
      },
    });
  }

  function handleToggle(item, enabled) {
    toggleSession.mutate(
      { sessionId: item.$id, enabled },
      {
        onSuccess: () => {
          toast.success(
            enabled
              ? t("sessions.feedback.enabled", "Sesion habilitada")
              : t("sessions.feedback.disabled", "Sesion deshabilitada"),
          );
        },
        onError: (error) => {
          toast.error(
            getErrorMessage(
              error,
              t(
                "sessions.feedback.toggleError",
                "No se pudo actualizar el estado",
              ),
            ),
          );
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;

    deleteSession.mutate(deleteTarget.$id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success(t("sessions.feedback.deleted", "Sesion eliminada"));
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(
            error,
            t("sessions.feedback.deleteError", "No se pudo eliminar la sesion"),
          ),
        );
      },
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 animate-fade-in-up">
      <AdminPageHeader
        title={t("sessions.title", "Sesiones")}
        subtitle={t(
          "sessions.subtitle",
          "Administra agenda, capacidad, estado e instructor de cada sesion.",
        )}
        action={
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={openCreateDialog}
          >
            <Plus className="h-4 w-4" />
            {t("sessions.actions.new", "Nueva sesion")}
          </Button>
        }
      />

      <div className="mb-5">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t(
            "sessions.searchPlaceholder",
            "Buscar por clase, estatus o ubicacion",
          )}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-[28px]" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={t("sessions.empty.title", "Todavia no hay sesiones")}
          description={t(
            "sessions.empty.description",
            "Crea una sesion y asignale clase, horario y capacidad para empezar a vender reservas.",
          )}
          action={
            <Button type="button" onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("sessions.actions.new", "Nueva sesion")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((item) => {
            const classLabel =
              resolveField(item.class ?? {}, "title") ||
              t("classes.unassigned", "Sin asignar");
            const instructor = instructors.find(
              (entry) => entry.$id === item.instructor_id,
            );
            const taken = Number(item.capacity_taken ?? 0);
            const total = Math.max(Number(item.capacity_total ?? 0), 1);
            const occupancy = Math.min(Math.round((taken / total) * 100), 100);

            return (
              <Card
                key={item.$id}
                className={cn(
                  "rounded-[28px] border-warm-gray-dark/40 bg-white/85 shadow-sm",
                  item.enabled ? "" : "opacity-70",
                )}
              >
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 flex flex-row items-start gap-3">
                      {/* Thumbnail de portada (sesión o clase) */}
                      {(item.cover_image_id || item.class?.cover_image_id) && (
                        <img
                          src={getPreviewUrl(
                            item.cover_image_id || item.class?.cover_image_id,
                            (item.cover_image_id
                              ? item.cover_image_bucket
                              : item.class?.cover_image_bucket) ?? BUCKET_PUBLIC_MEDIA,
                            120,
                            120,
                            80,
                          )}
                          alt=""
                          aria-hidden="true"
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-warm-gray-dark/20"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-charcoal">
                            {classLabel}
                          </p>
                          <Badge
                            variant={STATUS_BADGE[item.status] ?? "default"}
                          >
                            {t(`sessions.status.${item.status}`)}
                          </Badge>
                        </div>
                        <p className="text-sm text-charcoal-muted">
                          {format(
                            new Date(item.session_date),
                            "EEEE d MMM · HH:mm",
                            {
                              locale: dateFnsLocale,
                            },
                          )}
                          {item.end_date
                            ? ` - ${format(new Date(item.end_date), "HH:mm", {
                                locale: dateFnsLocale,
                              })}`
                            : ""}
                          {item.location_label
                            ? ` · ${item.location_label}`
                            : ""}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-charcoal-subtle">
                          <UserRound className="h-3.5 w-3.5" />
                          <span>
                            {instructor?.full_name ||
                              t(
                                "sessions.fields.instructorPlaceholder",
                                "Sin instructor",
                              )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <SessionActions
                      onEdit={() => openEditDialog(item)}
                      onDelete={() => setDeleteTarget(item)}
                      enabled={item.enabled ?? true}
                      onToggle={(enabled) => handleToggle(item, enabled)}
                      toggleDisabled={toggleSession.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-charcoal-muted">
                      <span>
                        {t("sessions.fields.taken", "Reservados")}: {taken}
                      </span>
                      <span>
                        {t("sessions.fields.capacity", "Cupo")}: {total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-warm-gray">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-500",
                          occupancy >= 90 ? "bg-amber-400" : "bg-sage",
                        )}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AdminFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          editingSession
            ? t("sessions.dialog.editTitle", "Editar sesion")
            : t("sessions.dialog.createTitle", "Nueva sesion")
        }
        onSubmit={handleSubmit}
        isSubmitting={createSession.isPending || updateSession.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("sessions.fields.class", "Clase")}</Label>
            <SearchCombobox
              value={form.class_id}
              onValueChange={(next) =>
                setForm((prev) => ({ ...prev, class_id: next }))
              }
              options={classOptions}
              placeholder={t(
                "sessions.fields.classPlaceholder",
                "Busca y selecciona una clase",
              )}
              searchPlaceholder={t(
                "sessions.fields.classSearch",
                "Filtrar clases",
              )}
              emptyMessage={t(
                "sessions.fields.classEmpty",
                "No hay clases con ese criterio",
              )}
            />
          </div>

          <ImageSourceSelector
            fileId={form.cover_image_id}
            bucketId={form.cover_image_bucket}
            onFileChange={(fileId, bucketId) =>
              setForm((prev) => ({
                ...prev,
                cover_image_id: fileId,
                cover_image_bucket: bucketId,
              }))
            }
            label={t(
              "sessions.fields.coverImage",
              "Imagen de portada (opcional)",
            )}
            aspectRatio="4/3"
          />

          <div className="space-y-1.5">
            <Label>{t("sessions.fields.instructor", "Instructor")}</Label>
            <SearchCombobox
              value={form.instructor_id}
              onValueChange={(next) =>
                setForm((prev) => ({ ...prev, instructor_id: next || "" }))
              }
              options={instructorOptions}
              placeholder={t(
                "sessions.fields.instructorSearchPlaceholder",
                "Selecciona instructor (opcional)",
              )}
              searchPlaceholder={t(
                "sessions.fields.instructorSearch",
                "Filtrar instructores",
              )}
              emptyMessage={t(
                "sessions.fields.instructorEmpty",
                "No hay instructores con ese criterio",
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("sessions.fields.sessionDate", "Inicio")}</Label>
              <Input
                type="datetime-local"
                value={form.session_date}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    session_date: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("sessions.fields.endDate", "Fin")}</Label>
              <Input
                type="datetime-local"
                value={form.end_date}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, end_date: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("sessions.fields.capacity", "Cupo")}</Label>
              <Input
                type="number"
                min="1"
                max="200"
                value={form.capacity_total}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    capacity_total: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                {t(
                  "sessions.fields.priceOverride",
                  "Precio especial (opcional)",
                )}
              </Label>
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
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      price_override: event.target.value,
                    }))
                  }
                  placeholder={t(
                    "sessions.fields.priceOverridePlaceholder",
                    "Vacio = precio base de la clase",
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("sessions.fields.location", "Ubicacion")}</Label>
            <Input
              value={form.location_label}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  location_label: event.target.value,
                }))
              }
              placeholder={t(
                "sessions.fields.locationPlaceholder",
                "Sala principal",
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("sessions.fields.status", "Estado")}</Label>
            <div className="flex flex-wrap gap-2">
              {STATUS_VALUES.map((status) => (
                <Button
                  key={status}
                  type="button"
                  size="sm"
                  variant={form.status === status ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setForm((prev) => ({ ...prev, status }))}
                >
                  {t(`sessions.status.${status}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/20 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-charcoal">
                {t("sessions.fields.enabled", "Habilitada")}
              </p>
              <p className="text-xs text-charcoal-muted">
                {t(
                  "sessions.hints.enabled",
                  "Desactivar oculta la sesion del flujo publico sin perder historial.",
                )}
              </p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>
        </div>
      </AdminFormDialog>

      <AdminFormDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("sessions.delete.title", "Confirmar eliminacion")}
        description={t(
          "sessions.delete.description",
          "Esta accion no se puede deshacer y fallara si existen reservas asociadas.",
        )}
        onSubmit={handleDeleteConfirm}
        submitLabel={t("sessions.delete.confirm", "Eliminar sesion")}
        isSubmitting={deleteSession.isPending}
      >
        <div className="rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/30 px-4 py-3 text-sm text-charcoal-muted">
          <p className="font-medium text-charcoal">
            {t("sessions.delete.target", "Sesion seleccionada")}
          </p>
          <p className="mt-1">
            {deleteTarget
              ? resolveField(deleteTarget.class ?? {}, "title")
              : ""}
          </p>
        </div>
      </AdminFormDialog>
    </div>
  );
}
