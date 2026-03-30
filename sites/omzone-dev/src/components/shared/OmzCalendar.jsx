/**
 * OmzCalendar - Custom responsive calendar component for OMZONE
 * Features: Month/Week/Day views, event display, click handlers, mobile-first design
 */
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Constants
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const VIEWS = { MONTH: "month", WEEK: "week", DAY: "day" };

// Hour labels for week/day views (6am - 10pm typically)
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 - 22:00

// Event status colors matching OMZONE design
const EVENT_STATUS_COLORS = {
  open: "bg-sage text-white",
  full: "bg-charcoal-light text-white",
  cancelled: "bg-red-500/80 text-white",
  completed: "bg-warm-gray-dark text-charcoal",
  default: "bg-sage text-white",
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Utils
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  try {
    return parseISO(value);
  } catch {
    return new Date(value);
  }
}

function getEventPosition(startAt, endAt) {
  const start = parseDate(startAt);
  const end = parseDate(endAt) || start;
  if (!start) return null;

  const startHour = start.getHours() + start.getMinutes() / 60;
  const endHour = end.getHours() + end.getMinutes() / 60;
  const duration = Math.max(endHour - startHour, 0.5);

  return { startHour, duration };
}

function getDaysInMonth(date) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  const days = [];
  let current = start;

  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }

  return days;
}

function getDaysInWeek(date) {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function getLocalizedDayNames(localeCode, width = "short") {
  const baseSunday = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(baseSunday, i);
    const label = new Intl.DateTimeFormat(localeCode, {
      weekday: width,
    }).format(day);
    return width === "short" ? label.replace(/\./g, "").toLowerCase() : label;
  });
}

// Check if an event spans multiple days
function isMultiDayEvent(event) {
  const start = parseDate(event.start);
  const end = parseDate(event.end);
  if (!start || !end) return false;
  return !isSameDay(start, end);
}

// Check if event overlaps with a specific day
function eventOverlapsDay(event, day) {
  const eventStart = parseDate(event.start);
  const eventEnd = parseDate(event.end) || eventStart;
  if (!eventStart) return false;

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  // Event overlaps if it starts before day ends AND ends after day starts
  return eventStart <= dayEnd && eventEnd >= dayStart;
}

// Get events that occur on a specific day (including multi-day events)
function getEventsForDay(events, day) {
  return events.filter((event) => eventOverlapsDay(event, day));
}

// Separate single-day and multi-day events
function categorizeEvents(events) {
  const singleDay = [];
  const multiDay = [];

  for (const event of events) {
    if (isMultiDayEvent(event)) {
      multiDay.push(event);
    } else {
      singleDay.push(event);
    }
  }

  return { singleDay, multiDay };
}

