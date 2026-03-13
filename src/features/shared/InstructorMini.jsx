/**
 * InstructorMini — tarjeta compacta de instructor.
 * Usada en ClassCard y ClassDetailPage como contenido informativo.
 * El instructor NO es un usuario autenticado en el sistema.
 */
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function InstructorMini({ instructor, className }) {
  if (!instructor) return null

  const initials = instructor.full_name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Avatar className="h-9 w-9">
        <AvatarFallback className="text-xs bg-sage-muted text-sage-darker">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium text-charcoal leading-tight">
          {instructor.full_name}
        </p>
        {instructor.specialties?.length > 0 && (
          <p className="text-xs text-charcoal-muted">
            {instructor.specialties.join(' · ')}
          </p>
        )}
      </div>
    </div>
  )
}
