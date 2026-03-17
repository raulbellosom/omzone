/**
 * CustomerPageLayout — contenedor estándar para todas las páginas del área cliente.
 *
 * Props:
 *   title      {string}    — Título de la página (opcional)
 *   subtitle   {string}    — Descripción corta debajo del título (opcional)
 *   actions    {ReactNode} — Botones / CTAs a la derecha del header (opcional)
 *   toolbar    {ReactNode} — Fila de búsqueda / filtros debajo del header (opcional)
 *   className  {string}    — Clases extra para el contenedor raíz (opcional)
 *   children   {ReactNode} — Contenido principal de la página
 *
 * Uso básico:
 *   <CustomerPageLayout title="Mis reservas" subtitle="Historial de asistencia">
 *     <BookingsList />
 *   </CustomerPageLayout>
 *
 * Uso con acciones y filtros:
 *   <CustomerPageLayout
 *     title="Clases"
 *     actions={<Button>Reservar</Button>}
 *     toolbar={<SearchBar />}
 *   >
 *     <ClassGrid />
 *   </CustomerPageLayout>
 */
import { cn } from "@/lib/utils";

export default function CustomerPageLayout({
  title,
  subtitle,
  actions,
  toolbar,
  className,
  children,
}) {
  const hasHeader = title || actions;
  const hasToolbar = !!toolbar;

  return (
    <div className={cn("animate-fade-in-up", className)}>
      {/* ── Page header ──────────────────────────────────────────────── */}
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 mb-5">
          {title && (
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-display font-semibold text-charcoal leading-tight truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-charcoal-muted mt-0.5 leading-snug">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {actions && (
            <div className="shrink-0 flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}

      {/* ── Toolbar: search / filters ─────────────────────────────────── */}
      {hasToolbar && <div className="mb-5">{toolbar}</div>}

      {/* ── Content ───────────────────────────────────────────────────── */}
      {children}
    </div>
  );
}
