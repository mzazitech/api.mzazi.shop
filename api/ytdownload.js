// Vercel Serverless — YouTube Download Info
// GET /api/ytdownload?url=https://youtube.com/watch?v=xxx&type=audio|video|info
const ytdl = require("@distube/ytdl-core");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { url, type = "info" } = req.query;
  if (!url) {
    return res.status(400).json({
      error: "Missing ?url= parameter",
      example: "/api/ytdownload?url=https://youtube.com/watch?v=dQw4w9WgXcQ&type=audio",
    });
  }

  if (!ytdl.validateURL(url)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const info = await ytdl.getInfo(url);
    const details = info.videoDetails;

    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
    const videoFormats = ytdl.filterFormats(info.formats, "videoandaudio");

    const bestAudio = audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
    const bestVideo = videoFormats.sort((a, b) => {
      const qa = parseInt(a.qualityLabel || "0");
      const qb = parseInt(b.qualityLabel || "0");
      return qb - qa;
    })[0];

    const response = {
      title: details.title,
      author: details.author.name,
      channelUrl: details.author.channel_url,
      duration: parseInt(details.lengthSeconds),
      durationFormatted: new Date(parseInt(details.lengthSeconds) * 1000)
        .toISOString().substr(11, 8).replace(/^00:/, ""),
      thumbnail: details.thumbnails.at(-1)?.url,
      views: details.viewCount,
      likes: details.likes,
      description: details.shortDescription?.slice(0, 300),
      isLive: details.isLiveContent,
    };

    if (type === "audio" || type === "info") {
      response.audio = bestAudio ? {
        url: bestAudio.url,
        mimeType: bestAudio.mimeType,
        bitrate: bestAudio.audioBitrate,
        filesize: bestAudio.contentLength ? `${(parseInt(bestAudio.contentLength) / 1048576).toFixed(2)} MB` : "unknown",
        expires: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      } : null;
    }

    if (type === "video" || type === "info") {
      response.video = bestVideo ? {
        url: bestVideo.url,
        quality: bestVideo.qualityLabel,
        mimeType: bestVideo.mimeType,
        fps: bestVideo.fps,
        filesize: bestVideo.contentLength ? `${(parseInt(bestVideo.contentLength) / 1048576).toFixed(2)} MB` : "unknown",
        expires: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      } : null;
    }

    if (type === "formats") {
      response.formats = info.formats.map((f) => ({
        itag: f.itag,
        quality: f.qualityLabel || f.audioQuality,
        mimeType: f.mimeType?.split(";")[0],
        bitrate: f.audioBitrate,
        filesize: f.contentLength ? `${(parseInt(f.contentLength) / 1048576).toFixed(2)} MB` : null,
        hasAudio: f.hasAudio,
        hasVideo: f.hasVideo,
      }));
    }

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ error: "Download info failed", message: err.message });
  }
};
