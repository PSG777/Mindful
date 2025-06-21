import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Environment Variables Test',
    hasHumeSecretKey: !!process.env.HUME_SECRET_KEY,
    hasHumeApiKey: !!process.env.HUME_API_KEY,
    hasPublicHumeKey: !!process.env.NEXT_PUBLIC_HUME_API_KEY,
    secretKeyLength: process.env.HUME_SECRET_KEY?.length || 0,
    apiKeyLength: process.env.HUME_API_KEY?.length || 0,
    publicKeyLength: process.env.NEXT_PUBLIC_HUME_API_KEY?.length || 0,
    // Show first few characters of keys (for debugging, remove in production)
    secretKeyPreview: process.env.HUME_SECRET_KEY?.substring(0, 10) + '...',
    apiKeyPreview: process.env.HUME_API_KEY?.substring(0, 10) + '...',
    publicKeyPreview: process.env.NEXT_PUBLIC_HUME_API_KEY?.substring(0, 10) + '...',
  });
} 