/**
 * AdminLeadsPage — bandeja de mensajes de contacto.
 * Ruta: /app/leads
 */
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  Archive,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DateRangePicker from "@/components/shared/DateRangePicker";
import { useAdminLeads, useUpdateLeadStatus } from "@/hooks/useAdmin";
import AdminPageHeader from "@/components/shared/AdminPageHeader";

const STATUS_BADGE = {
  new: "default",
  read: "outline",
  archived: "sage",
};

const STATUS_ICON = {
  new: Mail,
  read: MailOpen,
  archived: Archive,
};

const PAGE_SIZE = 10;

function MessageCard({ msg, t, dateFnsLocale }) {
  const [open, setOpen] = useState(false);
  const updateStatus = useUpdateLeadStatus();

  function handleStatus(status) {
    updateStatus.mutate(
      { leadId: msg.$id, status },
      {
        onSuccess: () => toast.success(t(`messages.statusChanged`)),
        onError: () => toast.error(t("common.error")),
      },
    );
  }

  const StIcon = STATUS_ICON[msg.status] ?? Mail;

  return (
    <Card className="animate-fade-in-up">
      <CardContent className="p-0">
        <button
          className="w-full flex items-center justify-between px-5 py-4 gap-3 hover:bg-cream/40 transition-colors text-left"
          onClick={() => {
            setOpen((p) => !p);
            if (msg.status === "new") handleStatus("read");
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center shrink-0">
              <StIcon className="w-4 h-4 text-charcoal-muted" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm text-charcoal truncate ${msg.status === "new" ? "font-bold" : "font-medium"}`}
              >
                {msg.full_name}
              </p>
              <p className="text-xs text-charcoal-muted truncate">
                {msg.subject || msg.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={STATUS_BADGE[msg.status] ?? "default"}
              className="text-[10px]"
            >
              {t(`messages.status.${msg.status}`)}
            </Badge>
            <span className="text-xs text-charcoal-muted hidden md:inline">
              {format(new Date(msg.$createdAt), "d MMM", {
                locale: dateFnsLocale,
              })}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-charcoal-subtle transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {open && (
          <div className="px-5 pb-5 pt-2 border-t border-warm-gray-dark/20 space-y-3">
            <div>
              <p className="text-xs font-medium text-charcoal-muted mb-1">
                {t("messages.fields.email")}
              </p>
              <p className="text-sm text-charcoal">{msg.email}</p>
            </div>
            {msg.phone && (
              <div>
                <p className="text-xs font-medium text-charcoal-muted mb-1">
                  {t("messages.fields.phone")}
                </p>
                <p className="text-sm text-charcoal">{msg.phone}</p>
              </div>
            )}
            {msg.subject && (
              <div>
                <p className="text-xs font-medium text-charcoal-muted mb-1">
                  {t("messages.fields.subject")}
                </p>
                <p className="text-sm text-charcoal">{msg.subject}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-charcoal-muted mb-1">
                {t("messages.fields.message")}
              </p>
              <p className="text-sm text-charcoal whitespace-pre-line">
                {msg.message}
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              {msg.status !== "read" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatus("read")}
                  disabled={updateStatus.isPending}
                  className="gap-1.5 text-xs"
                >
                  <MailOpen className="w-3.5 h-3.5" /> {t("messages.markRead")}
                </Button>
              )}
              {msg.status !== "archived" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatus("archived")}
                  disabled={updateStatus.isPending}
                  className="gap-1.5 text-xs"
                >
                  <Archive className="w-3.5 h-3.5" /> {t("messages.archive")}
                </Button>
              )}
              {msg.status === "archived" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatus("read")}
                  disabled={updateStatus.isPending}
                  className="gap-1.5 text-xs"
                >
                  <MailOpen className="w-3.5 h-3.5" /> {t("messages.unarchive")}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminLeadsPage() {
  const { t, i18n } = useTranslation("admin");
  const dateFnsLocale = i18n.language === "es" ? es : enUS;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { data: leads, isLoading } = useAdminLeads();

  // Client-side filtering: status → search → dates
  const filtered = useMemo(() => {
    if (!leads) return [];
    let list = filter === "all" ? leads : leads.filter((m) => m.status === filter);

    // Full-text search across name, email, subject, message, phone
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.full_name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.subject?.toLowerCase().includes(q) ||
          m.message?.toLowerCase().includes(q) ||
          m.phone?.toLowerCase().includes(q),
      );
    }

    // Date range filter
    if (dateRange.from) {
      const from = startOfDay(dateRange.from);
      list = list.filter((m) => !isBefore(new Date(m.$createdAt), from));
    }
    if (dateRange.to) {
      const to = endOfDay(dateRange.to);
      list = list.filter((m) => !isAfter(new Date(m.$createdAt), to));
    }

    return list;
  }, [leads, filter, search, dateRange]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePageNum = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePageNum - 1) * PAGE_SIZE,
    safePageNum * PAGE_SIZE,
  );

  // Reset page when filters change
  function changeFilter(key) {
    setFilter(key);
    setPage(1);
  }
  function changeSearch(val) {
    setSearch(val);
    setPage(1);
  }
  function changeDateRange(range) {
    setDateRange(range);
    setPage(1);
  }

  const hasActiveFilters = search || dateRange.from || dateRange.to;
  const activeFilterCount =
    (search ? 1 : 0) + (dateRange.from || dateRange.to ? 1 : 0);

  function clearFilters() {
    setSearch("");
    setDateRange({ from: undefined, to: undefined });
    setPage(1);
  }

  const counts = {
    all: leads?.length ?? 0,
    new: leads?.filter((m) => m.status === "new").length ?? 0,
    read: leads?.filter((m) => m.status === "read").length ?? 0,
    archived: leads?.filter((m) => m.status === "archived").length ?? 0,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader
        title={t("messages.title")}
        subtitle={t("messages.subtitle")}
      />

      {/* Search + Filters toggle row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-subtle" />
          <Input
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder={t("messages.searchPlaceholder")}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => changeSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="gap-1.5 shrink-0 relative"
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("messages.filters")}</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-sage text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Collapsible filter bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl bg-warm-gray/30 border border-warm-gray-dark/20 animate-fade-in-up">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onChange={changeDateRange}
            placeholder={t("messages.dateRange")}
            locale={dateFnsLocale}
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-sage hover:text-sage/80 transition-colors underline underline-offset-2 ml-auto"
            >
              {t("messages.clearFilters")}
            </button>
          )}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "new", "read", "archived"].map((key) => (
          <button
            key={key}
            onClick={() => changeFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              filter === key
                ? "bg-sage text-white border-sage"
                : "border-warm-gray-dark/40 text-charcoal hover:border-sage/50"
            }`}
          >
            {t(`messages.filter.${key}`)} ({counts[key]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : paged.length > 0 ? (
        <>
          <div className="space-y-3">
            {paged.map((msg, idx) => (
              <div key={msg.$id} style={{ animationDelay: `${idx * 40}ms` }}>
                <MessageCard msg={msg} t={t} dateFnsLocale={dateFnsLocale} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-warm-gray-dark/20">
              <p className="text-xs text-charcoal-muted">
                {t("messages.pagination.showing", {
                  from: (safePageNum - 1) * PAGE_SIZE + 1,
                  to: Math.min(safePageNum * PAGE_SIZE, filtered.length),
                  total: filtered.length,
                })}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePageNum <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                      n === safePageNum
                        ? "bg-sage text-white"
                        : "text-charcoal hover:bg-warm-gray/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePageNum >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <Mail className="w-10 h-10 text-charcoal-subtle mx-auto mb-3" />
            <p className="text-sm text-charcoal-muted">
              {hasActiveFilters ? t("messages.noResults") : t("common.noData")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
