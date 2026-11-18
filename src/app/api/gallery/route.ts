import { listBucketImagesResponse } from '@/lib/r2';

const FALLBACK_IMAGES = [
  '1.webp',
  '2.webp',
  '3.webp',
  '4.webp',
  '5.webp',
  '6.webp',
  '7.webp',
  '8.webp',
  '9.webp',
  '10.webp',
];

export async function GET() {
  return listBucketImagesResponse(
    process.env.R2_BUCKET_NAME || 'image-view',
    FALLBACK_IMAGES
  );
}
