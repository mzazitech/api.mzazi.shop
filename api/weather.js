// Vercel Serverless — Weather Info
// GET /api/weather?city=Nairobi
// GET /api/weather?city=New+York&format=simple

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { city, format = "full" } = req.query;
  if (!city) {
    return res.status(400).json({
      error: "Missing ?city= parameter",
      example: "/api/weather?city=Nairobi",
    });
  }

  try {
    // wttr.in provides free weather without API key
    const [jsonRes, condRes] = await Promise.all([
      fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`),
      fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%l:+%C+%t+%h+%w`),
    ]);

    if (!jsonRes.ok) throw new Error(`Weather fetch failed: ${jsonRes.status}`);
    const data = await jsonRes.json();
    const oneLineText = condRes.ok ? await condRes.text() : "";

    const current = data.current_condition?.[0];
    const area = data.nearest_area?.[0];
    const today = data.weather?.[0];
    const tomorrow = data.weather?.[1];

    if (!current) throw new Error("No weather data found for this city");

    const windDir = (deg) => {
      const dirs = ["N","NE","E","SE","S","SW","W","NW"];
      return dirs[Math.round(deg / 45) % 8];
    };

    const result = {
      location: {
        city: area?.areaName?.[0]?.value || city,
        country: area?.country?.[0]?.value,
        region: area?.region?.[0]?.value,
        latitude: area?.latitude,
        longitude: area?.longitude,
      },
      current: {
        temp_c: parseInt(current.temp_C),
        temp_f: parseInt(current.temp_F),
        feelsLike_c: parseInt(current.FeelsLikeC),
        feelsLike_f: parseInt(current.FeelsLikeF),
        condition: current.weatherDesc?.[0]?.value,
        humidity: `${current.humidity}%`,
        wind_kmph: `${current.windspeedKmph} km/h ${windDir(parseInt(current.winddirDegree))}`,
        visibility_km: `${current.visibility} km`,
        pressure_mb: `${current.pressure} mb`,
        uvIndex: current.uvIndex,
        cloudCover: `${current.cloudcover}%`,
        isDay: current.weatherCode < 800,
      },
      today: today ? {
        maxTemp_c: parseInt(today.maxtempC),
        minTemp_c: parseInt(today.mintempC),
        maxTemp_f: parseInt(today.maxtempF),
        minTemp_f: parseInt(today.mintempF),
        sunrise: today.astronomy?.[0]?.sunrise,
        sunset: today.astronomy?.[0]?.sunset,
        moonrise: today.astronomy?.[0]?.moonrise,
        moonset: today.astronomy?.[0]?.moonset,
        moonPhase: today.astronomy?.[0]?.moon_phase,
        avgHumidity: `${today.hourly.reduce((s, h) => s + parseInt(h.humidity), 0) / today.hourly.length | 0}%`,
        totalRain_mm: today.hourly.reduce((s, h) => s + parseFloat(h.precipMM), 0).toFixed(1),
      } : null,
      tomorrow: tomorrow ? {
        maxTemp_c: parseInt(tomorrow.maxtempC),
        minTemp_c: parseInt(tomorrow.mintempC),
        condition: tomorrow.hourly?.[4]?.weatherDesc?.[0]?.value,
        sunrise: tomorrow.astronomy?.[0]?.sunrise,
        sunset: tomorrow.astronomy?.[0]?.sunset,
      } : null,
      oneLine: oneLineText.trim(),
      lastUpdated: new Date().toISOString(),
    };

    if (format === "simple") {
      return res.status(200).json({
        city: result.location.city,
        country: result.location.country,
        temp: `${result.current.temp_c}°C / ${result.current.temp_f}°F`,
        feelsLike: `${result.current.feelsLike_c}°C`,
        condition: result.current.condition,
        humidity: result.current.humidity,
        wind: result.current.wind_kmph,
        summary: result.oneLine,
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Weather fetch failed", message: err.message });
  }
};
