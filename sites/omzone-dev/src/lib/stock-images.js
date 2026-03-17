/**
 * stock-images.js — Helper to build preview/view URLs for the stock-images bucket.
 */
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  BUCKET_STOCK_IMAGES,
} from "@/env";

/** IDs of stock images uploaded to the stock-images bucket. */
export const STOCK = {
  YOGA_BEACH_TWO_GIRLS: "69b8ebf700128cb595cf",
  SURF_SUNSET_NATURE: "69b8ebfe0029a8f17a98",
  GIRL_BEACH_SUNSET: "69b8ec09003c075a00c8",
  SURF_LOS_ARCOS: "69b8ec0e00107c7915ca",
  YOGA_NATURE_TWO: "69b8efed000a9f40df28",
};

/**
 * Build a preview URL for a stock image.
 * @param {string} fileId
 * @param {number} width
 * @param {number} height  0 = proportional
 * @param {number} quality
 */
export function getStockPreviewUrl(
  fileId,
  width = 1200,
  height = 0,
  quality = 80,
) {
  if (!fileId) return null;
  const params = new URLSearchParams({
    project: APPWRITE_PROJECT_ID,
    width: String(width),
    ...(height > 0 && { height: String(height) }),
    quality: String(quality),
    output: "webp",
  });
  return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_STOCK_IMAGES}/files/${fileId}/preview?${params}`;
}

/** Build a view URL for a stock image (original). */
export function getStockViewUrl(fileId) {
  if (!fileId) return null;
  const params = new URLSearchParams({ project: APPWRITE_PROJECT_ID });
  return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_STOCK_IMAGES}/files/${fileId}/view?${params}`;
}
