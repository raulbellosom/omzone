/**
 * media.js — Utilidades para Appwrite Storage (bucket: public-media).
 *
 * Genera URLs de preview/view y expone helpers de upload/delete
 * para imágenes públicas del catálogo (clases, sesiones, productos, etc.)
 */
import { ID } from "appwrite";
import { storage } from "@/services/appwrite/client";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  BUCKET_PUBLIC_MEDIA,
} from "@/env";

/**
 * URL de preview con redimensionado server-side.
 * Usa la API REST directamente para compatibilidad máxima.
 * @param {string|null} fileId
 * @param {number} width  — ancho en px (default 800)
 * @param {number} height — alto  en px (default 600, 0 = proporcional)
 * @param {number} quality — 1-100 (default 80)
 * @returns {string|null}
 */
export function getMediaPreviewUrl(
  fileId,
  width = 800,
  height = 600,
  quality = 80,
) {
  if (!fileId) return null;
  const params = new URLSearchParams({
    project: APPWRITE_PROJECT_ID,
    width: String(width),
    height: String(height),
    quality: String(quality),
    output: "webp",
  });
  return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_PUBLIC_MEDIA}/files/${fileId}/preview?${params}`;
}

/**
 * URL de descarga/vista del archivo original.
 */
export function getMediaViewUrl(fileId) {
  if (!fileId) return null;
  const params = new URLSearchParams({ project: APPWRITE_PROJECT_ID });
  return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_PUBLIC_MEDIA}/files/${fileId}/view?${params}`;
}

/**
 * Sube un File al bucket public-media.
 * @param {File} file
 * @returns {Promise<string>} fileId
 */
export async function uploadMediaFile(file) {
  const doc = await storage.createFile(BUCKET_PUBLIC_MEDIA, ID.unique(), file);
  return doc.$id;
}

/**
 * Elimina un archivo del bucket public-media (requiere label:admin).
 * Silencia errores (el archivo puede no existir).
 */
export async function deleteMediaFile(fileId) {
  if (!fileId) return;
  try {
    await storage.deleteFile(BUCKET_PUBLIC_MEDIA, fileId);
  } catch {
    // silenciar — el archivo puede haber sido eliminado externamente
  }
}
