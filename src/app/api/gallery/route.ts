import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://8c18e085e8736f07344f3a0deebdb555.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '2c62ed5d3e942a773f1011c302483357',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'e881a303dab7c2f39cd1046c7ff00cce0adbf7faeb27b1efae34da1166ccf64b',
  },
  forcePathStyle: true,
});

export async function GET() {
  const fallback = [
    '1.webp', '2.webp', '3.webp', '4.webp', '5.webp',
    '6.webp', '7.webp', '8.webp', '9.webp', '10.webp',
  ];

  try {
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME || 'image-view',
      })
    );

    const keys = (data.Contents || [])
      .map((item) => item.Key)
      .filter((k): k is string => Boolean(k && /\.(webp|jpg|jpeg|png)$/i.test(k)))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

    return NextResponse.json({
      success: true,
      images: keys.length > 0 ? keys : fallback,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
      images: fallback,
    });
  }
}

