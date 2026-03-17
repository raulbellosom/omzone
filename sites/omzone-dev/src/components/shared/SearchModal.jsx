/**
 * SearchModal — fullscreen search overlay for mobile.
 * Opens as a dialog; includes a text input + recent/popular suggestions.
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ROUTES from "@/constants/routes";

const QUICK_LINKS = [
  { key: "classes", href: "/classes" },
  { key: "packages", href: "/packages" },
  { key: "wellness", href: "/wellness" },
];

export default function SearchModal({ open, onOpenChange }) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setQuery("");
      // Focus input after animation
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
    navigate(`${ROUTES.CLASSES}?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 z-50 m-0 flex max-h-full max-w-full flex-col rounded-none border-0 bg-cream p-0 sm:inset-4 sm:m-auto sm:max-h-[min(600px,90vh)] sm:max-w-lg sm:rounded-2xl sm:border sm:border-warm-gray-dark/40">
        <DialogTitle className="sr-only">{t("actions.search")}</DialogTitle>
        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border-b border-warm-gray-dark/40 px-4 sm:px-5"
        >
          <Search className="w-5 h-5 text-charcoal-subtle shrink-0" />
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

        {/* Suggestions */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5">
          <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {t("actions.search")}
          </p>
          <ul className="space-y-1">
            {QUICK_LINKS.map(({ key, href }) => (
              <li key={key}>
                <button
                  onClick={() => handleGo(href)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-charcoal hover:bg-warm-gray transition-colors"
                >
                  {t(`nav.${key}`)}
                  <ArrowRight className="w-4 h-4 text-charcoal-subtle" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
