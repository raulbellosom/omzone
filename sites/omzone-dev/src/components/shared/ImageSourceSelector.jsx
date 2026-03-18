/**
 * ImageSourceSelector — selector de imagen con doble modo:
 *   Tab 1 "Subir imagen"   → sube al bucket public-media (comportamiento estándar).
 *   Tab 2 "Imagen del stock" → elige del bucket stock-images (admin/root).
 *
 * Props:
 *   fileId        {string}   fileId actual (cover_image_id)
 *   bucketId      {string}   bucket actual (cover_image_bucket, '' = public-media)
 *   onFileChange  {(fileId: string, bucketId: string) => void}
 *   label         {string}
 *   aspectRatio   {string}   default "4/3"
 *   className     {string}
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ImageIcon, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MediaUpload from "@/components/shared/MediaUpload";
import StockImagePicker from "@/components/admin/StockImagePicker";
import { getStockPreviewUrl } from "@/lib/stock-images";
import { BUCKET_PUBLIC_MEDIA, BUCKET_STOCK_IMAGES } from "@/env";
import { cn } from "@/lib/utils";

export default function ImageSourceSelector({
  fileId = "",
  bucketId = "",
  onFileChange,
  label,
  aspectRatio = "4/3",
  className,
}) {
  const { t } = useTranslation("admin");
  const [pickerOpen, setPickerOpen] = useState(false);

  const isStock = bucketId === BUCKET_STOCK_IMAGES;

  // localTab controla qué tab está visible — estado UI independiente del valor guardado.
  // Se inicializa en "stock" si el registro ya tiene una imagen de stock.
  const [localTab, setLocalTab] = useState(isStock ? "stock" : "upload");

  // Sincronizar localTab cuando el formulario abre un registro con imagen de stock
  // (ej: el usuario abre "editar clase" y la clase tiene imagen de stock).
  useEffect(() => {
    if (isStock) setLocalTab("stock");
  }, [isStock]);

  function handleTabChange(tab) {
    setLocalTab(tab);
    // Al volver a "upload", limpiar imagen de stock activa
    if (tab === "upload" && isStock) {
      onFileChange("", "");
    }
    // Al ir a "stock", limpiar imagen propia activa (si la hay)
    if (tab === "stock" && !isStock && fileId) {
      onFileChange("", "");
    }
  }

  function handleUploadChange(newFileId) {
    onFileChange(newFileId, newFileId ? BUCKET_PUBLIC_MEDIA : "");
  }

  function handleStockSelect(newFileId) {
    onFileChange(newFileId, BUCKET_STOCK_IMAGES);
  }

  function handleClearStock() {
    onFileChange("", "");
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium text-charcoal">{label}</Label>
      )}

      <Tabs value={localTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-2 mb-3">
          <TabsTrigger value="upload">
            {t("stockImages.imageSource.upload")}
          </TabsTrigger>
          <TabsTrigger value="stock">
            {t("stockImages.imageSource.stock")}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: subir imagen propia */}
        <TabsContent value="upload" className="mt-0">
          <MediaUpload
            value={!isStock ? fileId : ""}
            onChange={handleUploadChange}
            aspectRatio={aspectRatio}
            label=""
          />
        </TabsContent>

        {/* Tab 2: imagen del stock */}
        <TabsContent value="stock" className="mt-0">
          {fileId && isStock ? (
            <StockPreview
              fileId={fileId}
              aspectRatio={aspectRatio}
              onClear={handleClearStock}
              onChangePicker={() => setPickerOpen(true)}
              t={t}
            />
          ) : (
            <StockEmpty
              aspectRatio={aspectRatio}
              onOpen={() => setPickerOpen(true)}
              t={t}
            />
          )}
        </TabsContent>
      </Tabs>

      <StockImagePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleStockSelect}
        selectedId={isStock ? fileId : undefined}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StockPreview({ fileId, aspectRatio, onClear, onChangePicker, t }) {
  const previewUrl = getStockPreviewUrl(fileId, 900, 0, 80);

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-lg overflow-hidden border border-sand bg-sand/20 group"
        style={{ aspectRatio }}
      >
        <img
          src={previewUrl}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="bg-white text-charcoal border-white hover:bg-white/90 hover:text-charcoal font-medium shadow"
            onClick={onChangePicker}
          >
            {t("stockImages.imageSource.changeStock")}
          </Button>
          <Button type="button" size="icon" variant="destructive" className="h-8 w-8 shadow" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-charcoal/60 text-center">
        {t("stockImages.imageSource.currentStock")}
      </p>
    </div>
  );
}

function StockEmpty({ aspectRatio, onOpen, t }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-lg border-2 border-dashed border-sand",
        "flex flex-col items-center justify-center gap-2",
        "hover:border-sage/60 hover:bg-sand/20 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
      )}
      style={{ aspectRatio }}
    >
      <ImageIcon className="h-8 w-8 text-charcoal/30" />
      <span className="text-sm font-medium text-charcoal/60">
        {t("stockImages.imageSource.selectFromStock")}
      </span>
    </button>
  );
}
