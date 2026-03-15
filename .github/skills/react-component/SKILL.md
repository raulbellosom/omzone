---
name: react-component
description: 'Create or extend React UI components using shadcn/ui + Radix primitives + CVA + Tailwind CSS 4.1 + Lucide/Phosphor icons. USE FOR: building new UI primitives, extending existing shadcn/ui components, creating shared components, designing mobile-first responsive layouts, adding motion/animation. DO NOT USE FOR: full page creation (use feature-page), admin CRUD tables (use admin-crud).'
argument-hint: 'Describe the component: name, variants, behavior, responsive needs'
---

# React Component — OMZONE

## When to Use

- Create a new UI primitive (button variant, card type, form widget)
- Extend an existing shadcn/ui component with project-specific variants
- Build a shared component (e.g., `PriceTag`, `ClassCard`, `StatusBadge`)
- Implement responsive mobile-first layouts or composite components

## Stack

- **React 18** — functional components, `forwardRef` when wrapping Radix
- **CVA** (class-variance-authority) — variant definitions
- **Tailwind CSS 4.1** — utility-first, configured with project theme
- **Radix UI** — accessible primitives (Dialog, Tabs, Select, etc.)
- **Lucide React** + **Phosphor Icons** — icon sets
- **clsx** + **tailwind-merge** via `cn()` from `@/lib/utils`

## Project Conventions

### File placement

| Type | Path |
|------|------|
| UI primitives (shadcn) | `src/components/ui/<name>.jsx` |
| Shared/composite | `src/components/shared/<Name>.jsx` |
| Feature-specific | `src/features/<domain>/components/<Name>.jsx` |
| SEO wrappers | `src/components/seo/<Name>.jsx` |

### Code patterns

```jsx
// UI primitive with CVA
import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const myVariants = cva(
  'base-classes rounded-xl transition-all duration-200', // base
  {
    variants: {
      variant: {
        default: 'bg-sage text-white',
        outline: 'border border-sage text-sage',
        ghost:   'text-charcoal hover:bg-warm-gray',
      },
      size: {
        sm: 'h-8 px-4 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

const MyComponent = forwardRef(({ className, variant, size, ...props }, ref) => (
  <div ref={ref} className={cn(myVariants({ variant, size }), className)} {...props} />
))
MyComponent.displayName = 'MyComponent'
export { MyComponent, myVariants }
```

```jsx
// Shared component (no CVA needed)
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export default function PriceTag({ amount, currency = 'MXN', className }) {
  const { t } = useTranslation('common')
  return (
    <span className={cn('text-lg font-semibold text-charcoal', className)}>
      {formatCurrency(amount, currency)}
    </span>
  )
}
```

### Design System Colors

| Token | Use |
|-------|-----|
| `cream` | page backgrounds |
| `sand` / `sand-dark` | secondary surfaces, neutral buttons |
| `warm-gray` / `warm-gray-dark` | borders, muted backgrounds |
| `sage` / `sage-dark` / `sage-muted` | primary accent, CTAs |
| `charcoal` / `charcoal-muted` / `charcoal-subtle` | text hierarchy |

### Component Checklist

1. Name the file: lowercase for ui primitives, PascalCase for shared/feature.
2. Use `cn()` for all className merging (never raw template literals).
3. Accept and spread `className` prop for composability.
4. Mobile-first: start with mobile layout, add `md:` / `lg:` breakpoints.
5. Use `forwardRef` when wrapping Radix primitives.
6. Use `rounded-xl` or `rounded-2xl` (project standard radii).
7. Use `transition-all duration-200` or `duration-300` for subtle animations.
8. Icons: `Lucide` as default, `Phosphor` when Lucide lacks the icon.
9. Text via `useTranslation()` — never hardcode UI strings.
10. Export named (UI primitives) or default (shared/feature components).

### Existing UI Primitives

`button`, `card`, `input`, `label`, `badge`, `dialog`, `tabs`, `accordion`, `avatar`, `separator`, `skeleton`, `sheet`, `tooltip`, `select`, `checkbox`, `switch`, `popover`, `progress`, `scroll-area`, `collapsible`, `aspect-ratio`, `navigation-menu`, `dropdown-menu`, `toast` (via Sonner).

### Border & Shadow Tokens

- Borders: `border-warm-gray-dark/40` (cards), `border-warm-gray-dark/60` (separators)
- Shadows: `shadow-card`, `shadow-modal`, `shadow-sm`, `shadow-md`
- Focus: `focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2`
