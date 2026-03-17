/**
 * MediaUpload — componente de carga de imagen hacia Appwrite Storage.
 *
 * Muestra un drop-zone cuando no hay imagen, y un preview con controles
 * de reemplazo y eliminación cuando hay fileId guardado.
 *
 * Props:
 *   value       {string}   fileId actual (vacío si no tiene imagen)
 *   onChange    {Function} llamada con el nuevo fileId (o '' para limpiar)
 *   label       {string}   etiqueta del campo
 *   hint        {string}   texto de ayuda bajo el drop-zone
 *   aspectRatio {string}   CSS aspect-ratio del área (default "16/9")
 *   className   {string}
 */
import { useRef, useState } from "react";
import {
  ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  uploadMediaFile,
  deleteMediaFile,
  getMediaPreviewUrl,
} from "@/lib/media";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

export default function MediaUpload({
  value = "",
  onChange,
  label = "Imagen de portada",
  hint = "JPG, PNG o WebP · máx 10 MB",
  aspectRatio = "16/9",
  className,
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const previewUrl = value ? getMediaPreviewUrl(value, 1200, 800, 85) : null;

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      // Si ya hay una imagen, intentar borrar la anterior al reemplazar
      if (value) await deleteMediaFile(value);
      const fileId = await uploadMediaFile(file);
      onChange(fileId);
    } catch (err) {
      setError("No se pudo subir la imagen. Verifica el tamaño y formato.");
    } finally {
      setLoading(false);
      // Limpiar input para permitir re-selección del mismo archivo
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (value) await deleteMediaFile(value);
    onChange("");
  }

  function onInputChange(e) {
    handleFile(e.target.files?.[0]);
  }

  function onDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label>{label}</Label>}

      {/* ── Preview ─────────────────────────────────────────────── */}
      {previewUrl ? (
        <div
          className="group relative overflow-hidden rounded-2xl bg-warm-gray"
          style={{ aspectRatio }}
        >
          <img
            src={previewUrl}
            alt="Cover preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay controls — aparecen al hover */}
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white text-charcoal rounded-full gap-1.5 shadow-sm"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Cambiar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-red-50 text-red-500 rounded-full gap-1.5 shadow-sm"
              onClick={handleRemove}
              disabled={loading}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Quitar
            </Button>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-charcoal/50 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        /* ── Drop-zone ─────────────────────────────────────────── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          disabled={loading}
          className={cn(
            "w-full rounded-2xl border-2 border-dashed border-warm-gray-dark/60",
            "hover:border-sage hover:bg-sage/5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2",
            "transition-colors duration-200",
            "flex flex-col items-center justify-center gap-3",
            loading && "pointer-events-none",
          )}
          style={{ aspectRatio }}
          aria-label="Subir imagen"
        >
          {loading ? (
            <>
              <Loader2 className="w-9 h-9 text-sage animate-spin" />
              <span className="text-sm text-charcoal-muted">
                Subiendo imagen…
              </span>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-gray text-charcoal-muted">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-charcoal">
                  Haz clic o arrastra una imagen
                </p>
                <p className="text-xs text-charcoal-subtle mt-1">{hint}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-sage font-medium">
                <ImageIcon className="w-3.5 h-3.5" />
                Elegir archivo
              </div>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
