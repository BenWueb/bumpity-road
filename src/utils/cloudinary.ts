import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Delete a single image from Cloudinary
 */
export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting Cloudinary image:", publicId, error);
    return false;
  }
}

/**
 * Delete multiple images from Cloudinary
 */
export async function deleteCloudinaryImages(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return;

  try {
    // Cloudinary allows bulk delete up to 100 at a time
    const chunks = [];
    for (let i = 0; i < publicIds.length; i += 100) {
      chunks.push(publicIds.slice(i, i + 100));
    }

    await Promise.all(
      chunks.map((chunk) =>
        cloudinary.api.delete_resources(chunk)
      )
    );
  } catch (error) {
    console.error("Error deleting Cloudinary images:", error);
  }
}

export { cloudinary };

