const lots = require("../../data/stonks.json");

const ALLOWED = new Set(lots.positions.map((p) => p.ticker));

function allowedTicker(ticker) {
  return ALLOWED.has(String(ticker || "").toUpperCase());
}

async function fetchChart(ticker, { interval, period1, period2, range }) {
  const params = new URLSearchParams({
    interval,
    includePrePost: "false",
  });
  if (range) {
    params.set("range", range);
  } else {
    params.set("period1", String(period1));
    params.set("period2", String(period2));
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ticker
  )}?${params.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`yahoo ${res.status}`);
    }
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) {
      throw new Error("yahoo empty");
    }
    return result;
  } finally {
    clearTimeout(timer);
  }
}

function quoteFromChart(result) {
  const meta = result.meta || {};
  const quote = result.indicators?.quote?.[0] || {};
  const lastIndex = Math.max((quote.open || []).length - 1, 0);
  const last = Number(meta.regularMarketPrice);
  const previousClose = Number(meta.chartPreviousClose);
  if (!Number.isFinite(last) || !Number.isFinite(previousClose)) {
    throw new Error("quote missing");
  }
  const open = Number.isFinite(Number(quote.open?.[lastIndex]))
    ? Number(quote.open[lastIndex])
    : last;
  const high = Number.isFinite(Number(meta.regularMarketDayHigh))
    ? Number(meta.regularMarketDayHigh)
    : Number(quote.high?.[lastIndex]);
  const low = Number.isFinite(Number(meta.regularMarketDayLow))
    ? Number(meta.regularMarketDayLow)
    : Number(quote.low?.[lastIndex]);
  const quoteTime = new Date(
    (Number(meta.regularMarketTime) || 0) * 1000
  ).toISOString();
  return {
    ticker: meta.symbol,
    last,
    previousClose,
    open,
    high: Number.isFinite(high) ? high : last,
    low: Number.isFinite(low) ? low : last,
    quoteTime,
  };
}

function pointsFromChart(result) {
  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const closes = quote.close || [];
  const lows = quote.low || [];
  const highs = quote.high || [];
  const points = [];
  for (let i = 0; i < timestamps.length; i += 1) {
    const close = Number(closes[i]);
    if (!Number.isFinite(close) || close <= 0) continue;
    const point = { t: timestamps[i] * 1000, close };
    const low = Number(lows[i]);
    const high = Number(highs[i]);
    if (Number.isFinite(low) && low > 0) point.low = low;
    if (Number.isFinite(high) && high > 0) point.high = high;
    points.push(point);
  }
  return points;
}

module.exports = {
  lots,
  allowedTicker,
  fetchChart,
  quoteFromChart,
  pointsFromChart,
};
