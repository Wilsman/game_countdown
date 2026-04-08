interface Env {
  // Cloudflare Pages Functions environment variables if needed
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request } = context;
  const url = new URL(request.url);

  // Parse query parameters
  const game = url.searchParams.get("game") || "Game Countdown";
  const dateStr = url.searchParams.get("date");
  const timezone = url.searchParams.get("timezone") || "UTC";
  const title = url.searchParams.get("title") || game;
  const color = url.searchParams.get("color") || "7ed2eb";

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

  // Generate SVG image
  const svg = generateOGSVG(countdownText, subtitleText, color);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
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
