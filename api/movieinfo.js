// Vercel Serverless — Movie & TV Show Info
// GET /api/movieinfo?title=Avengers
// GET /api/movieinfo?title=Breaking+Bad&type=series
// GET /api/movieinfo?title=Inception&year=2010
// Uses OMDB API — requires free API key at omdbapi.com (1000 req/day free)
// Set OMDB_API_KEY in Vercel env vars, or use ?apikey= query param

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { title, imdbid, type, year, plot = "short", apikey } = req.query;
  const OMDB_KEY = apikey || process.env.OMDB_API_KEY || "trilogy";  // trilogy = demo key

  if (!title && !imdbid) {
    return res.status(400).json({
      error: "Missing ?title= or ?imdbid= parameter",
      example: "/api/movieinfo?title=Inception",
      note: "Set OMDB_API_KEY environment variable for higher limits (omdbapi.com)",
    });
  }

  try {
    const params = new URLSearchParams({ apikey: OMDB_KEY, plot, r: "json" });
    if (imdbid) params.set("i", imdbid);
    else {
      params.set("t", title);
      if (type) params.set("type", type); // movie | series | episode
      if (year) params.set("y", year);
    }

    const apiRes = await fetch(`https://www.omdbapi.com/?${params}`);
    const data = await apiRes.json();

    if (data.Response === "False") {
      return res.status(404).json({ error: data.Error || "Not found", query: title || imdbid });
    }

    return res.status(200).json({
      title: data.Title,
      year: data.Year,
      rated: data.Rated,
      released: data.Released,
      runtime: data.Runtime,
      genre: data.Genre,
      director: data.Director,
      writer: data.Writer,
      actors: data.Actors,
      plot: data.Plot,
      language: data.Language,
      country: data.Country,
      awards: data.Awards,
      poster: data.Poster !== "N/A" ? data.Poster : null,
      ratings: data.Ratings,
      imdbRating: data.imdbRating,
      imdbVotes: data.imdbVotes,
      imdbID: data.imdbID,
      type: data.Type,
      dvd: data.DVD,
      boxOffice: data.BoxOffice,
      totalSeasons: data.totalSeasons,
      imdbUrl: `https://www.imdb.com/title/${data.imdbID}`,
    });
  } catch (err) {
    return res.status(500).json({ error: "Movie info fetch failed", message: err.message });
  }
};
