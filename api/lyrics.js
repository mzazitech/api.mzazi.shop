// Vercel Serverless — Song Lyrics
// GET /api/lyrics?artist=Ed+Sheeran&title=Shape+of+You
// GET /api/lyrics?q=Shape+of+You+Ed+Sheeran   (combined search)

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  let { artist, title, q } = req.query;

  // Support combined query: ?q=Song Title Artist
  if (q && !artist && !title) {
    const parts = q.trim().split(" ");
    title = parts.slice(0, Math.ceil(parts.length / 2)).join(" ");
    artist = parts.slice(Math.ceil(parts.length / 2)).join(" ") || title;
  }

  if (!artist || !title) {
    return res.status(400).json({
      error: "Missing parameters",
      usage: "/api/lyrics?artist=Ed+Sheeran&title=Shape+of+You",
      alt: "/api/lyrics?q=Shape+of+You+Ed+Sheeran",
    });
  }

  try {
    // Try lyrics.ovh first (free, no key)
    const lyricsRes = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );

    if (lyricsRes.ok) {
      const data = await lyricsRes.json();
      if (data.lyrics) {
        return res.status(200).json({
          artist: artist.trim(),
          title: title.trim(),
          lyrics: data.lyrics.trim(),
          lines: data.lyrics.trim().split("\n").length,
          source: "lyrics.ovh",
        });
      }
    }

    // Fallback: try musixmatch unofficial
    const searchRes = await fetch(
      `https://api.lyrics.ovh/suggest/${encodeURIComponent(artist + " " + title)}`
    );
    if (searchRes.ok) {
      const suggestions = await searchRes.json();
      if (suggestions.data && suggestions.data.length > 0) {
        const track = suggestions.data[0];
        const tryRes = await fetch(
          `https://api.lyrics.ovh/v1/${encodeURIComponent(track.artist.name)}/${encodeURIComponent(track.title)}`
        );
        if (tryRes.ok) {
          const tryData = await tryRes.json();
          if (tryData.lyrics) {
            return res.status(200).json({
              artist: track.artist.name,
              title: track.title,
              lyrics: tryData.lyrics.trim(),
              lines: tryData.lyrics.trim().split("\n").length,
              source: "lyrics.ovh",
            });
          }
        }
      }
    }

    return res.status(404).json({
      error: "Lyrics not found",
      query: { artist, title },
      suggestion: "Try different spelling or check artist/title names",
    });
  } catch (err) {
    return res.status(500).json({ error: "Lyrics search failed", message: err.message });
  }
};
