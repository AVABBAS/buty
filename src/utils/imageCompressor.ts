/**
 * High-performance client-side image downscaler & compressor.
 * Crucial for scaling to 50,000+ users:
 * Prevents localStorage QuotaExceededError and drastically speeds up upload times.
 */

export async function compressImage(
  dataUrl: string,
  maxWidth = 720,
  maxHeight = 720,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    // If it's not a data URL or server image, return as is
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    // Safety timeout in case image decoding or canvas hangs
    const timer = setTimeout(() => resolve(dataUrl), 4000);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      try {
        let width = img.width;
        let height = img.height;

        // Calculate scale
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compact JPEG
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
