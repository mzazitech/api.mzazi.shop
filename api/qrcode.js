// Vercel Serverless — QR Code Generator
// GET /api/qrcode?text=Hello+World           → returns base64 PNG
// GET /api/qrcode?text=Hello&format=svg      → returns SVG string
// GET /api/qrcode?text=Hello&format=image    → serves PNG directly

const QRCode = require("qrcode");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const {
    text,
    format = "base64",
    size = "300",
    color = "000000",
    bg = "ffffff",
    level = "M",
  } = req.query;

  if (!text) {
    return res.status(400).json({
      error: "Missing ?text= parameter",
      example: "/api/qrcode?text=https://api.mzazi.shop",
      formats: ["base64", "svg", "image"],
    });
  }

  const opts = {
    errorCorrectionLevel: ["L", "M", "Q", "H"].includes(level.toUpperCase()) ? level.toUpperCase() : "M",
    color: {
      dark: `#${color.replace("#", "")}`,
      light: `#${bg.replace("#", "")}`,
    },
    width: Math.min(Math.max(parseInt(size) || 300, 100), 1000),
    margin: 2,
  };

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(text, { ...opts, type: "svg" });
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(svg);
    }

    if (format === "image") {
      const buffer = await QRCode.toBuffer(text, { ...opts, type: "png" });
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Content-Disposition", `inline; filename="qrcode.png"`);
      return res.status(200).send(buffer);
    }

    // Default: base64
    const dataUrl = await QRCode.toDataURL(text, { ...opts, type: "image/png" });
    return res.status(200).json({
      text,
      format: "base64",
      dataUrl,
      base64: dataUrl.split(",")[1],
      mimeType: "image/png",
      size: parseInt(size) || 300,
    });
  } catch (err) {
    return res.status(500).json({ error: "QR code generation failed", message: err.message });
  }
};
