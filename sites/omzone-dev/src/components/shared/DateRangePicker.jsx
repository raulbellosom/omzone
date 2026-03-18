/**
 * DateRangePicker — popover with calendar for selecting a date range.
 * Props:
 *   from        — Date | undefined
 *   to          — Date | undefined
 *   onChange    — ({ from, to }) => void
 *   placeholder — string
 *   locale      — date-fns locale
 *   className   — extra classes for trigger button
 */
import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function DateRangePicker({
  from,
  to,
  onChange,
  placeholder = "Select dates",
  locale,
  className,
}) {
  const [open, setOpen] = useState(false);

  const hasValue = from || to;

  function handleSelect(range) {
    onChange({ from: range?.from ?? undefined, to: range?.to ?? undefined });
  }

  function clear(e) {
    e.stopPropagation();
    onChange({ from: undefined, to: undefined });
  }

  const label = hasValue
    ? [
        from ? format(from, "d MMM", { locale }) : "",
        to ? format(to, "d MMM", { locale }) : "",
      ]
        .filter(Boolean)
        .join(" – ")
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 font-normal text-xs h-8 px-3",
            !hasValue && "text-charcoal-muted",
            className,
          )}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          {label}
          {hasValue && (
            <span
              role="button"
              tabIndex={-1}
              onClick={clear}
              className="ml-1 rounded-full hover:bg-warm-gray p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={locale}
          defaultMonth={from ?? new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
