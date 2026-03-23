/**
 * SearchModal — search overlay with live results.
 * Mobile: fullscreen. Desktop (sm+): centered card.
 * Searches offerings via Appwrite.
 */
import { useState, useRef, useEffect, useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Calendar,
  Compass,
  Home,
  Heart,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import ROUTES from "@/constants/routes";
import { useSearch } from "@/hooks/useSearch";
import { resolveField, getActiveLang } from "@/lib/i18n-data";
import { getPreviewUrl, getFirstImageUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA } from "@/env";

const QUICK_LINKS = [
  { key: "sessions", href: ROUTES.SESSIONS, icon: Calendar },
  { key: "immersions", href: ROUTES.IMMERSIONS, icon: Compass },
  { key: "stays", href: ROUTES.STAYS, icon: Home },
  { key: "services", href: ROUTES.SERVICES, icon: Heart },
  { key: "agenda", href: ROUTES.AGENDA, icon: Calendar },
];

/** Map offering category → public listing route */
function offeringHref(offering) {
  const slug = offering.slug;
  switch (offering.category) {
    case "wellness_studio":
      return ROUTES.SESSION_DETAIL(slug);
    case "immersion":
      return ROUTES.IMMERSION_DETAIL(slug);
    case "stay":
      return ROUTES.STAY_DETAIL(slug);
    case "service":
      return ROUTES.SERVICE_DETAIL(slug);
    default:
      return ROUTES.SESSION_DETAIL(slug);
  }
}

export default function SearchModal({ open, onOpenChange }) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const locale = getActiveLang();
  const { data: offerings, isFetching } = useSearch(deferredQuery, { locale });

  useEffect(() => {
    if (open) {
      setQuery("");
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [open]);

  function handleGo(href) {
    onOpenChange(false);
    navigate(href);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    onOpenChange(false);
    navigate(`${ROUTES.SESSIONS}?q=${encodeURIComponent(query.trim())}`);
  }

  const hasQuery = deferredQuery.trim().length >= 2;
  const hasResults = Array.isArray(offerings) && offerings.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col bg-cream data-[state=open]:animate-fade-in-up sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[min(600px,90vh)] sm:w-full sm:max-w-lg sm:rounded-2xl sm:border sm:border-warm-gray-dark/40 sm:shadow-modal"
        >
          <DialogTitle className="sr-only">{t("actions.search")}</DialogTitle>

          {/* Search bar */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 border-b border-warm-gray-dark/40 px-4 sm:px-5 shrink-0"
          >
            {isFetching ? (
              <Loader2 className="w-5 h-5 text-sage shrink-0 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-charcoal-subtle shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("actions.search")}
              className="flex-1 h-14 bg-transparent text-charcoal text-base placeholder:text-charcoal-subtle outline-none"
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg hover:bg-warm-gray transition-colors text-charcoal-muted"
              aria-label={t("actions.close")}
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
            {hasQuery && hasResults ? (
              <SearchResults offerings={offerings} onGo={handleGo} t={t} />
            ) : hasQuery && !isFetching && !hasResults ? (
              <p className="text-sm text-charcoal-subtle text-center py-8">
                {t("empty.noResults")}
              </p>
            ) : (
              <QuickLinks onGo={handleGo} t={t} />
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

/* ── Quick links (default state) ─────────────────────────────────── */

function QuickLinks({ onGo, t }) {
  return (
    <>
      <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        {t("actions.search")}
      </p>
      <ul className="space-y-1">
        {QUICK_LINKS.map(({ key, href, icon: Icon }) => (
          <li key={key}>
            <button
              onClick={() => onGo(href)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-charcoal hover:bg-warm-gray transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-charcoal-subtle" />
                {t(`nav.${key}`)}
              </span>
              <ArrowRight className="w-4 h-4 text-charcoal-subtle" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ── Search results ──────────────────────────────────────────────── */

function SearchResults({ offerings, onGo, t }) {
  return (
    <div>
      <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        {t("empty.noResults", { defaultValue: "Resultados" }).replace(
          t("empty.noResults"),
          "Resultados",
        )}
      </p>
      <ul className="space-y-0.5">
        {offerings.map((item) => (
          <li key={item.$id}>
            <button
              onClick={() => onGo(offeringHref(item))}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-warm-gray transition-colors"
            >
              {(() => {
                const thumbUrl =
                  getFirstImageUrl(item.images_json, 80, 80, 70) ??
                  (item.cover_image_id
                    ? getPreviewUrl(
                        item.cover_image_id,
                        item.cover_image_bucket ?? BUCKET_PUBLIC_MEDIA,
                        80,
                        80,
                        70,
                      )
                    : null);
                return thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0 bg-warm-gray"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-warm-gray shrink-0" />
                );
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">
                  {resolveField(item, "title")}
                </p>
                {resolveField(item, "summary") && (
                  <p className="text-xs text-charcoal-subtle truncate">
                    {resolveField(item, "summary")}
                  </p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-subtle shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
