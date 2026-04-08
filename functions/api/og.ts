interface Env {
  // Cloudflare Pages Functions environment variables if needed
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request } = context;
  const url = new URL(request.url);

  // Parse query parameters
  let game = url.searchParams.get("game") || "Game Countdown";
  let dateStr = url.searchParams.get("date");
  let timezone = url.searchParams.get("timezone") || "UTC";
  let title = url.searchParams.get("title") || game;
  let color = url.searchParams.get("color") || "7ed2eb";

  // If parameters are not in query string, try to get them from referer header
  // This is needed for Discord crawler which doesn't execute JavaScript
  if (!dateStr) {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        game = refererUrl.searchParams.get("game") || game;
        dateStr = refererUrl.searchParams.get("date");
        timezone = refererUrl.searchParams.get("timezone") || timezone;
        title = refererUrl.searchParams.get("title") || title;
        color = refererUrl.searchParams.get("color") || color;
      } catch (e) {
        console.error("Failed to parse referer:", e);
      }
    }
  }

  // Calculate countdown
  let countdownText = "Loading...";
  let subtitleText = "";

  if (dateStr) {
    try {
      const targetDate = new Date(dateStr);
      const now = new Date();

      if (isNaN(targetDate.getTime())) {
        countdownText = "Invalid Date";
      } else {
        const totalSeconds = Math.floor(
          (targetDate.getTime() - now.getTime()) / 1000,
        );

        if (totalSeconds <= 0) {
          countdownText = "NOW AVAILABLE";
          subtitleText = title;
        } else {
          const days = Math.floor(totalSeconds / 86400);
          const hours = Math.floor((totalSeconds % 86400) / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          if (days > 0) {
            countdownText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
          } else if (hours > 0) {
            countdownText = `${hours}h ${minutes}m ${seconds}s`;
          } else if (minutes > 0) {
            countdownText = `${minutes}m ${seconds}s`;
          } else {
            countdownText = `${seconds}s`;
          }
          subtitleText = title;
        }
      }
    } catch (e) {
      countdownText = "Error";
    }
  } else {
    countdownText = "Game Countdown";
    subtitleText = "Share a timer to see the countdown";
  }

  // Try to generate PNG using placehold.co (free service with custom text)
  try {
    // placehold.co allows custom text on images
    const text1 = encodeURIComponent(countdownText);

    // Create image URL with custom text - use simpler URL format
    const imageUrl = `https://placehold.co/1200x630/131313/${color}?text=${text1}`;

    const imageResponse = await fetch(imageUrl);

    if (imageResponse.ok) {
      const imageBuffer = await imageResponse.arrayBuffer();

      // Verify it's actually PNG by checking the file signature
      const uint8Array = new Uint8Array(imageBuffer);
      const isPng =
        uint8Array[0] === 0x89 &&
        uint8Array[1] === 0x50 &&
        uint8Array[2] === 0x4e &&
        uint8Array[3] === 0x47;

      if (isPng && imageBuffer.byteLength > 1000) {
        return new Response(imageBuffer, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=60",
          },
        });
      }
    }
  } catch (e) {
    console.error("Placehold service failed:", e);
  }

  // Fallback: return SVG with correct Content-Type
  const svg = generateOGSVG(countdownText, subtitleText, color);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
    },
  });
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateOGSVG(
  countdown: string,
  subtitle: string,
  colorHex: string,
): string {
  const color = `#${colorHex}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#131313"/>
  
  <!-- Countdown text -->
  <text x="600" y="280" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="120" 
        font-weight="bold" 
        fill="${color}">
    ${escapeXML(countdown)}
  </text>
  
  <!-- Subtitle -->
  <text x="600" y="400" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="48" 
        font-weight="bold" 
        fill="#e5e2e1">
    ${escapeXML(subtitle)}
  </text>
  
  <!-- Footer text -->
  <text x="600" y="560" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="24" 
        fill="#a0a0a0">
    UTC countdowns · regional launch selection
  </text>
</svg>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
