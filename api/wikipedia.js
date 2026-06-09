// Vercel Serverless — Wikipedia Search & Summary
// GET /api/wikipedia?q=Albert+Einstein
// GET /api/wikipedia?q=JavaScript&lang=fr  (language support)

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q, lang = "en", sentences = "5" } = req.query;
  if (!q) {
    return res.status(400).json({
      error: "Missing ?q= parameter",
      example: "/api/wikipedia?q=Albert+Einstein",
      languages: "Add &lang=fr for French, &lang=es for Spanish, etc.",
    });
  }

  const numSentences = Math.min(parseInt(sentences, 10) || 5, 20);

  try {
    // Search first
    const searchRes = await fetch(
      `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=5&format=json`
    );
    const searchData = await searchRes.json();
    const titles = searchData[1] || [];

    if (!titles.length) {
      return res.status(404).json({ error: "No results found", query: q });
    }

    const topTitle = titles[0];

    // Get summary
    const summaryRes = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle)}`
    );

    if (!summaryRes.ok) throw new Error("Summary fetch failed");
    const summary = await summaryRes.json();

    // Get full extract
    const extractRes = await fetch(
      `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topTitle)}&prop=extracts&exsentences=${numSentences}&exintro=true&explaintext=true&format=json`
    );
    const extractData = await extractRes.json();
    const pages = Object.values(extractData.query.pages);
    const fullExtract = pages[0]?.extract || summary.extract;

    return res.status(200).json({
      title: summary.title,
      description: summary.description,
      summary: summary.extract,
      fullExtract: fullExtract?.trim(),
      thumbnail: summary.thumbnail?.source || null,
      url: summary.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(topTitle)}`,
      mobileUrl: summary.content_urls?.mobile?.page || null,
      language: lang,
      related: titles.slice(1),
    });
  } catch (err) {
    return res.status(500).json({ error: "Wikipedia search failed", message: err.message });
  }
};
