import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url');
  if (!targetUrl) {
    return new Response('URL is required', { status: 400 });
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!upstream.ok) {
      return new Response(`Failed to fetch image: ${upstream.statusText}`, {
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get('content-type') || 'image/*';
    const body = upstream.body;
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=86400');

    return new Response(body, { status: 200, headers });
  } catch {
    return new Response('Error fetching image', { status: 500 });
  }
}

