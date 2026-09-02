const {
  calendarDaysBetween,
  historyInterval,
} = require("../../../lib/stonks/math");
const {
  lots,
  allowedTicker,
  fetchChart,
  pointsFromChart,
} = require("../../../lib/stonks/yahoo");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const ticker = String(req.query.ticker || "").toUpperCase();
  const detail = Number(req.query.detail);
  if (!allowedTicker(ticker) || (detail !== 0 && detail !== 1)) {
    return res.status(400).json({ error: "bad_request" });
  }

  try {
    const period1 = Math.floor(Date.parse(lots.purchasedAt) / 1000);
    const period2 = Math.floor(Date.now() / 1000);
    const days = calendarDaysBetween(period1 * 1000, Date.now());
    const interval = historyInterval(days, detail);
    const chart = await fetchChart(ticker, { interval, period1, period2 });
    return res.status(200).json({
      ticker,
      interval,
      points: pointsFromChart(chart),
    });
  } catch (error) {
    return res.status(502).json({ error: "history_unavailable" });
  }
}
