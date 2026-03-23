/**
 * MultiImageSelector — selector de hasta 3 imágenes con modo exclusivo:
 *   - Modo "upload": todas las imágenes se suben al bucket public-media
 *   - Modo "stock": todas las imágenes vienen del bucket stock-images
 *   NO se permite mezclar imágenes de distintos buckets.
 *
 * Props:
 *   images        {Array<{id: string, bucket: string}>}  Lista actual de imágenes
 *   onChange      {(images: Array<{id, bucket}>) => void}
 *   maxImages     {number}   Máximo de imágenes (default 3)
 *   label         {string}
 *   aspectRatio   {string}   default "4/3"
 *   className     {string}
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ImageIcon, Plus, X, GripVertical } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MediaUpload from "@/components/shared/MediaUpload";
import StockImagePicker from "@/components/admin/StockImagePicker";
import { getStockPreviewUrl } from "@/lib/stock-images";
import { getMediaPreviewUrl } from "@/lib/media";
import { BUCKET_PUBLIC_MEDIA, BUCKET_STOCK_IMAGES } from "@/env";
import { cn } from "@/lib/utils";

const MAX_IMAGES_DEFAULT = 3;

export default function MultiImageSelector({
  images = [],
  onChange,
  maxImages = MAX_IMAGES_DEFAULT,
  label,
  aspectRatio = "4/3",
  className,
}) {
  const { t } = useTranslation("admin");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);

  // Detectar modo actual basado en las imágenes existentes
  const currentMode =
    images.length > 0
      ? images[0].bucket === BUCKET_STOCK_IMAGES
        ? "stock"
        : "upload"
      : null;

  // Tab local para UI - solo importa cuando no hay imágenes
  const [localTab, setLocalTab] = useState(currentMode || "upload");

  // Sincronizar tab cuando cambian las imágenes
  useEffect(() => {
    if (currentMode) {
      setLocalTab(currentMode);
    }
  }, [currentMode]);

  const canAddMore = images.length < maxImages;
  const activeMode = currentMode || localTab;

  function handleTabChange(newTab) {
    // Si ya hay imágenes, no permitir cambiar de modo
    if (images.length > 0 && newTab !== currentMode) {
      return;
    }
    setLocalTab(newTab);
  }

  function handleUploadChange(fileId, slot) {
    if (!fileId) {
      // Remover imagen del slot
      const newImages = images.filter((_, i) => i !== slot);
      onChange(newImages);
      return;
    }

    const newImage = { id: fileId, bucket: BUCKET_PUBLIC_MEDIA };
    if (slot < images.length) {
      // Reemplazar imagen existente
      const newImages = [...images];
      newImages[slot] = newImage;
      onChange(newImages);
    } else {
      // Agregar nueva imagen
      onChange([...images, newImage]);
    }
  }

  function handleStockSelect(fileId) {
    if (!fileId) return;

    const newImage = { id: fileId, bucket: BUCKET_STOCK_IMAGES };
    if (pendingSlot !== null && pendingSlot < images.length) {
      // Reemplazar en slot específico
      const newImages = [...images];
      newImages[pendingSlot] = newImage;
      onChange(newImages);
    } else {
      // Agregar nueva
      onChange([...images, newImage]);
    }
    setPickerOpen(false);
    setPendingSlot(null);
  }

  function handleRemove(index) {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  }

  function handleClearAll() {
    onChange([]);
  }

  function openStockPicker(slot = null) {
    setPendingSlot(slot);
    setPickerOpen(true);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-charcoal">{label}</Label>
          {images.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-charcoal/60 hover:text-destructive"
              onClick={handleClearAll}
            >
              {t("multiImage.clearAll")}
            </Button>
          )}
        </div>
      )}

      <Tabs value={localTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger
            value="upload"
            disabled={images.length > 0 && currentMode !== "upload"}
            className={cn(
              images.length > 0 &&
                currentMode !== "upload" &&
                "opacity-50 cursor-not-allowed",
            )}
          >
            {t("stockImages.imageSource.upload")}
          </TabsTrigger>
          <TabsTrigger
            value="stock"
            disabled={images.length > 0 && currentMode !== "stock"}
            className={cn(
              images.length > 0 &&
                currentMode !== "stock" &&
                "opacity-50 cursor-not-allowed",
            )}
          >
            {t("stockImages.imageSource.stock")}
          </TabsTrigger>
        </TabsList>

        {/* Mensaje indicando el modo fijado */}
        {images.length > 0 && (
          <p className="text-xs text-charcoal/60 mb-3 text-center">
            {activeMode === "stock"
              ? t("multiImage.modeLockedStock")
              : t("multiImage.modeLockedUpload")}
          </p>
        )}

        {/* Tab: Subir imágenes */}
        <TabsContent value="upload" className="mt-0">
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Slots de imágenes existentes */}
            {images.map((img, index) => (
              <UploadSlot
                key={index}
                fileId={img.id}
                aspectRatio={aspectRatio}
                onReplace={(newFileId) => handleUploadChange(newFileId, index)}
                onRemove={() => handleRemove(index)}
                slotNumber={index + 1}
                t={t}
              />
            ))}
            {/* Slot vacío para agregar */}
            {canAddMore && (
              <UploadEmptySlot
                aspectRatio={aspectRatio}
                onUpload={(fileId) => handleUploadChange(fileId, images.length)}
                slotNumber={images.length + 1}
                t={t}
              />
            )}
          </div>
        </TabsContent>

        {/* Tab: Imágenes de stock */}
        <TabsContent value="stock" className="mt-0">
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Slots de imágenes existentes */}
            {images.map((img, index) => (
              <StockSlot
                key={index}
                fileId={img.id}
                aspectRatio={aspectRatio}
                onReplace={() => openStockPicker(index)}
                onRemove={() => handleRemove(index)}
                slotNumber={index + 1}
                t={t}
              />
            ))}
            {/* Slot vacío para agregar */}
            {canAddMore && (
              <StockEmptySlot
                aspectRatio={aspectRatio}
                onClick={() => openStockPicker(null)}
                slotNumber={images.length + 1}
                t={t}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contador */}
      <p className="text-xs text-charcoal/50 text-center">
        {t("multiImage.counter", { count: images.length, max: maxImages })}
      </p>

      <StockImagePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleStockSelect}
        selectedId={
          pendingSlot !== null &&
          images[pendingSlot]?.bucket === BUCKET_STOCK_IMAGES
            ? images[pendingSlot]?.id
            : undefined
        }
      />
    </div>
  );
}

