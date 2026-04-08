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
      "Cache-Control": "public, max-age=60", // Cache for 1 minute to allow updates
    },
  });
}

function generateOGSVG(
  countdown: string,
  subtitle: string,
  colorHex: string,
): string {
  const color = `#${colorHex}`;

  // Generate grid lines
  const verticalLines = Array.from(
    { length: 29 },
    (_, i) => `<line x1="${i * 42}" y1="0" x2="${i * 42}" y2="630"/>`,
  ).join("");
  const horizontalLines = Array.from(
    { length: 15 },
    (_, i) => `<line x1="0" y1="${i * 42}" x2="1200" y2="${i * 42}"/>`,
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#131313"/>
      <stop offset="50%" style="stop-color:#1a1a1a"/>
      <stop offset="100%" style="stop-color:#0c0c0c"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg-gradient)"/>
  
  <!-- Grid pattern -->
  <g stroke="rgba(126, 210, 235, 0.05)" stroke-width="1">
    ${verticalLines}
    ${horizontalLines}
  </g>
  
  <!-- Countdown text with glow -->
  <text x="600" y="280" 
        text-anchor="middle" 
        font-family="monospace" 
        font-size="120" 
        font-weight="bold" 
        fill="${color}"
        filter="url(#glow)">
    ${escapeXML(countdown)}
  </text>
  
  <!-- Subtitle -->
  <text x="600" y="400" 
        text-anchor="middle" 
        font-family="monospace" 
        font-size="48" 
        font-weight="bold" 
        fill="#e5e2e1">
    ${escapeXML(subtitle)}
  </text>
  
  <!-- Footer text -->
  <text x="600" y="560" 
        text-anchor="middle" 
        font-family="monospace" 
        font-size="24" 
        fill="rgba(229, 226, 225, 0.5)">
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
