import { NextResponse } from 'next/server';

export const revalidate = 3600; // Revalidate feed hourly

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    const feedEndpoint = `${backendUrl}/feeds/google-merchant`;

    const res = await fetch(feedEndpoint, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!res.ok) {
      throw new Error(`Backend feed returned HTTP status ${res.status}`);
    }

    const xmlText = await res.text();

    return new NextResponse(xmlText, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>Unable to fetch Google Merchant feed</description></channel></rss>`,
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      }
    );
  }
}