// ── Sub-components: Upload Mode ───────────────────────────────────────────────

function UploadSlot({
  fileId,
  aspectRatio,
  onReplace,
  onRemove,
  slotNumber,
  t,
}) {
  const previewUrl = getMediaPreviewUrl(fileId, 400, 300, 80);

  return (
    <div className="relative group">
      <div
        className="rounded-lg overflow-hidden border border-sand bg-sand/20"
        style={{ aspectRatio }}
      >
        <img
          src={previewUrl}
          alt={`Imagen ${slotNumber}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <MediaUpload
            value=""
            onChange={onReplace}
            aspectRatio="1"
            label=""
            className="hidden"
          />
          <label className="cursor-pointer">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-white text-charcoal border-white hover:bg-white/90 font-medium shadow pointer-events-none"
            >
              {t("multiImage.replace")}
            </Button>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const { uploadMediaFile } = await import("@/lib/media");
                  const newFileId = await uploadMediaFile(file);
                  if (newFileId) onReplace(newFileId);
                }
                e.target.value = "";
              }}
            />
          </label>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="h-8 w-8 shadow"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <span className="absolute top-2 left-2 bg-charcoal/70 text-white text-xs px-2 py-0.5 rounded">
        {slotNumber}
      </span>
    </div>
  );
}

function UploadEmptySlot({ aspectRatio, onUpload, slotNumber, t }) {
  return (
    <label
      className={cn(
        "relative cursor-pointer rounded-lg border-2 border-dashed border-sand",
        "flex flex-col items-center justify-center gap-2",
        "hover:border-sage/60 hover:bg-sand/20 transition-colors",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-sage",
      )}
      style={{ aspectRatio }}
    >
      <Plus className="h-6 w-6 text-charcoal/30" />
      <span className="text-xs font-medium text-charcoal/50">
        {t("multiImage.addImage")}
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const { uploadMediaFile } = await import("@/lib/media");
            const newFileId = await uploadMediaFile(file);
            if (newFileId) onUpload(newFileId);
          }
          e.target.value = "";
        }}
      />
      <span className="absolute top-2 left-2 bg-charcoal/50 text-white text-xs px-2 py-0.5 rounded">
        {slotNumber}
      </span>
    </label>
  );
}

// ── Sub-components: Stock Mode ────────────────────────────────────────────────

function StockSlot({
  fileId,
  aspectRatio,
  onReplace,
  onRemove,
  slotNumber,
  t,
}) {
  const previewUrl = getStockPreviewUrl(fileId, 400, 300, 80);

  return (
    <div className="relative group">
      <div
        className="rounded-lg overflow-hidden border border-sand bg-sand/20"
        style={{ aspectRatio }}
      >
        <img
          src={previewUrl}
          alt={`Imagen ${slotNumber}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="bg-white text-charcoal border-white hover:bg-white/90 font-medium shadow"
            onClick={onReplace}
          >
            {t("multiImage.replace")}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="h-8 w-8 shadow"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <span className="absolute top-2 left-2 bg-charcoal/70 text-white text-xs px-2 py-0.5 rounded">
        {slotNumber}
      </span>
    </div>
  );
}

function StockEmptySlot({ aspectRatio, onClick, slotNumber, t }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-lg border-2 border-dashed border-sand",
        "flex flex-col items-center justify-center gap-2",
        "hover:border-sage/60 hover:bg-sand/20 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
      )}
      style={{ aspectRatio }}
    >
      <ImageIcon className="h-6 w-6 text-charcoal/30" />
      <span className="text-xs font-medium text-charcoal/50">
        {t("multiImage.selectStock")}
      </span>
      <span className="absolute top-2 left-2 bg-charcoal/50 text-white text-xs px-2 py-0.5 rounded">
        {slotNumber}
      </span>
    </button>
  );
}
