import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Accordion = AccordionPrimitive.Root

export function AccordionItem({ className, ...props }) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-b border-warm-gray-dark/60', className)}
      {...props}
    />
  )
}

export function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'flex flex-1 items-center justify-between py-4 text-sm font-medium text-charcoal',
          'hover:text-sage transition-colors text-left',
          '[&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 text-charcoal-muted shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-4 text-charcoal-muted leading-relaxed', className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}
