import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none active:scale-[0.97] active:brightness-95',
  {
    variants: {
      variant: {
        // Principal — sage verde sólido
        default:
          'bg-sage text-white hover:bg-sage-dark shadow-sm hover:shadow-md hover:-translate-y-px',
        // Secundario — contorno sage
        outline:
          'border border-sage text-sage hover:bg-sage hover:text-white bg-transparent hover:shadow-sm',
        // Ghost — sin fondo
        ghost:
          'text-charcoal hover:bg-warm-gray hover:text-charcoal-light',
        // Destructivo
        destructive:
          'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md hover:-translate-y-px',
        // Sand — superficie neutra cálida
        sand:
          'bg-sand text-charcoal hover:bg-sand-dark',
        // Link
        link:
          'text-sage underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-4 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const Button = forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
