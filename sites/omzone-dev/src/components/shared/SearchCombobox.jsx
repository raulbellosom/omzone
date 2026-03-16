import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function SearchCombobox({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  className,
}) {
  const inputId = useId()
  const anchorRef = useRef(null)
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(320)

  const selectedOption = options.find((option) => option.value === value) ?? null
  const [query, setQuery] = useState(selectedOption?.label ?? '')

  useEffect(() => {
    setQuery(selectedOption?.label ?? '')
  }, [selectedOption])

  useEffect(() => {
    if (!anchorRef.current) return undefined

    const element = anchorRef.current
    const updateWidth = () => setPanelWidth(element.offsetWidth || 320)
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredOptions = options.filter((option) => {
    if (!normalizedQuery) return true

    const haystack = [option.label, option.description, ...(option.keywords ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })

  function handleInputChange(event) {
    const nextQuery = event.target.value
    setQuery(nextQuery)
    setOpen(true)

    if (value) {
      onValueChange('')
    }
  }

  function handleSelect(option) {
    onValueChange(option.value)
    setQuery(option.label)
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleClear() {
    onValueChange('')
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={anchorRef} className={cn('relative', className)}>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-subtle" />
          <Input
            id={inputId}
            ref={inputRef}
            value={query}
            disabled={disabled}
            placeholder={placeholder}
            className="h-11 pl-10 pr-20"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${inputId}-listbox`}
            onFocus={() => setOpen(true)}
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false)
              }
            }}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {(query || value) && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-charcoal-muted hover:text-charcoal"
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <ChevronsUpDown className="h-4 w-4 text-charcoal-subtle" />
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="max-h-80 overflow-hidden p-2"
        style={{ width: `${panelWidth}px` }}
      >
        <div className="mb-2 px-2 text-xs font-medium uppercase tracking-[0.2em] text-charcoal-subtle">
          {searchPlaceholder}
        </div>
        <div id={`${inputId}-listbox`} role="listbox" className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl px-3 py-2 text-left transition-colors',
                    isSelected
                      ? 'bg-sage/10 text-charcoal'
                      : 'text-charcoal-muted hover:bg-warm-gray/70 hover:text-charcoal'
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  <span className={cn(
                    'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border',
                    isSelected ? 'border-sage bg-sage text-white' : 'border-warm-gray-dark/40 bg-white text-transparent'
                  )}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-inherit">{option.label}</span>
                    {option.description && (
                      <span className="mt-0.5 block text-xs text-charcoal-subtle">{option.description}</span>
                    )}
                  </span>
                </button>
              )
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-warm-gray-dark/50 px-4 py-6 text-center text-sm text-charcoal-muted">
              {emptyMessage}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
