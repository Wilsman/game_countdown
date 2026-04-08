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

  // Return JSON with countdown data
  // This can be used by the frontend or other services
  return new Response(
    JSON.stringify({
      countdown: countdownText,
      title: subtitleText,
      color: color,
      game: game,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
