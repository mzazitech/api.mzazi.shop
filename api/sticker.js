// Vercel Serverless — Text Sticker Generator (WhatsApp-ready)
// GET /api/sticker?text=Hello+World
// GET /api/sticker?text=LOL&bg=ff0000&color=ffffff&font=bold
// Returns a PNG image suitable for WhatsApp stickers

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const {
    text,
    bg = "1a1a2e",
    color = "00d4ff",
    size = "512",
    font = "bold",
    emoji,
  } = req.query;

  if (!text && !emoji) {
    return res.status(400).json({
      error: "Missing ?text= parameter",
      example: "/api/sticker?text=Hello+World&bg=1a1a2e&color=00d4ff",
      params: {
        text: "Text to display",
        bg: "Background color (hex without #)",
        color: "Text color (hex without #)",
        size: "Image size in px (max 512)",
        font: "Font weight: normal, bold",
      },
    });
  }

  const canvasSize = Math.min(parseInt(size) || 512, 512);
  const displayText = text || emoji || "";
  const lines = displayText.split("\\n").flatMap((l) => {
    // Auto-wrap long lines
    const words = l.split(" ");
    const result = [];
    let current = "";
    for (const word of words) {
      if ((current + " " + word).trim().length > 14) {
        if (current) result.push(current.trim());
        current = word;
      } else {
        current = (current + " " + word).trim();
      }
    }
    if (current) result.push(current.trim());
    return result;
  });

  const fontSize = lines.length <= 2 ? Math.floor(canvasSize / 5) : Math.floor(canvasSize / (lines.length * 1.8));
  const lineHeight = fontSize * 1.3;
  const totalH = lines.length * lineHeight;
  const startY = (canvasSize - totalH) / 2 + fontSize * 0.8;

  const textElements = lines.map((line, i) =>
    `<text x="50%" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="${font}" fill="#${color.replace("#", "")}">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>`
  ).join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" style="stop-color:#${bg.replace("#", "")};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#${bg.replace("#", "")}99;stop-opacity:1"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" rx="${Math.floor(canvasSize * 0.08)}"/>
  ${textElements}
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Content-Disposition", `inline; filename="sticker.svg"`);
  return res.status(200).send(svg);
};
