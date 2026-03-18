/**
 * StockImagePicker — modal grid para seleccionar una imagen del stock.
 *
 * Props:
 *   open         {boolean}
 *   onOpenChange {(open: boolean) => void}
 *   onSelect     {(fileId: string) => void}  — llamado al elegir una imagen
 *   selectedId   {string}  — fileId actualmente seleccionado (highlight)
 */
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Images, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReusableModal from "@/components/shared/ReusableModal";
import { getStockPreviewUrl } from "@/lib/stock-images";
import { useStockImages } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

export default function StockImagePicker({
  open,
  onOpenChange,
  onSelect,
  selectedId,
}) {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useState("");

  const { data: files = [], isLoading, isError } = useStockImages();

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter((f) => (f.name ?? "").toLowerCase().includes(q));
  }, [files, search]);

  function handleSelect(file) {
    onSelect(file.$id);
    onOpenChange(false);
  }

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("stockImages.pickTitle")}
      contentClassName="max-w-3xl"
      bodyClassName="flex flex-col gap-4"
      footerActions={
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("common.cancel")}
        </Button>
      }
    >
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("stockImages.searchPlaceholder")}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-sm text-charcoal/60">
            {t("stockImages.loadError", "Error al cargar las imágenes del stock.")}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <Images className="h-10 w-10 text-charcoal/30" />
          <p className="text-sm text-charcoal/60">{t("stockImages.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((file) => {
            const isSelected = file.$id === selectedId;
            return (
              <button
                key={file.$id}
                type="button"
                onClick={() => handleSelect(file)}
                className={cn(
                  "group relative rounded-lg overflow-hidden border-2 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
                  isSelected
                    ? "border-sage shadow-md"
                    : "border-sand hover:border-sage/60",
                )}
              >
                <div className="aspect-square overflow-hidden bg-sand/30">
                  <img
                    src={getStockPreviewUrl(file.$id, 300, 300, 70)}
                    alt={file.name ?? file.$id}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
                <div className="px-1.5 py-1 text-xs text-charcoal truncate bg-white border-t border-sand">
                  {file.name ?? file.$id}
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-sage flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </ReusableModal>
  );
}
