import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type ?? 'text'}
      className={cn(
        'flex h-11 w-full rounded-xl border border-sand-dark bg-white px-4 py-2 text-sm text-charcoal placeholder:text-charcoal-subtle transition-colors',
        'focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
