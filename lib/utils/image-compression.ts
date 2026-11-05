/**
 * Compresses and converts an image File to a lightweight, high-quality WebP format in the browser.
 * Reduces raw 5-10MB camera shots down to ~100-300KB for lightning fast uploads.
 */
export async function convertToWebP(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<File> {
  const maxWidth = options?.maxWidth ?? 1600;
  const maxHeight = options?.maxHeight ?? 1600;
  const quality = options?.quality ?? 0.82;

  // If already a small WebP, no need to re-encode
  if (file.type === "image/webp" && file.size < 500 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      let { width, height } = img;

      // Scale dimensions proportionally
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(file);
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const convertedFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });

          resolve(convertedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = (err) => reject(err);

    reader.readAsDataURL(file);
  });
}
