/**
 * Sheet — drawer lateral (usado para mobile menu, filtros, etc.)
 */
import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export const SheetOverlay = React.forwardRef(function SheetOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm',
        'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
        className
      )}
      {...props}
    />
  )
})

export const SheetContent = React.forwardRef(function SheetContent(
  { side = 'right', className, children, ...props },
  ref
) {
  const sides = {
    right:  'right-0 top-0 h-full w-full max-w-xs sm:max-w-sm border-l border-warm-gray-dark data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right',
    left:   'left-0 top-0 h-full w-full max-w-xs sm:max-w-sm border-r border-warm-gray-dark data-[state=open]:animate-sheet-in-left data-[state=closed]:animate-sheet-out-left',
    bottom: 'bottom-0 left-0 w-full rounded-t-2xl border-t border-warm-gray-dark max-h-[90vh] data-[state=open]:animate-sheet-in-bottom data-[state=closed]:animate-sheet-out-bottom',
    top:    'top-0 left-0 w-full border-b border-warm-gray-dark',
  }

  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 bg-white shadow-modal overflow-y-auto',
          sides[side],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-charcoal-muted hover:bg-warm-gray transition-colors">
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})

export function SheetHeader({ className, ...props }) {
  return <div className={cn('px-5 pt-5 pb-3', className)} {...props} />
}

export const SheetTitle = React.forwardRef(function SheetTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-base font-semibold text-charcoal', className)}
      {...props}
    />
  )
})

export const SheetDescription = React.forwardRef(function SheetDescription(
  { className, ...props },
  ref
) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-charcoal-muted', className)}
      {...props}
    />
  )
})
