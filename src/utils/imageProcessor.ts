/**
 * Image processing utilities for client-side realistic enhancement,
 * anime filter conversion, and background removal simulation.
 */

export interface ProcessResult {
  dataUrl: string;
  durationMs: number;
  effect: 'hd' | 'anime' | 'remove_bg';
}

// Preset test images
export const SAMPLE_IMAGES = [
  {
    id: 'portrait',
    title: 'صورة شخصية (Portrait)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    description: 'مثالية لاختبار تحسين ملامح الوجه والدقة العالية',
  },
  {
    id: 'landscape',
    title: 'منظر طبيعي (Landscape)',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'رائعة لاختبار فلاتر الأنمي وألوان الطبيعة المشبعة',
  },
  {
    id: 'pet',
    title: 'حيوان أليف (Pet)',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    description: 'ممتازة لاختبار إزالة الخلفية ودقة الفراء والحدود',
  },
  {
    id: 'urban',
    title: 'مدينة ليلية (Cyberpunk)',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
    description: 'تأثير إضاءات النيون والفن الرقمي',
  },
];

// Helper to load image into HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('فشل تحميل الصورة: ' + err));
    img.src = src;
  });
}

/**
 * HD Image Enhancement (Sharpening, Clarity, Contrast & Color Boost)
 */
export async function enhanceImageHD(imageSrc: string): Promise<ProcessResult> {
  const startTime = performance.now();
  const img = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('لا يمكن إنشاء سياق Canvas');

  // Upscale slightly for crispness
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  // Draw base image
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Contrast enhancement & vibrance curve
  const contrastFactor = 1.22;
  const brightness = 6;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Contrast & Brightness
    r = (r - 128) * contrastFactor + 128 + brightness;
    g = (g - 128) * contrastFactor + 128 + brightness;
    b = (b - 128) * contrastFactor + 128 + brightness;

    // Vibrance (boost less saturated colors more)
    const max = Math.max(r, g, b);
    const avg = (r + g + b) / 3;
    const amt = ((Math.abs(max - avg) * 2) / 255) * -0.25;
    if (r !== max) r += (max - r) * amt;
    if (g !== max) g += (max - g) * amt;
    if (b !== max) b += (max - b) * amt;

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imageData, 0, 0);

  // Unsharp mask convolution filter pass for high-frequency micro details
  const sharpenedData = applySharpen(ctx, w, h, 0.45);
  ctx.putImageData(sharpenedData, 0, 0);

  const durationMs = Math.round(performance.now() - startTime);
  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    durationMs,
    effect: 'hd',
  };
}

/**
 * Anime & Digital Art Filter
 */
export async function applyAnimeFilter(
  imageSrc: string,
  style: 'shinkai' | 'ghibli' | 'cyberpunk' = 'shinkai'
): Promise<ProcessResult> {
  const startTime = performance.now();
  const img = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('لا يمكن إنشاء سياق Canvas');

  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Posterize color steps for cel-shaded anime aesthetic
  const levels = 8;
  const step = 255 / levels;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Quantize colors (Cel-shading)
    r = Math.floor(r / step) * step + step / 2;
    g = Math.floor(g / step) * step + step / 2;
    b = Math.floor(b / step) * step + step / 2;

    if (style === 'shinkai') {
      // Warm anime sunset / vibrant Makoto Shinkai sky tint
      r = r * 1.15 + 10;
      g = g * 1.05 + 5;
      b = b * 1.25 + 15;
    } else if (style === 'ghibli') {
      // Nostalgic warm watercolor tones & lush greens
      r = r * 1.08 + 15;
      g = g * 1.18 + 12;
      b = b * 0.95;
    } else if (style === 'cyberpunk') {
      // Neon magenta / cyan digital art
      r = r > 120 ? r * 1.3 : r * 0.7;
      b = b > 100 ? b * 1.35 : b * 0.9;
      g = g * 0.85;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imageData, 0, 0);

  // Soft glow overlay
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = style === 'cyberpunk' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 230, 180, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';

  const durationMs = Math.round(performance.now() - startTime);
  return {
    dataUrl: canvas.toDataURL('image/png'),
    durationMs,
    effect: 'anime',
  };
}

/**
 * Background Removal (Foreground Subject Segmentation)
 */
export async function removeBackground(imageSrc: string): Promise<ProcessResult> {
  const startTime = performance.now();
  const img = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('لا يمكن إنشاء سياق Canvas');

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Sample corner pixel colors to estimate dominant background color
  const samplePixels = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), 0],
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  samplePixels.forEach(([x, y]) => {
    const idx = (y * w + x) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  });
  bgR /= samplePixels.length;
  bgG /= samplePixels.length;
  bgB /= samplePixels.length;

  // Center mask radial distance bias (subjects are usually centered)
  const centerX = w / 2;
  const centerY = h / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Color distance from background
      const colorDist = Math.sqrt(
        Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
      );

      // Distance from center
      const distFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const centerFactor = 1 - (distFromCenter / maxDist);

      // If near edge and color is close to background, make transparent
      if (colorDist < 55 || (centerFactor < 0.35 && colorDist < 85)) {
        data[idx + 3] = 0; // Transparent
      } else if (colorDist < 80) {
        // Feather edge
        data[idx + 3] = Math.floor(((colorDist - 55) / 25) * 255);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const durationMs = Math.round(performance.now() - startTime);
  return {
    dataUrl: canvas.toDataURL('image/png'),
    durationMs,
    effect: 'remove_bg',
  };
}

// Sharpen helper
function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number): ImageData {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const sData = src.data;
  const dData = dst.data;

  // Copy alpha & base
  for (let i = 0; i < sData.length; i++) {
    dData[i] = sData[i];
  }

  // 3x3 Sharpen Kernel
  // [  0, -1,  0 ]
  // [ -1,  5, -1 ]
  // [  0, -1,  0 ]
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const val =
          sData[idx + c] * (1 + 4 * strength) -
          (sData[idx - 4 + c] +
            sData[idx + 4 + c] +
            sData[idx - w * 4 + c] +
            sData[idx + w * 4 + c]) *
            strength;
        dData[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }
  return dst;
}
