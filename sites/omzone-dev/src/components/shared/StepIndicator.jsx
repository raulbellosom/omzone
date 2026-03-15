/**
 * StepIndicator — stepper horizontal reutilizable.
 * Props:
 *   steps    — array de strings con etiquetas
 *   current  — índice activo (1-based)
 *   className
 */
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StepIndicator({ steps, current, className }) {
  return (
    <nav aria-label="Progreso de pasos" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {steps.map((label, idx) => {
          const num      = idx + 1
          const done     = num < current
          const active   = num === current
          const pending  = num > current
          const last     = idx === steps.length - 1

          return (
            <li key={label} className={cn('flex items-center', !last && 'flex-1')}>
              {/* Círculo + etiqueta */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold',
                  'transition-all duration-300',
                  done    && 'bg-sage text-white',
                  active  && 'bg-sage text-white ring-4 ring-sage/20',
                  pending && 'bg-warm-gray text-charcoal-subtle border border-warm-gray-dark'
                )}>
                  {done
                    ? <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    : <span>{num}</span>
                  }
                </div>
                <span className={cn(
                  'text-[10px] sm:text-xs font-medium hidden sm:block text-center leading-none',
                  'transition-colors duration-200',
                  active  ? 'text-sage'           : '',
                  done    ? 'text-sage-dark'       : '',
                  pending ? 'text-charcoal-subtle' : '',
                )}>
                  {label}
                </span>
              </div>

              {/* Conector */}
              {!last && (
                <div className="flex-1 h-0.5 mx-2 sm:mx-3 relative overflow-hidden rounded-full bg-warm-gray-dark">
                  <div className={cn(
                    'absolute inset-y-0 left-0 bg-sage rounded-full',
                    'transition-all duration-500',
                    done ? 'w-full' : 'w-0'
                  )} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
