/**
 * AdminStockImagesPage — gestión del banco de imágenes compartidas.
 * Ruta: /app/stock-images  (root-only)
 *
 * Permite a los usuarios root subir, visualizar y eliminar imágenes
 * del bucket stock-images que los admins pueden usar en clases y sesiones.
 */
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, Trash2, Images } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import ReusableModal from "@/components/shared/ReusableModal";
import { getStockPreviewUrl } from "@/lib/stock-images";
import {
  useStockImages,
  useUploadStockImage,
  useDeleteStockImage,
} from "@/hooks/useAdmin";

export default function AdminStockImagesPage() {
  const { t } = useTranslation("admin");
  const fileInputRef = useRef(null);
  const [pendingDelete, setPendingDelete] = useState(null); // { $id, name }

  const { data: files = [], isLoading } = useStockImages();
  const upload = useUploadStockImage();
  const remove = useDeleteStockImage();

  // ── Upload ────────────────────────────────────────────────────────────────

  async function handleFilesSelected(e) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    // reset input so same file can be re-selected
    e.target.value = "";

    let successCount = 0;
    for (const file of selected) {
      try {
        await upload.mutateAsync(file);
        successCount++;
      } catch {
        toast.error(t("stockImages.uploadError", { name: file.name }));
      }
    }
    if (successCount > 0) {
      toast.success(
        t("stockImages.uploadSuccess", { count: successCount }),
      );
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  function handleDeleteConfirm() {
    if (!pendingDelete) return;
    remove.mutate(pendingDelete.$id, {
      onSuccess: () => {
        toast.success(t("stockImages.deleteSuccess"));
        setPendingDelete(null);
      },
      onError: () => {
        toast.error(t("stockImages.deleteError"));
        setPendingDelete(null);
      },
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AdminPageHeader
        title={t("stockImages.title")}
        subtitle={t("stockImages.subtitle")}
        action={
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={handleFilesSelected}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={upload.isPending}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {upload.isPending
                ? t("stockImages.uploading")
                : t("stockImages.upload")}
            </Button>
          </>
        }
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <EmptyState t={t} onUpload={() => fileInputRef.current?.click()} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => (
            <ImageTile
              key={file.$id}
              file={file}
              onDelete={() => setPendingDelete(file)}
            />
          ))}
        </div>
      )}

      {/* Confirm delete dialog */}
      <ReusableModal
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={t("stockImages.deleteConfirm")}
        description={t("stockImages.deleteWarning")}
        footerActions={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={remove.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={remove.isPending}
            >
              {t("common.delete")}
            </Button>
          </div>
        }
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ImageTile({ file, onDelete }) {
  const previewUrl = getStockPreviewUrl(file.$id, 400, 400, 75);
  const name = file.name ?? file.$id;

  return (
    <div className="group relative rounded-xl overflow-hidden border border-sand bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden bg-sand/30">
        <img
          src={previewUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          size="icon"
          variant="destructive"
          className="h-9 w-9"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Filename */}
      <div className="px-2 py-1.5 text-xs text-charcoal truncate border-t border-sand bg-white">
        {name}
      </div>
    </div>
  );
}

function EmptyState({ t, onUpload }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-sand/50 flex items-center justify-center">
        <Images className="h-8 w-8 text-charcoal/40" />
      </div>
      <div>
        <p className="font-medium text-charcoal">{t("stockImages.empty")}</p>
        <p className="text-sm text-charcoal/60 mt-1">
          {t("stockImages.emptyHint")}
        </p>
      </div>
      <Button variant="outline" onClick={onUpload} className="gap-2">
        <Upload className="h-4 w-4" />
        {t("stockImages.upload")}
      </Button>
    </div>
  );
}
