import { forwardRef } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverAnchor = PopoverPrimitive.Anchor

export const PopoverContent = forwardRef(function PopoverContent({ className, align = 'start', sideOffset = 8, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-2xl border border-warm-gray-dark/50 bg-white p-3 shadow-modal outline-none',
          'data-[state=open]:animate-fade-in-up data-[state=closed]:animate-fade-out',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
