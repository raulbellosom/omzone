import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-warm-gray-dark/40 shadow-card',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 pb-3', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn('px-5 pb-5 pt-3 border-t border-warm-gray-dark/40', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }) {
  return (
    <h3 className={cn('text-base font-semibold text-charcoal leading-tight', className)} {...props} />
  )
}

export function CardDescription({ className, ...props }) {
  return (
    <p className={cn('text-sm text-charcoal-muted mt-1', className)} {...props} />
  )
}
