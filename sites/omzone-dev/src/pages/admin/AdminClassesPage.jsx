/**
 * AdminClassesPage — módulo central para clases, instructores y tipos.
 * Ruta: /app/classes
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Layers3,
  Pencil,
  Plus,
  Search,
  Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import MediaUpload from "@/components/shared/MediaUpload";
import SearchCombobox from "@/components/shared/SearchCombobox";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import {
  useAdminClasses,
  useAdminClassTypes,
  useAdminInstructors,
  useCreateClass,
  useCreateClassType,
  useCreateInstructor,
  useDeleteClass,
  useDeleteClassType,
  useDeleteInstructor,
  useToggleClass,
  useToggleClassType,
  useToggleInstructor,
  useUpdateClass,
  useUpdateClassType,
  useUpdateInstructor,
} from "@/hooks/useAdmin";
import { formatMXN } from "@/lib/currency";
import { resolveField } from "@/lib/i18n-data";
import { cn } from "@/lib/utils";

const EMPTY_CLASS_FORM = {
  slug: "",
  title_es: "",
  title_en: "",
  summary_es: "",
  summary_en: "",
  description_es: "",
  description_en: "",
  class_type_id: "",
  difficulty: "all_levels",
  duration_min: 60,
  base_price: 0,
  cover_image_id: "",
  is_featured: false,
  enabled: true,
};

const EMPTY_INSTRUCTOR_FORM = {
  slug: "",
  full_name: "",
  short_bio: "",
  specialties: "",
  display_order: 0,
  enabled: true,
};

const EMPTY_CLASS_TYPE_FORM = {
  slug: "",
  name_es: "",
  name_en: "",
  description: "",
  enabled: true,
};

const DIFFICULTY_OPTIONS = [
  "beginner",
  "intermediate",
  "advanced",
  "all_levels",
];

const DIFFICULTY_BADGE = {
  beginner: "sage",
  intermediate: "default",
  advanced: "destructive",
  all_levels: "outline",
};

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function MetricCard({ icon: Icon, label, value, hint }) {
  return (
    <Card className="border-warm-gray-dark/40 bg-[radial-gradient(circle_at_top_left,rgba(181,201,188,0.22),transparent_55%),linear-gradient(180deg,#fff_0%,#faf7f0_100%)]">
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 text-sage shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-charcoal-subtle">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-charcoal">{value}</p>
          <p className="mt-1 text-xs text-charcoal-muted">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
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

function SettingRow({ label, description, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/20 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-charcoal">{label}</p>
        {description && (
          <p className="text-xs text-charcoal-muted">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
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

function EntityActions({
  onEdit,
  onDelete,
  enabled,
  onToggle,
  toggleLabel,
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
        <span className="text-xs font-medium text-charcoal-muted">
          {toggleLabel}
        </span>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={toggleDisabled}
        />
      </div>
    </div>
  );
}

export default function AdminClassesPage() {
  const { t } = useTranslation("admin");
  const [activeTab, setActiveTab] = useState("classes");
  const [classSearch, setClassSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [classTypeSearch, setClassTypeSearch] = useState("");
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false);
  const [classTypeDialogOpen, setClassTypeDialogOpen] = useState(false);
  const [deleteState, setDeleteState] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [editingClassType, setEditingClassType] = useState(null);
  const [classForm, setClassForm] = useState(EMPTY_CLASS_FORM);
  const [instructorForm, setInstructorForm] = useState(EMPTY_INSTRUCTOR_FORM);
  const [classTypeForm, setClassTypeForm] = useState(EMPTY_CLASS_TYPE_FORM);

  const { data: classes = [], isLoading: classesLoading } = useAdminClasses();
  const { data: instructors = [], isLoading: instructorsLoading } =
    useAdminInstructors();
  const { data: classTypes = [], isLoading: classTypesLoading } =
    useAdminClassTypes();

  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const toggleClass = useToggleClass();
  const deleteClass = useDeleteClass();

  const createInstructor = useCreateInstructor();
  const updateInstructor = useUpdateInstructor();
  const toggleInstructor = useToggleInstructor();
  const deleteInstructor = useDeleteInstructor();

  const createClassType = useCreateClassType();
  const updateClassType = useUpdateClassType();
  const toggleClassType = useToggleClassType();
  const deleteClassType = useDeleteClassType();

  const classTypeOptions = classTypes.map((item) => ({
    value: item.$id,
    label: resolveField(item, "name") || item.slug,
    description: item.slug,
    keywords: [item.name_es, item.name_en, item.description],
  }));

  const filteredClasses = classes.filter((item) => {
    const query = classSearch.trim().toLowerCase();
    if (!query) return true;

    return [
      item.title_es,
      item.title_en,
      item.slug,
      resolveField(item.class_type, "name"),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const filteredInstructors = instructors.filter((item) => {
    const query = instructorSearch.trim().toLowerCase();
    if (!query) return true;

    return [item.full_name, item.slug, item.short_bio, item.specialties]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const filteredClassTypes = classTypes.filter((item) => {
    const query = classTypeSearch.trim().toLowerCase();
    if (!query) return true;

    return [item.name_es, item.name_en, item.slug, item.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  function openCreateClass() {
    setEditingClass(null);
    setClassForm(EMPTY_CLASS_FORM);
    setClassDialogOpen(true);
  }

  function openEditClass(item) {
    setEditingClass(item);
    setClassForm({
      slug: item.slug ?? "",
      title_es: item.title_es ?? "",
      title_en: item.title_en ?? "",
      summary_es: item.summary_es ?? "",
      summary_en: item.summary_en ?? "",
      description_es: item.description_es ?? "",
      description_en: item.description_en ?? "",
      class_type_id: item.class_type_id ?? "",
      difficulty: item.difficulty ?? "all_levels",
      duration_min: item.duration_min ?? 60,
      base_price: item.base_price ?? 0,
      cover_image_id: item.cover_image_id ?? "",
      is_featured: item.is_featured ?? false,
      enabled: item.enabled ?? true,
    });
    setClassDialogOpen(true);
  }

  function openCreateInstructor() {
    setEditingInstructor(null);
    setInstructorForm(EMPTY_INSTRUCTOR_FORM);
    setInstructorDialogOpen(true);
  }

  function openEditInstructor(item) {
    setEditingInstructor(item);
    setInstructorForm({
      slug: item.slug ?? "",
      full_name: item.full_name ?? "",
      short_bio: item.short_bio ?? "",
      specialties: item.specialties ?? "",
      display_order: item.display_order ?? 0,
      enabled: item.enabled ?? true,
    });
    setInstructorDialogOpen(true);
  }

  function openCreateClassType() {
    setEditingClassType(null);
    setClassTypeForm(EMPTY_CLASS_TYPE_FORM);
    setClassTypeDialogOpen(true);
  }

  function openEditClassType(item) {
    setEditingClassType(item);
    setClassTypeForm({
      slug: item.slug ?? "",
      name_es: item.name_es ?? "",
      name_en: item.name_en ?? "",
      description: item.description ?? "",
      enabled: item.enabled ?? true,
    });
    setClassTypeDialogOpen(true);
  }

  function handleClassSubmit() {
    if (!classForm.title_es.trim()) {
      toast.error(
        t(
          "classes.validation.titleRequired",
          "El título en español es obligatorio",
        ),
      );
      return;
    }

    if (!classForm.class_type_id) {
      toast.error(
        t(
          "classes.validation.dependenciesRequired",
          "Selecciona un tipo de clase",
        ),
      );
      return;
    }

    const payload = {
      ...classForm,
      duration_min: Number(classForm.duration_min) || 0,
      base_price: Number(classForm.base_price) || 0,
    };

    const mutation = editingClass ? updateClass : createClass;
    const mutationPayload = editingClass
      ? { classId: editingClass.$id, data: payload }
      : payload;

    mutation.mutate(mutationPayload, {
      onSuccess: () => {
        setClassDialogOpen(false);
        toast.success(
          editingClass
            ? t("classes.feedback.updated", "Clase actualizada")
            : t("classes.feedback.created", "Clase creada"),
        );
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(
            error,
            t("classes.feedback.saveError", "No se pudo guardar la clase"),
          ),
        );
      },
    });
  }

  function handleInstructorSubmit() {
    if (!instructorForm.full_name.trim()) {
      toast.error(
        t(
          "instructors.validation.nameRequired",
          "El nombre del instructor es obligatorio",
        ),
      );
      return;
    }

    const payload = {
      ...instructorForm,
      display_order: Number(instructorForm.display_order) || 0,
    };

    const mutation = editingInstructor ? updateInstructor : createInstructor;
    const mutationPayload = editingInstructor
      ? { instructorId: editingInstructor.$id, data: payload }
      : payload;

    mutation.mutate(mutationPayload, {
      onSuccess: () => {
        setInstructorDialogOpen(false);
        toast.success(
          editingInstructor
            ? t("instructors.feedback.updated", "Instructor actualizado")
            : t("instructors.feedback.created", "Instructor creado"),
        );
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(
            error,
            t(
              "instructors.feedback.saveError",
              "No se pudo guardar el instructor",
            ),
          ),
        );
      },
    });
  }

  function handleClassTypeSubmit() {
    if (!classTypeForm.name_es.trim()) {
      toast.error(
        t(
          "classTypes.validation.nameRequired",
          "El nombre del tipo es obligatorio",
        ),
      );
      return;
    }

    const mutation = editingClassType ? updateClassType : createClassType;
    const mutationPayload = editingClassType
      ? { classTypeId: editingClassType.$id, data: classTypeForm }
      : classTypeForm;

    mutation.mutate(mutationPayload, {
      onSuccess: () => {
        setClassTypeDialogOpen(false);
        toast.success(
          editingClassType
            ? t("classTypes.feedback.updated", "Tipo actualizado")
            : t("classTypes.feedback.created", "Tipo creado"),
        );
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(
            error,
            t("classTypes.feedback.saveError", "No se pudo guardar el tipo"),
          ),
        );
      },
    });
  }

  function confirmDelete(kind, item) {
    setDeleteState({ kind, item });
  }

  function handleDeleteConfirm() {
    if (!deleteState) return;

    const { kind, item } = deleteState;
    const config = {
      class: {
        mutation: deleteClass,
        id: item.$id,
        success: t("classes.feedback.deleted", "Clase eliminada"),
        fallback: t(
          "classes.feedback.deleteError",
          "No se pudo eliminar la clase",
        ),
      },
      instructor: {
        mutation: deleteInstructor,
        id: item.$id,
        success: t("instructors.feedback.deleted", "Instructor eliminado"),
        fallback: t(
          "instructors.feedback.deleteError",
          "No se pudo eliminar el instructor",
        ),
      },
      classType: {
        mutation: deleteClassType,
        id: item.$id,
        success: t("classTypes.feedback.deleted", "Tipo eliminado"),
        fallback: t(
          "classTypes.feedback.deleteError",
          "No se pudo eliminar el tipo",
        ),
      },
    }[kind];

    config.mutation.mutate(config.id, {
      onSuccess: () => {
        setDeleteState(null);
        toast.success(config.success);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, config.fallback));
      },
    });
  }

  function renderClassCards() {
    if (classesLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-[28px]" />
          ))}
        </div>
      );
    }

    if (filteredClasses.length === 0) {
      return (
        <EmptyState
          icon={BookOpen}
          title={t("classes.empty.title", "Todavía no hay clases configuradas")}
          description={t(
            "classes.empty.description",
            "Crea la primera clase y relaciónala con su instructor y tipo para que el catálogo quede completo.",
          )}
          action={
            <Button type="button" onClick={openCreateClass} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("classes.actions.new", "Nueva clase")}
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-3">
        {filteredClasses.map((item) => (
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
                  <Badge
                    variant={DIFFICULTY_BADGE[item.difficulty] ?? "default"}
                  >
                    {t(
                      `classes.difficulty.${item.difficulty}`,
                      item.difficulty,
                    )}
                  </Badge>
                  {item.is_featured && (
                    <Badge variant="outline">
                      {t("classes.fields.featured", "Destacada")}
                    </Badge>
                  )}
                  {!item.enabled && (
                    <Badge variant="outline">
                      {t("common.disabled", "Deshabilitada")}
                    </Badge>
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
                  <div className="rounded-2xl bg-white/85 px-4 py-3 text-right shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-charcoal-subtle">
                      {t("classes.fields.basePrice", "Precio base")}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-charcoal">
                      {formatMXN(item.base_price ?? 0)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-charcoal-muted">
                  {item.summary_es ||
                    item.summary_en ||
                    t(
                      "classes.emptySummary",
                      "Agrega un resumen breve para contextualizar esta clase.",
                    )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-charcoal-muted">
                  <span className="rounded-full bg-white/80 px-3 py-1.5">
                    {t("classes.fields.classType", "Tipo")}:{" "}
                    {resolveField(item.class_type, "name") ||
                      t("classes.unassigned", "Sin asignar")}
                  </span>
                  <span className="rounded-full bg-white/80 px-3 py-1.5">
                    {t("classes.fields.duration", "Duración")}:{" "}
                    {item.duration_min} min
                  </span>
                </div>
              </div>
              <EntityActions
                onEdit={() => openEditClass(item)}
                onDelete={() => confirmDelete("class", item)}
                enabled={item.enabled}
                onToggle={(nextChecked) => {
                  toggleClass.mutate(
                    { classId: item.$id, enabled: nextChecked },
                    {
                      onSuccess: () =>
                        toast.success(
                          nextChecked
                            ? t("classes.feedback.enabled", "Clase habilitada")
                            : t(
                                "classes.feedback.disabled",
                                "Clase deshabilitada",
                              ),
                        ),
                      onError: (error) =>
                        toast.error(
                          getErrorMessage(
                            error,
                            t(
                              "classes.feedback.toggleError",
                              "No se pudo actualizar el estado",
                            ),
                          ),
                        ),
                    },
                  );
                }}
                toggleLabel={t("common.enabled", "Activa")}
                toggleDisabled={toggleClass.isPending}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderInstructorCards() {
    if (instructorsLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-[28px]" />
          ))}
        </div>
      );
    }

    if (filteredInstructors.length === 0) {
      return (
        <EmptyState
          icon={UserRound}
          title={t("instructors.empty.title", "Todavía no hay instructores")}
          description={t(
            "instructors.empty.description",
            "Registra a tus instructores para poder asignarlos en las clases y sesiones.",
          )}
          action={
            <Button
              type="button"
              onClick={openCreateInstructor}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("instructors.actions.new", "Nuevo instructor")}
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-3">
        {filteredInstructors.map((item) => (
          <Card
            key={item.$id}
            className={cn(
              "border-warm-gray-dark/40 bg-white",
              !item.enabled && "opacity-65",
            )}
          >
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-charcoal">
                    {item.full_name}
                  </h3>
                  <Badge variant="outline">{item.slug}</Badge>
                  {!item.enabled && (
                    <Badge variant="outline">
                      {t("common.disabled", "Deshabilitado")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-6 text-charcoal-muted">
                  {item.short_bio ||
                    t(
                      "instructors.emptyBio",
                      "Agrega una biografía corta para presentar al instructor.",
                    )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-charcoal-muted">
                  <span className="rounded-full bg-warm-gray/50 px-3 py-1.5">
                    {t("instructors.fields.order", "Orden")}:{" "}
                    {item.display_order ?? 0}
                  </span>
                  {item.specialties && (
                    <span className="rounded-full bg-warm-gray/50 px-3 py-1.5">
                      {item.specialties}
                    </span>
                  )}
                </div>
              </div>
              <EntityActions
                onEdit={() => openEditInstructor(item)}
                onDelete={() => confirmDelete("instructor", item)}
                enabled={item.enabled}
                onToggle={(nextChecked) => {
                  toggleInstructor.mutate(
                    { instructorId: item.$id, enabled: nextChecked },
                    {
                      onSuccess: () =>
                        toast.success(
                          nextChecked
                            ? t(
                                "instructors.feedback.enabled",
                                "Instructor habilitado",
                              )
                            : t(
                                "instructors.feedback.disabled",
                                "Instructor deshabilitado",
                              ),
                        ),
                      onError: (error) =>
                        toast.error(
                          getErrorMessage(
                            error,
                            t(
                              "instructors.feedback.toggleError",
                              "No se pudo actualizar el estado",
                            ),
                          ),
                        ),
                    },
                  );
                }}
                toggleLabel={t("common.enabled", "Activo")}
                toggleDisabled={toggleInstructor.isPending}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderClassTypeCards() {
    if (classTypesLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-[28px]" />
          ))}
        </div>
      );
    }

    if (filteredClassTypes.length === 0) {
      return (
        <EmptyState
          icon={Layers3}
          title={t("classTypes.empty.title", "Todavía no hay tipos de clase")}
          description={t(
            "classTypes.empty.description",
            "Crea la taxonomía de clases para que el catálogo y los filtros públicos tengan estructura.",
          )}
          action={
            <Button
              type="button"
              onClick={openCreateClassType}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("classTypes.actions.new", "Nuevo tipo")}
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-3">
        {filteredClassTypes.map((item) => (
          <Card
            key={item.$id}
            className={cn(
              "border-warm-gray-dark/40 bg-white",
              !item.enabled && "opacity-65",
            )}
          >
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-charcoal">
                    {resolveField(item, "name")}
                  </h3>
                  <Badge variant="outline">{item.slug}</Badge>
                  {!item.enabled && (
                    <Badge variant="outline">
                      {t("common.disabled", "Deshabilitado")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-6 text-charcoal-muted">
                  {item.description ||
                    t(
                      "classTypes.emptyDescription",
                      "Agrega una descripción breve para contextualizar este tipo en el panel y el sitio público.",
                    )}
                </p>
              </div>
              <EntityActions
                onEdit={() => openEditClassType(item)}
                onDelete={() => confirmDelete("classType", item)}
                enabled={item.enabled}
                onToggle={(nextChecked) => {
                  toggleClassType.mutate(
                    { classTypeId: item.$id, enabled: nextChecked },
                    {
                      onSuccess: () =>
                        toast.success(
                          nextChecked
                            ? t(
                                "classTypes.feedback.enabled",
                                "Tipo habilitado",
                              )
                            : t(
                                "classTypes.feedback.disabled",
                                "Tipo deshabilitado",
                              ),
                        ),
                      onError: (error) =>
                        toast.error(
                          getErrorMessage(
                            error,
                            t(
                              "classTypes.feedback.toggleError",
                              "No se pudo actualizar el estado",
                            ),
                          ),
                        ),
                    },
                  );
                }}
                toggleLabel={t("common.enabled", "Activo")}
                toggleDisabled={toggleClassType.isPending}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const topMetrics = [
    {
      icon: BookOpen,
      label: t("classes.metrics.catalog", "Clases"),
      value: classes.length,
      hint: t(
        "classes.metrics.catalogHint",
        "Catálogo principal listo para sesiones y venta.",
      ),
    },
    {
      icon: UserRound,
      label: t("classes.metrics.instructors", "Instructores"),
      value: instructors.length,
      hint: t(
        "classes.metrics.instructorsHint",
        "Personas disponibles para asignación.",
      ),
    },
    {
      icon: Layers3,
      label: t("classes.metrics.types", "Tipos"),
      value: classTypes.length,
      hint: t(
        "classes.metrics.typesHint",
        "Taxonomía usada por el catálogo público.",
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <AdminPageHeader
        title={t("classes.title", "Clases")}
        subtitle={t(
          "classes.subtitle",
          "Gestiona clases, instructores y tipos desde un mismo módulo reutilizable.",
        )}
        action={
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => {
              if (activeTab === "classes") openCreateClass();
              if (activeTab === "instructors") openCreateInstructor();
              if (activeTab === "classTypes") openCreateClassType();
            }}
          >
            <Plus className="h-4 w-4" />
            {activeTab === "classes" && t("classes.actions.new", "Nueva clase")}
            {activeTab === "instructors" &&
              t("instructors.actions.new", "Nuevo instructor")}
            {activeTab === "classTypes" &&
              t("classTypes.actions.new", "Nuevo tipo")}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {topMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full flex-wrap justify-start gap-2 rounded-[24px] bg-warm-gray/70 p-2">
          <TabsTrigger
            value="classes"
            className="gap-2 rounded-2xl px-4 py-2.5"
          >
            <BookOpen className="h-4 w-4" />
            {t("classes.tabs.catalog", "Clases")}
          </TabsTrigger>
          <TabsTrigger
            value="instructors"
            className="gap-2 rounded-2xl px-4 py-2.5"
          >
            <UserRound className="h-4 w-4" />
            {t("classes.tabs.instructors", "Instructores")}
          </TabsTrigger>
          <TabsTrigger
            value="classTypes"
            className="gap-2 rounded-2xl px-4 py-2.5"
          >
            <Layers3 className="h-4 w-4" />
            {t("classes.tabs.types", "Tipos")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <SearchField
                value={classSearch}
                onChange={setClassSearch}
                placeholder={t(
                  "classes.searchPlaceholder",
                  "Buscar por título, instructor, tipo o slug",
                )}
              />
              {renderClassCards()}
            </div>
            <Card className="border-warm-gray-dark/40 bg-charcoal text-white shadow-card">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sand">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {t("classes.side.title", "Dependencias listas")}
                    </p>
                    <p className="text-xs text-white/70">
                      {t(
                        "classes.side.description",
                        "Cada clase pertenece a un tipo bien definido. Los instructores se asignan a cada sesión individual.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-white/80">
                  <p>
                    {t(
                      "classes.side.instructors",
                      "Mantén instructores activos para asignarlos en las sesiones.",
                    )}
                  </p>
                  <p>
                    {t(
                      "classes.side.types",
                      "Usa tipos consistentes para mejorar los filtros públicos y la navegación del catálogo.",
                    )}
                  </p>
                  <p>
                    {t(
                      "classes.side.delete",
                      "El borrado valida dependencias reales para evitar romper sesiones o catálogos.",
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          <SearchField
            value={instructorSearch}
            onChange={setInstructorSearch}
            placeholder={t(
              "instructors.searchPlaceholder",
              "Buscar por nombre, bio, slug o especialidades",
            )}
          />
          {renderInstructorCards()}
        </TabsContent>

        <TabsContent value="classTypes" className="space-y-4">
          <SearchField
            value={classTypeSearch}
            onChange={setClassTypeSearch}
            placeholder={t(
              "classTypes.searchPlaceholder",
              "Buscar por nombre, slug o descripción",
            )}
          />
          {renderClassTypeCards()}
        </TabsContent>
      </Tabs>

      <AdminFormDialog
        open={classDialogOpen}
        onOpenChange={setClassDialogOpen}
        title={
          editingClass
            ? t("classes.dialog.editTitle", "Editar clase")
            : t("classes.dialog.createTitle", "Nueva clase")
        }
        onSubmit={handleClassSubmit}
        isSubmitting={createClass.isPending || updateClass.isPending}
        submitLabel={
          editingClass
            ? t("classes.actions.save", "Guardar clase")
            : t("classes.actions.create", "Crear clase")
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("classes.fields.titleEs", "Título ES")}</Label>
              <Input
                value={classForm.title_es}
                onChange={(event) =>
                  setClassForm((current) => ({
                    ...current,
                    title_es: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("classes.fields.slug", "Slug")}</Label>
              <Input
                value={classForm.slug}
                onChange={(event) =>
                  setClassForm((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                placeholder={t(
                  "classes.fields.slugPlaceholder",
                  "Se genera si lo dejas vacío",
                )}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("classes.fields.titleEn", "Título EN")}</Label>
              <Input
                value={classForm.title_en}
                onChange={(event) =>
                  setClassForm((current) => ({
                    ...current,
                    title_en: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("classes.fields.duration", "Duración (min)")}</Label>
              <Input
                type="number"
                min="10"
                max="240"
                value={classForm.duration_min}
                onChange={(event) =>
                  setClassForm((current) => ({
                    ...current,
                    duration_min: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("classes.fields.classType", "Tipo de clase")}</Label>
              <SearchCombobox
                value={classForm.class_type_id}
                onValueChange={(value) =>
                  setClassForm((current) => ({
                    ...current,
                    class_type_id: value,
                  }))
                }
                options={classTypeOptions}
                placeholder={t(
                  "classes.fields.classTypePlaceholder",
                  "Busca y selecciona un tipo",
                )}
                searchPlaceholder={t(
                  "classes.fields.classTypeSearch",
                  "Filtrar tipos",
                )}
                emptyMessage={t(
                  "classes.fields.classTypeEmpty",
                  "No hay tipos disponibles con ese criterio",
                )}
              />
              <p className="text-xs text-charcoal-muted">
                {t(
                  "classes.hints.classType",
                  "Administra el catálogo de tipos en la pestaña Tipos.",
                )}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("classes.fields.difficulty", "Nivel")}</Label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    classForm.difficulty === option
                      ? "border-sage bg-sage text-white"
                      : "border-warm-gray-dark/40 bg-white text-charcoal-muted hover:border-sage/50 hover:text-charcoal",
                  )}
                  onClick={() =>
                    setClassForm((current) => ({
                      ...current,
                      difficulty: option,
                    }))
                  }
                >
                  {t(`classes.difficulty.${option}`, option)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("classes.fields.summaryEs", "Resumen ES")}</Label>
              <Textarea
                className="min-h-24"
                value={classForm.summary_es}
                onChange={(event) =>
                  setClassForm((current) => ({
                    ...current,
                    summary_es: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("classes.fields.summaryEn", "Resumen EN")}</Label>
              <Textarea
                className="min-h-24"
                value={classForm.summary_en}
                onChange={(event) =>
                  setClassForm((current) => ({
                    ...current,
                    summary_en: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                {t("classes.fields.descriptionEs", "Descripción ES")}
              </Label>
              <Textarea
                value={classForm.description_es}
                onChange={(event) =>
                  setClassForm((current) => ({
                    ...current,
                    description_es: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                {t("classes.fields.descriptionEn", "Descripción EN")}
              </Label>
              <Textarea
                value={classForm.description_en}
                onChange={(event) =>
                  setClassForm((current) => ({
                    ...current,
                    description_en: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("classes.fields.basePrice", "Precio base")}</Label>
              <Input
                type="number"
                min="0"
                step="10"
                value={classForm.base_price}
                onChange={(event) =>
                  setClassForm((current) => ({
                    ...current,
                    base_price: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-3">
              <MediaUpload
                value={classForm.cover_image_id}
                onChange={(id) =>
                  setClassForm((current) => ({
                    ...current,
                    cover_image_id: id ?? "",
                  }))
                }
                label={t("classes.fields.coverImage", "Imagen de portada")}
                hint={t(
                  "classes.hints.coverImage",
                  "JPG, PNG o WebP. Recomendado 1200×900 px.",
                )}
                aspectRatio="4/3"
              />
              <SettingRow
                label={t("classes.fields.featured", "Destacada")}
                description={t(
                  "classes.hints.featured",
                  "Las clases destacadas tienen prioridad visual en el catálogo.",
                )}
                checked={classForm.is_featured}
                onCheckedChange={(checked) =>
                  setClassForm((current) => ({
                    ...current,
                    is_featured: checked,
                  }))
                }
              />
              <SettingRow
                label={t("common.enabled", "Activa")}
                description={t(
                  "classes.hints.enabled",
                  "Al desactivarla se oculta del flujo público sin perder información.",
                )}
                checked={classForm.enabled}
                onCheckedChange={(checked) =>
                  setClassForm((current) => ({ ...current, enabled: checked }))
                }
              />
            </div>
          </div>
        </div>
      </AdminFormDialog>

      <AdminFormDialog
        open={instructorDialogOpen}
        onOpenChange={setInstructorDialogOpen}
        title={
          editingInstructor
            ? t("instructors.dialog.editTitle", "Editar instructor")
            : t("instructors.dialog.createTitle", "Nuevo instructor")
        }
        onSubmit={handleInstructorSubmit}
        isSubmitting={createInstructor.isPending || updateInstructor.isPending}
        submitLabel={
          editingInstructor
            ? t("instructors.actions.save", "Guardar instructor")
            : t("instructors.actions.create", "Crear instructor")
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("instructors.fields.name", "Nombre completo")}</Label>
              <Input
                value={instructorForm.full_name}
                onChange={(event) =>
                  setInstructorForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("instructors.fields.slug", "Slug")}</Label>
              <Input
                value={instructorForm.slug}
                onChange={(event) =>
                  setInstructorForm((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                placeholder={t(
                  "instructors.fields.slugPlaceholder",
                  "Se genera si lo dejas vacío",
                )}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_140px]">
            <div className="space-y-1.5">
              <Label>
                {t("instructors.fields.specialties", "Especialidades")}
              </Label>
              <Input
                value={instructorForm.specialties}
                onChange={(event) =>
                  setInstructorForm((current) => ({
                    ...current,
                    specialties: event.target.value,
                  }))
                }
                placeholder={t(
                  "instructors.fields.specialtiesPlaceholder",
                  "Vinyasa, Breathwork, Sound healing",
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("instructors.fields.order", "Orden")}</Label>
              <Input
                type="number"
                min="0"
                value={instructorForm.display_order}
                onChange={(event) =>
                  setInstructorForm((current) => ({
                    ...current,
                    display_order: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("instructors.fields.bio", "Bio corta")}</Label>
            <Textarea
              value={instructorForm.short_bio}
              onChange={(event) =>
                setInstructorForm((current) => ({
                  ...current,
                  short_bio: event.target.value,
                }))
              }
            />
          </div>
          <SettingRow
            label={t("common.enabled", "Activo")}
            description={t(
              "instructors.hints.enabled",
              "Si lo desactivas ya no aparecerá para selección o catálogo público.",
            )}
            checked={instructorForm.enabled}
            onCheckedChange={(checked) =>
              setInstructorForm((current) => ({ ...current, enabled: checked }))
            }
          />
        </div>
      </AdminFormDialog>

      <AdminFormDialog
        open={classTypeDialogOpen}
        onOpenChange={setClassTypeDialogOpen}
        title={
          editingClassType
            ? t("classTypes.dialog.editTitle", "Editar tipo de clase")
            : t("classTypes.dialog.createTitle", "Nuevo tipo de clase")
        }
        onSubmit={handleClassTypeSubmit}
        isSubmitting={createClassType.isPending || updateClassType.isPending}
        submitLabel={
          editingClassType
            ? t("classTypes.actions.save", "Guardar tipo")
            : t("classTypes.actions.create", "Crear tipo")
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("classTypes.fields.nameEs", "Nombre ES")}</Label>
              <Input
                value={classTypeForm.name_es}
                onChange={(event) =>
                  setClassTypeForm((current) => ({
                    ...current,
                    name_es: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("classTypes.fields.slug", "Slug")}</Label>
              <Input
                value={classTypeForm.slug}
                onChange={(event) =>
                  setClassTypeForm((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                placeholder={t(
                  "classTypes.fields.slugPlaceholder",
                  "Se genera si lo dejas vacío",
                )}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("classTypes.fields.nameEn", "Nombre EN")}</Label>
            <Input
              value={classTypeForm.name_en}
              onChange={(event) =>
                setClassTypeForm((current) => ({
                  ...current,
                  name_en: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("classTypes.fields.description", "Descripción")}</Label>
            <Textarea
              className="min-h-24"
              value={classTypeForm.description}
              onChange={(event) =>
                setClassTypeForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>
          <SettingRow
            label={t("common.enabled", "Activo")}
            description={t(
              "classTypes.hints.enabled",
              "Un tipo activo puede asignarse a clases nuevas y aparecer en filtros públicos.",
            )}
            checked={classTypeForm.enabled}
            onCheckedChange={(checked) =>
              setClassTypeForm((current) => ({ ...current, enabled: checked }))
            }
          />
        </div>
      </AdminFormDialog>

      <AdminFormDialog
        open={!!deleteState}
        onOpenChange={(open) => {
          if (!open) setDeleteState(null);
        }}
        title={t("classes.delete.title", "Confirmar eliminación")}
        onSubmit={handleDeleteConfirm}
        isSubmitting={
          deleteClass.isPending ||
          deleteInstructor.isPending ||
          deleteClassType.isPending
        }
        submitLabel={t("classes.delete.confirm", "Eliminar definitivamente")}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-charcoal-muted">
            {t(
              "classes.delete.description",
              "Esta acción no se puede deshacer. Si existen dependencias reales el sistema bloqueará el borrado para proteger integridad de datos.",
            )}
          </p>
          {deleteState && (
            <div className="rounded-2xl border border-warm-gray-dark/40 bg-warm-gray/25 px-4 py-3 text-sm text-charcoal">
              <span className="font-medium">
                {t("classes.delete.target", "Elemento seleccionado")}:
              </span>{" "}
              {deleteState.item.title_es ||
                deleteState.item.full_name ||
                deleteState.item.name_es ||
                deleteState.item.slug}
            </div>
          )}
        </div>
      </AdminFormDialog>
    </div>
  );
}
