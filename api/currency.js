// Vercel Serverless — Currency Converter
// GET /api/currency?from=USD&to=KES&amount=100
// GET /api/currency?from=EUR&to=USD
// Uses frankfurter.app — free, no API key needed

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { from = "USD", to, amount = "1" } = req.query;

  if (!to) {
    // Return all rates for a currency
    try {
      const apiRes = await fetch(`https://api.frankfurter.app/latest?from=${from.toUpperCase()}`);
      if (!apiRes.ok) throw new Error("API error");
      const data = await apiRes.json();
      return res.status(200).json({
        base: data.base,
        date: data.date,
        rates: data.rates,
        note: "Add ?to=KES&amount=100 to convert a specific amount",
      });
    } catch (err) {
      return res.status(500).json({ error: "Currency fetch failed", message: err.message });
    }
  }

  const amt = parseFloat(amount) || 1;
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Invalid amount", example: "/api/currency?from=USD&to=KES&amount=100" });
  }

  try {
    const apiRes = await fetch(
      `https://api.frankfurter.app/latest?from=${from.toUpperCase()}&to=${to.toUpperCase()}`
    );

    if (!apiRes.ok) throw new Error(`Currency API error: ${apiRes.status}`);
    const data = await apiRes.json();

    if (!data.rates || !data.rates[to.toUpperCase()]) {
      return res.status(404).json({
        error: `Currency code not found: ${to}`,
        hint: "Use standard ISO 4217 codes like USD, EUR, GBP, KES, NGN, ZAR",
      });
    }

    const rate = data.rates[to.toUpperCase()];
    const converted = amt * rate;

    return res.status(200).json({
      from: data.base,
      to: to.toUpperCase(),
      amount: amt,
      rate: rate,
      result: parseFloat(converted.toFixed(6)),
      formatted: `${amt} ${data.base} = ${converted.toFixed(2)} ${to.toUpperCase()}`,
      date: data.date,
      note: "Rates updated daily from European Central Bank",
    });
  } catch (err) {
    return res.status(500).json({ error: "Currency conversion failed", message: err.message });
  }
};
