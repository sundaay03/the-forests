import { listBucketImagesResponse } from '@/lib/r2';

const FALLBACK_IMAGES = Array.from({ length: 13 }, (_, i) => `${i + 1}.webp`);

export async function GET() {
  return listBucketImagesResponse(
    process.env.R2_BURN_BUCKET_NAME || 'burn',
    FALLBACK_IMAGES
  );
}
