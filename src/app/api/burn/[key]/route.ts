import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://8c18e085e8736f07344f3a0deebdb555.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '2c62ed5d3e942a773f1011c302483357',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'e881a303dab7c2f39cd1046c7ff00cce0adbf7faeb27b1efae34da1166ccf64b',
  },
  forcePathStyle: true,
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params;
    if (!key) {
      return new NextResponse('Missing key', { status: 400 });
    }

    const data = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BURN_BUCKET_NAME || 'burn',
        Key: key,
      })
    );

    if (!data.Body) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const bytes = await data.Body.transformToByteArray();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': data.ContentType || 'image/webp',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new NextResponse('Error loading image: ' + message, { status: 500 });
  }
}

