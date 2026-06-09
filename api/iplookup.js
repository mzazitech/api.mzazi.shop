// Vercel Serverless — IP Address Lookup
// GET /api/iplookup            → caller's IP
// GET /api/iplookup?ip=8.8.8.8 → specific IP

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { ip } = req.query;
  const targetIp =
    ip ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "8.8.8.8";

  // Validate IP format
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (ip && !ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return res.status(400).json({ error: "Invalid IP address format" });
  }

  // Block private IPs when explicitly requested
  if (ip && (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.") || ip === "127.0.0.1")) {
    return res.status(400).json({ error: "Private IP addresses cannot be looked up" });
  }

  try {
    // ip-api.com — free, no key, 45 req/min
    const apiRes = await fetch(
      `http://ip-api.com/json/${targetIp}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting,query`
    );
    const data = await apiRes.json();

    if (data.status === "fail") {
      return res.status(404).json({ error: data.message, ip: targetIp });
    }

    return res.status(200).json({
      ip: data.query,
      city: data.city,
      region: data.regionName,
      regionCode: data.region,
      country: data.country,
      countryCode: data.countryCode,
      zip: data.zip,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as,
      asName: data.asname,
      isMobile: data.mobile,
      isProxy: data.proxy,
      isHosting: data.hosting,
      mapUrl: `https://maps.google.com/?q=${data.lat},${data.lon}`,
    });
  } catch (err) {
    return res.status(500).json({ error: "IP lookup failed", message: err.message });
  }
};