// Calculate multi-day event position within a week row
function getMultiDayEventSpan(event, weekStart, weekEnd) {
  const eventStart = parseDate(event.start);
  const eventEnd = parseDate(event.end) || eventStart;
  if (!eventStart) return null;

  // Clamp to week boundaries
  const displayStart =
    eventStart < weekStart ? weekStart : startOfDay(eventStart);
  const displayEnd = eventEnd > weekEnd ? weekEnd : endOfDay(eventEnd);

  // Calculate day indices (0-6)
  const startIndex = Math.max(0, differenceInDays(displayStart, weekStart));
  const endIndex = Math.min(6, differenceInDays(displayEnd, weekStart));
  const span = endIndex - startIndex + 1;

  // Position info
  const startsBeforeWeek = eventStart < weekStart;
  const endsAfterWeek = eventEnd > weekEnd;

  return {
    startIndex,
    span,
    startsBeforeWeek,
    endsAfterWeek,
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Sub-components
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CalendarHeader({
  view,
  currentDate,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  t,
  dateFnsLocale,
}) {
  const title = useMemo(() => {
    if (view === VIEWS.DAY) {
      return format(currentDate, "EEEE d MMMM yyyy", { locale: dateFnsLocale });
    }
    if (view === VIEWS.WEEK) {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = addDays(weekStart, 6);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return (
          format(weekStart, "d", { locale: dateFnsLocale }) +
          " - " +
          format(weekEnd, "d MMMM yyyy", { locale: dateFnsLocale })
        );
      }
      return (
        format(weekStart, "d MMM", { locale: dateFnsLocale }) +
        " - " +
        format(weekEnd, "d MMM yyyy", { locale: dateFnsLocale })
      );
    }
    return format(currentDate, "MMMM yyyy", { locale: dateFnsLocale });
  }, [view, currentDate, dateFnsLocale]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* View Toggle */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={view === VIEWS.MONTH ? "default" : "outline"}
          onClick={() => onViewChange(VIEWS.MONTH)}
        >
          {t("agendaWorkspace.calendar.views.month")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === VIEWS.WEEK ? "default" : "outline"}
          onClick={() => onViewChange(VIEWS.WEEK)}
        >
          {t("agendaWorkspace.calendar.views.week")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === VIEWS.DAY ? "default" : "outline"}
          onClick={() => onViewChange(VIEWS.DAY)}
        >
          {t("agendaWorkspace.calendar.views.day")}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl bg-charcoal-light">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-l-xl rounded-r-none text-white hover:bg-charcoal hover:text-white"
            onClick={onPrevious}
            aria-label={t("agendaWorkspace.calendar.aria.previous")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-l-none rounded-r-xl text-white hover:bg-charcoal hover:text-white"
            onClick={onNext}
            aria-label={t("agendaWorkspace.calendar.aria.next")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onToday}>
          {t("agendaWorkspace.calendar.today")}
        </Button>
      </div>

      {/* Title - hidden on mobile when space is tight */}
      <h2 className="order-first flex-1 text-center font-display text-lg font-medium capitalize text-charcoal sm:order-none sm:text-xl md:text-2xl">
        {title}
      </h2>
    </div>
  );
}

function EventChip({ event, onClick, compact = false, t }) {
  const statusClass =
    EVENT_STATUS_COLORS[event.status] || EVENT_STATUS_COLORS.default;
  const startTime = parseDate(event.start);
  const timeLabel = startTime ? format(startTime, "HH:mm") : "";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={cn(
        "w-full truncate rounded-lg px-2 py-1 text-left text-xs font-medium transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-1",
        statusClass,
        compact && "py-0.5 text-[10px]",
      )}
      title={event.title || t("agendaWorkspace.calendar.eventFallback")}
    >
      {!compact && timeLabel && (
        <span className="mr-1 opacity-80">{timeLabel}</span>
      )}
      <span className="truncate">{event.title || t("agendaWorkspace.calendar.eventFallback")}</span>
    </button>
  );
}

function BlockOverlay({ block, t }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-lg bg-red-500/10 border border-red-500/30"
      title={block.reason || t("agendaWorkspace.calendar.blocked")}
    />
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Month View
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Multi-day event bar component for month view
function MultiDayEventBar({
  event,
  span,
  startIndex,
  startsBeforeWeek,
  endsAfterWeek,
  onClick,
  t,
}) {
  const statusClass =
    EVENT_STATUS_COLORS[event.status] || EVENT_STATUS_COLORS.default;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={cn(
        "absolute h-5 truncate rounded px-1.5 text-[10px] font-medium sm:h-6 sm:text-xs",
        "transition-all duration-200 hover:shadow-md hover:brightness-95 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-1",
        statusClass,
        !startsBeforeWeek && "rounded-l-lg",
        !endsAfterWeek && "rounded-r-lg",
      )}
      style={{
        left: `calc(${(startIndex / 7) * 100}% + 2px)`,
        width: `calc(${(span / 7) * 100}% - 4px)`,
      }}
      title={event.title || t("agendaWorkspace.calendar.eventFallback")}
    >
      <span className="flex h-full items-center truncate">
        {event.title || t("agendaWorkspace.calendar.eventFallback")}
      </span>
    </button>
  );
}

function MonthView({ currentDate, events, blocks, onEventClick, onDateClick, t, localeCode }) {
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const dayNames = useMemo(() => getLocalizedDayNames(localeCode, "short"), [localeCode]);

  // Group days into weeks
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  // Categorize events
  const { singleDay, multiDay } = useMemo(
    () => categorizeEvents(events),
    [events],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-warm-gray-dark/40 bg-white">
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-warm-gray-dark/40 bg-warm-gray/50">
        {dayNames.map((name) => (
          <div
            key={name}
            className="px-1 py-2 text-center text-xs font-semibold text-charcoal-muted sm:px-2 sm:py-3 sm:text-sm"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, weekIndex) => {
        const weekStart = startOfDay(week[0]);
        const weekEnd = endOfDay(week[6]);

        // Get multi-day events that span this week
        const weekMultiDayEvents = multiDay
          .map((event) => {
            const span = getMultiDayEventSpan(event, weekStart, weekEnd);
            if (!span) return null;
            return { event, ...span };
          })
          .filter(Boolean)
          .sort((a, b) => a.startIndex - b.startIndex);

        return (
          <div key={weekIndex} className="relative">
            {/* Multi-day events layer */}
            {weekMultiDayEvents.length > 0 && (
              <div className="relative border-b border-warm-gray-dark/20 bg-warm-gray/10">
                {weekMultiDayEvents.map((item, idx) => (
                  <div
                    key={item.event.id}
                    className="relative h-6 sm:h-7"
                    style={{ marginTop: idx > 0 ? "2px" : "0" }}
                  >
                    <MultiDayEventBar
                      event={item.event}
                      span={item.span}
                      startIndex={item.startIndex}
                      startsBeforeWeek={item.startsBeforeWeek}
                      endsAfterWeek={item.endsAfterWeek}
                      onClick={onEventClick}
                      t={t}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Days row */}
            <div className="grid grid-cols-7">
              {week.map((day, dayIndex) => {
                // Only show single-day events in cells (multi-day are in the layer above)
                const daySingleEvents = singleDay.filter((e) =>
                  eventOverlapsDay(e, day),
                );
                const dayBlocks = getEventsForDay(blocks, day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const dayNumber = day.getDate();
                const isWeekend = getDay(day) === 0 || getDay(day) === 6;

                return (
                  <div
                    key={dayIndex}
                    onClick={() => onDateClick?.(day)}
                    className={cn(
                      "group relative min-h-20 cursor-pointer border-b border-r border-warm-gray-dark/20 p-1 transition-colors sm:min-h-25 sm:p-2 md:min-h-30",
                      "hover:bg-sage/5",
                      !isCurrentMonth && "bg-warm-gray/30",
                      isCurrentDay && "bg-[#f6efdb]",
                      isWeekend && isCurrentMonth && "bg-warm-gray/20",
                    )}
                  >
                    {/* Day Number */}
                    <div className="mb-1 flex justify-end">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 sm:text-sm",
                          isCurrentDay && "bg-sage text-white",
                          !isCurrentMonth && "text-charcoal-subtle",
                          isCurrentMonth && !isCurrentDay && "text-charcoal",
                          isWeekend &&
                            isCurrentMonth &&
                            !isCurrentDay &&
                            "text-sage-dark",
                        )}
                      >
                        {dayNumber}
                      </span>
                    </div>

                    {/* Block Overlay */}
                    {dayBlocks.length > 0 && (
                      <BlockOverlay block={dayBlocks[0]} t={t} />
                    )}

                    {/* Single-day Events */}
                    <div className="relative z-10 flex flex-col gap-0.5 sm:gap-1">
                      {daySingleEvents.slice(0, 2).map((event) => (
                        <EventChip
                          key={event.id}
                          event={event}
                          onClick={onEventClick}
                          compact
                          t={t}
                        />
                      ))}
                      {daySingleEvents.length > 2 && (
                        <span className="text-[10px] font-medium text-charcoal-muted sm:text-xs">
                          {t("agendaWorkspace.calendar.moreEvents", {
                            count: daySingleEvents.length - 2,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Week View
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function WeekView({
  currentDate,
  events,
  blocks,
  onEventClick,
  onDateClick,
  t,
  localeCode,
}) {
  const days = useMemo(() => getDaysInWeek(currentDate), [currentDate]);
  const dayNames = useMemo(() => getLocalizedDayNames(localeCode, "short"), [localeCode]);
  const weekStart = startOfDay(days[0]);
  const weekEnd = endOfDay(days[6]);

  // Categorize events
  const { singleDay, multiDay } = useMemo(
    () => categorizeEvents(events),
    [events],
  );

  // Get multi-day events for this week
  const weekMultiDayEvents = useMemo(() => {
    return multiDay
      .map((event) => {
        const span = getMultiDayEventSpan(event, weekStart, weekEnd);
        if (!span) return null;
        return { event, ...span };
      })
      .filter(Boolean)
      .sort((a, b) => a.startIndex - b.startIndex);
  }, [multiDay, weekStart, weekEnd]);

  return (
    <div className="overflow-hidden rounded-2xl border border-warm-gray-dark/40 bg-white">
      {/* Header with day names */}
      <div className="sticky top-0 z-20 border-b border-warm-gray-dark/40 bg-warm-gray/50">
        <div className="grid grid-cols-[50px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)]">
          <div className="border-r border-warm-gray-dark/20" />
          {days.map((day, index) => {
            const isCurrentDay = isToday(day);
            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center py-2 sm:py-3",
                  index < 6 && "border-r border-warm-gray-dark/20",
                )}
              >
                <span className="text-[10px] font-medium uppercase text-charcoal-muted sm:text-xs">
                  {dayNames[getDay(day)]}
                </span>
                <span
                  className={cn(
                    "mt-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold sm:h-8 sm:w-8 sm:text-base",
                    isCurrentDay && "bg-sage text-white",
                    !isCurrentDay && "text-charcoal",
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Multi-day events section (all-day row) */}
        {weekMultiDayEvents.length > 0 && (
          <div className="border-t border-warm-gray-dark/20 bg-warm-gray/30">
            <div className="grid grid-cols-[50px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)]">
              <div className="flex items-center justify-end border-r border-warm-gray-dark/20 pr-1 text-[9px] text-charcoal-muted sm:pr-2 sm:text-[10px]">
                {t("agendaWorkspace.calendar.allDay")}
              </div>
              <div className="relative col-span-7 py-1">
                {weekMultiDayEvents.map((item, idx) => (
                  <div
                    key={item.event.id}
                    className="relative h-5 sm:h-6"
                    style={{ marginTop: idx > 0 ? "2px" : "0" }}
                  >
                    <MultiDayEventBar
                      event={item.event}
                      span={item.span}
                      startIndex={item.startIndex}
                      startsBeforeWeek={item.startsBeforeWeek}
                      endsAfterWeek={item.endsAfterWeek}
                      onClick={onEventClick}
                      t={t}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Grid */}
      <div className="max-h-[55vh] overflow-y-auto sm:max-h-[65vh]">
        <div className="relative grid grid-cols-[50px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)]">
          {/* Hour Labels */}
          <div className="border-r border-warm-gray-dark/20">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex h-12 items-start justify-end pr-2 pt-0 sm:h-14"
              >
                <span className="text-[10px] text-charcoal-muted sm:text-xs">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map((day, dayIndex) => {
            // Only single-day events in the time grid
            const daySingleEvents = singleDay.filter((e) =>
              eventOverlapsDay(e, day),
            );
            const dayBlocks = getEventsForDay(blocks, day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={dayIndex}
                className={cn(
                  "relative",
                  dayIndex < 6 && "border-r border-warm-gray-dark/20",
                  isCurrentDay && "bg-[#f6efdb]/50",
                )}
                onClick={() => onDateClick?.(day)}
              >
                {/* Hour Grid Lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 cursor-pointer border-b border-warm-gray-dark/10 transition-colors hover:bg-sage/5 sm:h-14"
                  />
                ))}

                {/* Block Overlays */}
                {dayBlocks.map((block) => {
                  const pos = getEventPosition(block.start, block.end);
                  if (!pos) return null;
                  const top =
                    (pos.startHour - HOURS[0]) *
                    (typeof window !== "undefined" && window.innerWidth < 640
                      ? 48
                      : 56);
                  const height =
                    pos.duration *
                    (typeof window !== "undefined" && window.innerWidth < 640
                      ? 48
                      : 56);
                  return (
                    <div
                      key={block.id}
                      className="absolute left-0 right-0 bg-red-500/10 border-l-2 border-red-500/50"
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 24)}px`,
                      }}
                    />
                  );
                })}

                {/* Single-day Events */}
                {daySingleEvents.map((event) => {
                  const pos = getEventPosition(event.start, event.end);
                  if (!pos) return null;
                  const hourHeight = 48; // Mobile
                  const top = (pos.startHour - HOURS[0]) * hourHeight;
                  const height = pos.duration * hourHeight;

                  return (
                    <div
                      key={event.id}
                      className="absolute left-0.5 right-0.5 z-20 sm:left-1 sm:right-1"
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 24)}px`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className={cn(
                          "h-full w-full overflow-hidden rounded-lg p-1 text-left text-[10px] font-medium sm:p-2 sm:text-xs",
                          "transition-all duration-200 hover:shadow-md active:scale-[0.98]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
                          EVENT_STATUS_COLORS[event.status] ||
                            EVENT_STATUS_COLORS.default,
                        )}
                      >
                        <div className="truncate">
                          {event.title || t("agendaWorkspace.calendar.eventFallback")}
                        </div>
                        {height > 40 && (
                          <div className="mt-0.5 truncate opacity-80">
                            {parseDate(event.start) &&
                              format(parseDate(event.start), "HH:mm")}
                            {event.end &&
                              ` - ${format(parseDate(event.end), "HH:mm")}`}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Day View
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DayView({
  currentDate,
  events,
  blocks,
  onEventClick,
  onDateClick,
  t,
  localeCode,
}) {
  // Categorize events
  const { singleDay, multiDay } = useMemo(
    () => categorizeEvents(events),
    [events],
  );

  // Get events for this day
  const daySingleEvents = useMemo(
    () => singleDay.filter((e) => eventOverlapsDay(e, currentDate)),
    [singleDay, currentDate],
  );
  const dayMultiDayEvents = useMemo(
    () => multiDay.filter((e) => eventOverlapsDay(e, currentDate)),
    [multiDay, currentDate],
  );
  const dayBlocks = useMemo(
    () => getEventsForDay(blocks, currentDate),
    [blocks, currentDate],
  );
  const isCurrentDay = isToday(currentDate);

  return (
    <div className="overflow-hidden rounded-2xl border border-warm-gray-dark/40 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-warm-gray-dark/40 bg-warm-gray/50">
        <div className="flex items-center justify-center py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase text-charcoal-muted">
              {getLocalizedDayNames(localeCode, "long")[getDay(currentDate)]}
            </span>
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold sm:h-12 sm:w-12 sm:text-xl",
                isCurrentDay && "bg-sage text-white",
                !isCurrentDay && "bg-warm-gray text-charcoal",
              )}
            >
              {currentDate.getDate()}
            </span>
          </div>
        </div>

        {/* Multi-day events (all-day) */}
        {dayMultiDayEvents.length > 0 && (
          <div className="border-t border-warm-gray-dark/20 bg-warm-gray/30 px-3 py-2">
            <p className="mb-1 text-[10px] font-medium uppercase text-charcoal-muted">
              {t("agendaWorkspace.calendar.allDay")}
            </p>
            <div className="flex flex-col gap-1">
              {dayMultiDayEvents.map((event) => (
                <EventChip key={event.id} event={event} onClick={onEventClick} compact t={t} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time Grid */}
      <div className="max-h-[60vh] overflow-y-auto sm:max-h-[70vh]">
        <div className="relative grid grid-cols-[50px_1fr] sm:grid-cols-[70px_1fr]">
          {/* Hour Labels */}
          <div className="border-r border-warm-gray-dark/20">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex h-14 items-start justify-end pr-2 pt-0 sm:h-16"
              >
                <span className="text-xs text-charcoal-muted sm:text-sm">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day Column */}
          <div
            className={cn(
              "relative cursor-pointer",
              isCurrentDay && "bg-[#f6efdb]/30",
            )}
            onClick={() => onDateClick?.(currentDate)}
          >
            {/* Hour Grid Lines */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-14 border-b border-warm-gray-dark/10 transition-colors hover:bg-sage/5 sm:h-16"
              />
            ))}

            {/* Block Overlays */}
            {dayBlocks.map((block) => {
              const pos = getEventPosition(block.start, block.end);
              if (!pos) return null;
              const hourHeight =
                typeof window !== "undefined" && window.innerWidth < 640
                  ? 56
                  : 64;
              const top = (pos.startHour - HOURS[0]) * hourHeight;
              const height = pos.duration * hourHeight;
              return (
                <div
                  key={block.id}
                  className="absolute left-0 right-0 bg-red-500/10 border-l-4 border-red-500/50"
                  style={{
                    top: `${top}px`,
                    height: `${Math.max(height, 32)}px`,
                  }}
                >
                  {block.reason && (
                    <span className="ml-2 text-xs text-red-600/80">
                      {block.reason}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Single-day Events */}
            {daySingleEvents.map((event) => {
              const pos = getEventPosition(event.start, event.end);
              if (!pos) return null;
              const hourHeight = 56; // Mobile
              const top = (pos.startHour - HOURS[0]) * hourHeight;
              const height = pos.duration * hourHeight;

              return (
                <div
                  key={event.id}
                  className="absolute left-2 right-2 z-20 sm:left-4 sm:right-4"
                  style={{
                    top: `${top}px`,
                    height: `${Math.max(height, 32)}px`,
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={cn(
                      "h-full w-full overflow-hidden rounded-xl p-2 text-left sm:p-3",
                      "transition-all duration-200 hover:shadow-lg active:scale-[0.99]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
                      EVENT_STATUS_COLORS[event.status] ||
                        EVENT_STATUS_COLORS.default,
                    )}
                  >
                    <div className="text-sm font-semibold sm:text-base">
                      {event.title || t("agendaWorkspace.calendar.eventFallback")}
                    </div>
                    {height > 50 && (
                      <>
                        <div className="mt-1 text-xs opacity-90 sm:text-sm">
                          {parseDate(event.start) &&
                            format(parseDate(event.start), "HH:mm")}
                          {event.end &&
                            ` - ${format(parseDate(event.end), "HH:mm")}`}
                        </div>
                        {event.location_label && (<div className="mt-1 truncate text-xs opacity-80">{t("agendaWorkspace.calendar.locationPrefix", { location: event.location_label })}</div>)}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agenda List (for mobile, shows all events) */}
      <div className="border-t border-warm-gray-dark/40 p-3 sm:hidden">
        <h3 className="mb-2 text-xs font-semibold uppercase text-charcoal-muted">
          {t("agendaWorkspace.calendar.dayEventsTitle")}
        </h3>
        {daySingleEvents.length === 0 && dayMultiDayEvents.length === 0 ? (
          <p className="text-sm text-charcoal-muted">{t("agendaWorkspace.calendar.noEvents")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...dayMultiDayEvents, ...daySingleEvents].map((event) => (
              <EventChip key={event.id} event={event} onClick={onEventClick} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Main Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function OmzCalendar({
  events = [],
  blocks = [],
  initialView = VIEWS.MONTH,
  initialDate = new Date(),
  onEventClick,
  onDateClick,
  className,
}) {
  const { t, i18n } = useTranslation("admin");
  const localeCode = i18n.language === "en" ? "en-US" : "es-MX";
  const dateFnsLocale = i18n.language === "en" ? enUS : es;
  const [view, setView] = useState(initialView);
  const [currentDate, setCurrentDate] = useState(
    startOfDay(parseDate(initialDate) || new Date()),
  );

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (view === VIEWS.MONTH) {
      setCurrentDate((d) => subMonths(d, 1));
    } else if (view === VIEWS.WEEK) {
      setCurrentDate((d) => subWeeks(d, 1));
    } else {
      setCurrentDate((d) => addDays(d, -1));
    }
  }, [view]);

  const handleNext = useCallback(() => {
    if (view === VIEWS.MONTH) {
      setCurrentDate((d) => addMonths(d, 1));
    } else if (view === VIEWS.WEEK) {
      setCurrentDate((d) => addWeeks(d, 1));
    } else {
      setCurrentDate((d) => addDays(d, 1));
    }
  }, [view]);

  const handleToday = useCallback(() => {
    setCurrentDate(startOfDay(new Date()));
  }, []);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  // Normalize events to use consistent properties
  const normalizedEvents = useMemo(() => {
    return events.map((e) => ({
      id: e.id || e.$id,
      title: e.title,
      start: e.start || e.start_at,
      end: e.end || e.end_at,
      status: e.status || "open",
      location_label: e.location_label,
      ...e,
    }));
  }, [events]);

  const normalizedBlocks = useMemo(() => {
    return blocks.map((b) => ({
      id: b.id || b.$id || `block-${Math.random()}`,
      start: b.start || b.start_at,
      end: b.end || b.end_at,
      reason: b.reason,
      ...b,
    }));
  }, [blocks]);

  return (
    <div className={cn("space-y-4", className)}>
      <CalendarHeader
        view={view}
        currentDate={currentDate}
        onViewChange={handleViewChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        t={t}
        dateFnsLocale={dateFnsLocale}
      />

      {view === VIEWS.MONTH && (
        <MonthView
          currentDate={currentDate}
          events={normalizedEvents}
          blocks={normalizedBlocks}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
          t={t}
          localeCode={localeCode}
        />
      )}

      {view === VIEWS.WEEK && (
        <WeekView
          currentDate={currentDate}
          events={normalizedEvents}
          blocks={normalizedBlocks}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
          t={t}
          localeCode={localeCode}
        />
      )}

      {view === VIEWS.DAY && (
        <DayView
          currentDate={currentDate}
          events={normalizedEvents}
          blocks={normalizedBlocks}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
          t={t}
          localeCode={localeCode}
        />
      )}
    </div>
  );
}

// Export view constants for external use
OmzCalendar.VIEWS = VIEWS;


