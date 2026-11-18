import { NextRequest } from 'next/server';
import { getBucketImageResponse } from '@/lib/r2';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const { key } = await context.params;
  return getBucketImageResponse(
    process.env.R2_BUCKET_NAME || 'image-view',
    key
  );
}
