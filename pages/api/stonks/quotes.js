const { lots, fetchChart, quoteFromChart } = require("../../../lib/stonks/yahoo");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const settled = await Promise.allSettled(
    lots.positions.map(async (position) => {
      const chart = await fetchChart(position.ticker, {
        interval: "1d",
        range: "1d",
      });
      return quoteFromChart(chart);
    })
  );

  const quotes = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      quotes.push(result.value);
    }
  }

  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=60");
  return res.status(200).json({
    quotes,
    fetchedAt: new Date().toISOString(),
  });
}
