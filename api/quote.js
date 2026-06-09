// Vercel Serverless — Random Quotes
// GET /api/quote               → random quote
// GET /api/quote?author=Einstein
// GET /api/quote?tag=life
// GET /api/quote?count=5

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { author, tag, count = "1", search } = req.query;
  const num = Math.min(parseInt(count) || 1, 10);

  try {
    const params = new URLSearchParams({ limit: num });
    if (author) params.set("author", author);
    if (tag) params.set("tags", tag);
    if (search) params.set("query", search);

    const apiRes = await fetch(`https://api.quotable.io/quotes/random?${params}`);

    if (!apiRes.ok) throw new Error(`Quote API error: ${apiRes.status}`);
    const data = await apiRes.json();

    const format = (q) => ({
      id: q._id,
      content: q.content,
      author: q.author,
      tags: q.tags,
      length: q.length,
      full: `"${q.content}"\n\n— ${q.author}`,
    });

    const quotes = Array.isArray(data) ? data.map(format) : [format(data)];

    return res.status(200).json({
      count: quotes.length,
      quotes: num > 1 ? quotes : undefined,
      ...(num === 1 ? quotes[0] : {}),
    });
  } catch (err) {
    // Fallback quotes
    const fallback = [
      { content: "The only way to do great work is to love what you do.", author: "Steve Jobs", tags: ["motivation"] },
      { content: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", tags: ["wisdom"] },
      { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", tags: ["perseverance"] },
      { content: "Life is what happens when you're busy making other plans.", author: "John Lennon", tags: ["life"] },
      { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", tags: ["dreams"] },
    ];
    const pick = fallback[Math.floor(Math.random() * fallback.length)];
    return res.status(200).json({
      ...pick,
      full: `"${pick.content}"\n\n— ${pick.author}`,
      source: "fallback",
    });
  }
};
