// Vercel Serverless — Random Jokes
// GET /api/joke               → random joke
// GET /api/joke?type=programming
// GET /api/joke?type=dark
// GET /api/joke?count=5       → multiple jokes

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { type, count = "1", lang = "en" } = req.query;
  const num = Math.min(parseInt(count) || 1, 10);

  const CATEGORIES = ["Any", "Misc", "Programming", "Dark", "Pun", "Spooky", "Christmas"];
  const category = type
    ? CATEGORIES.find((c) => c.toLowerCase() === type.toLowerCase()) || "Any"
    : "Any";

  try {
    const params = new URLSearchParams({
      type: num > 1 ? "twopart" : "single",
      amount: num,
      lang,
    });

    const apiRes = await fetch(
      `https://v2.jokeapi.dev/joke/${category}?${params}&blacklistFlags=racist`
    );
    const data = await apiRes.json();

    if (data.error) throw new Error(data.message || "Joke API error");

    const formatJoke = (j) =>
      j.type === "twopart"
        ? { setup: j.setup, delivery: j.delivery, full: `${j.setup}\n\n— ${j.delivery}` }
        : { joke: j.joke, full: j.joke };

    const jokes =
      data.jokes
        ? data.jokes.map((j) => ({ id: j.id, category: j.category, ...formatJoke(j) }))
        : [{ id: data.id, category: data.category, ...formatJoke(data) }];

    return res.status(200).json({
      count: jokes.length,
      category,
      language: lang,
      jokes: num === 1 ? undefined : jokes,
      ...(num === 1 ? jokes[0] : {}),
    });
  } catch (err) {
    // Fallback jokes if API is down
    const fallback = [
      { full: "Why do programmers prefer dark mode? Because light attracts bugs! 🐛", category: "Programming" },
      { full: "Why don't scientists trust atoms? Because they make up everything! ⚛️", category: "Science" },
      { full: "I told my wife she was drawing her eyebrows too high. She looked surprised! 🤨", category: "Misc" },
    ];
    const pick = fallback[Math.floor(Math.random() * fallback.length)];
    return res.status(200).json({ ...pick, source: "fallback" });
  }
};
