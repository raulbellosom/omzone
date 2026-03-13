import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind de forma segura, resolviendo conflictos.
 * Reemplaza la función cn() de shadcn/ui.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
