// Vercel Serverless — TikTok Video Downloader
// GET /api/tiktok?url=https://vm.tiktok.com/xxx

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({
      error: "Missing ?url= parameter",
      example: "/api/tiktok?url=https://vm.tiktok.com/xxx",
    });
  }

  if (!url.includes("tiktok.com")) {
    return res.status(400).json({ error: "Invalid TikTok URL" });
  }

  try {
    // First, resolve short URL to full URL
    let resolvedUrl = url;
    try {
      const headRes = await fetch(url, { method: "HEAD", redirect: "follow" });
      resolvedUrl = headRes.url || url;
    } catch {}

    // Extract video ID from URL
    const videoIdMatch = resolvedUrl.match(/\/video\/(\d+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    // Use tikmate API (free, no key)
    const apiRes = await fetch("https://api.tikmate.app/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url: resolvedUrl }).toString(),
    });

    if (!apiRes.ok) throw new Error(`TikMate API error: ${apiRes.status}`);
    const data = await apiRes.json();

    if (!data.id) throw new Error("Could not parse TikTok video");

    return res.status(200).json({
      id: data.id,
      title: data.title || "TikTok Video",
      author: data.author || "Unknown",
      thumbnail: data.thumbnail || null,
      duration: data.duration || null,
      noWatermark: `https://tikmate.app/download/${data.token}/${data.id}.mp4?hd=1`,
      watermark: `https://tikmate.app/download/${data.token}/${data.id}.mp4`,
      audio: `https://tikmate.app/download/${data.token}/${data.id}.mp3`,
    });
  } catch (err) {
    // Fallback: return ssstik redirect
    return res.status(500).json({
      error: "Could not fetch TikTok video",
      message: err.message,
      fallback: `https://ssstik.io/en?url=${encodeURIComponent(url)}`,
    });
  }
};
