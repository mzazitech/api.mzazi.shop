// Vercel Serverless Function — YouTube Search
// Endpoint: GET /api/ytsearch?q=your+query&limit=10
// Deployed at: https://api.mzazi.shop/api/ytsearch

const yts = require("yt-search");

module.exports = async function handler(req, res) {
  // CORS — allow any origin to call this API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const q = req.query.q;
  const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);

  if (!q || !q.trim()) {
    return res.status(400).json({
      error: "Missing required parameter",
      message: "Add ?q=your+search+query to the URL",
      example: "/api/ytsearch?q=lofi+music&limit=10",
    });
  }

  try {
    const result = await yts(q.trim());

    const videos = result.videos.slice(0, limit).map((v) => ({
      title: v.title,
      url: v.url,
      videoId: v.videoId,
      thumbnail: v.thumbnail,
      author: v.author.name,
      authorUrl: v.author.url,
      duration: v.timestamp,
      views: v.views,
      ago: v.ago,
      description: v.description,
    }));

    return res.status(200).json({
      query: q.trim(),
      count: videos.length,
      results: videos,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Search failed",
      message: err.message,
    });
  }
};
