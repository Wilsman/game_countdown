interface Env {
  ASSETS: {
    fetch(input: RequestInfo | URL): Promise<Response>;
  };
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Read the static root document without re-invoking this Function.
  const assetResponse = await env.ASSETS.fetch(new URL("/", request.url));
  const indexHtml = await assetResponse.text();

  // Parse query parameters
  const game = url.searchParams.get('game');
  const date = url.searchParams.get('date');
  const timezone = url.searchParams.get('timezone');
  const title = url.searchParams.get('title');
  const color = url.searchParams.get('color');

  // If there are query parameters, modify the OG image URL
  if (game && date) {
    const ogImageUrl = `/api/og?game=${encodeURIComponent(game)}&date=${encodeURIComponent(date)}&timezone=${encodeURIComponent(timezone || 'UTC')}&title=${encodeURIComponent(title || game)}&color=${encodeURIComponent(color || '7ed2eb')}`;
    
    // Replace the og:image content
    const modifiedHtml = indexHtml
      .replace(/<meta property="og:image" content="[^"]*"\/>/, `<meta property="og:image" content="${ogImageUrl}" />`)
      .replace(/<meta name="twitter:image" content="[^"]*"\/>/, `<meta name="twitter:image" content="${ogImageUrl}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\/>/, `<meta property="og:title" content="${title || game}" />`)
      .replace(/<meta name="twitter:title" content="[^"]*"\/>/, `<meta name="twitter:title" content="${title || game}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\/>/, `<meta property="og:description" content="Countdown to ${title || game}" />`)
      .replace(/<meta name="twitter:description" content="[^"]*"\/>/, `<meta name="twitter:description" content="Countdown to ${title || game}" />`)
      .replace(/<title>.*<\/title>/, `<title>${title || game} - Game Countdown</title>`);

    return new Response(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
    });
  }

  // Return the original index.html if no parameters
  return new Response(indexHtml, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
    },
  });
}
