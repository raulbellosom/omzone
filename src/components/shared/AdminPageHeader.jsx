/**
 * AdminPageHeader — cabecera consistente para todas las páginas admin.
 * Props: title, subtitle?, action? (node — botón CTA opcional)
 */
export default function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-charcoal leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-charcoal-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
