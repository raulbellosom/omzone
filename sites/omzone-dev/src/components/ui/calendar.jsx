import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center h-7",
        caption_label: "text-sm font-medium text-charcoal",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "absolute left-1 h-7 w-7 bg-transparent p-0 text-charcoal-muted hover:text-charcoal",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "absolute right-1 h-7 w-7 bg-transparent p-0 text-charcoal-muted hover:text-charcoal",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-charcoal-muted rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-1",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-sage/10 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-sage/5",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal rounded-md aria-selected:opacity-100",
        ),
        range_start: "day-range-start rounded-l-md",
        range_end: "day-range-end rounded-r-md",
        selected:
          "bg-sage text-white hover:bg-sage-dark hover:text-white focus:bg-sage focus:text-white rounded-md",
        today: "bg-sand text-charcoal font-semibold",
        outside:
          "day-outside text-charcoal-subtle/40 aria-selected:bg-sage/5 aria-selected:text-charcoal-subtle/60",
        disabled: "text-charcoal-subtle/30 cursor-not-allowed",
        range_middle:
          "aria-selected:bg-sage/10 aria-selected:text-charcoal",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
