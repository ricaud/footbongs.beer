const COST = 400;
const PURCHASED_AT = "2026-09-02T13:30:00.000Z";

function overallPnL({ last, fill, shares }) {
  return {
    dollars: last * shares - COST,
    percent: (last - fill) / fill,
  };
}

function todayPnL({ last, previousClose, shares }) {
  return {
    dollars: (last - previousClose) * shares,
    percent: (last - previousClose) / previousClose,
  };
}

function portfolioDollars(rows) {
  return rows.reduce((sum, row) => sum + row.overall.dollars, 0);
}

function portfolioValue(rows) {
  return rows.length * COST + portfolioDollars(rows);
}

function rankPositions(rows) {
  return [...rows]
    .sort((a, b) => {
      if (b.overall.percent !== a.overall.percent) {
        return b.overall.percent - a.overall.percent;
      }
      return a.fileIndex - b.fileIndex;
    })
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

function nextExpandedId(current, clicked) {
  return current === clicked ? null : clicked;
}

function calendarDaysBetween(fromMs, toMs) {
  const from = new Date(fromMs);
  const to = new Date(toMs);
  const utcFrom = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const utcTo = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.max(0, Math.round((utcTo - utcFrom) / 86400000));
}

function historyInterval(calendarDays, detail) {
  if (detail === 0) {
    return calendarDays <= 5 ? "5m" : "1d";
  }
  if (calendarDays <= 5) return "5m";
  if (calendarDays <= 30) return "1h";
  return "1d";
}

function sliceHistoryFromFill(points, fill) {
  if (!points?.length || !Number.isFinite(fill)) return points || [];
  let start = -1;
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    const low = Number.isFinite(point.low) ? point.low : point.close;
    const high = Number.isFinite(point.high) ? point.high : point.close;
    if (fill >= low && fill <= high) {
      start = i;
      break;
    }
  }
  if (start < 0) {
    let bestAbs = Infinity;
    start = 0;
    for (let i = 0; i < points.length; i += 1) {
      const abs = Math.abs(points[i].close - fill);
      if (abs < bestAbs) {
        bestAbs = abs;
        start = i;
      }
    }
  }
  return points.slice(start).map((point, i) =>
    i === 0 ? { ...point, close: fill } : point
  );
}

function signed(n) {
  const abs = Math.abs(n).toFixed(2);
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${abs}`;
  return abs;
}

function formatMoney(n) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n).toFixed(2);
  if (n > 0) return `+$${abs}`;
  if (n < 0) return `-$${abs}`;
  return `$${abs}`;
}

function formatPercent(n) {
  if (!Number.isFinite(n)) return "—";
  return `${signed(n * 100)}%`;
}

function formatPrice(n) {
  if (!Number.isFinite(n)) return "—";
  return `$${n.toFixed(2)}`;
}

function formatSignedPlain(n) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n).toFixed(2);
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${abs}`;
  return abs;
}

function formatPortfolioDelta(value, pnl) {
  if (!Number.isFinite(value) || !Number.isFinite(pnl)) return "—";
  return `${value.toFixed(2)} (${formatSignedPlain(pnl)})`;
}

function unitLabel(n, singular) {
  return n === 1 ? `1 ${singular}` : `${n} ${singular}s`;
}

function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(Number(ms) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const parts = [];
  if (hours) parts.push(unitLabel(hours, "hour"));
  if (minutes) parts.push(unitLabel(minutes, "minute"));
  if (seconds || parts.length === 0) parts.push(unitLabel(seconds, "second"));
  if (parts.length === 1) return `${parts[0]} ago`;
  const last = parts.pop();
  return `${parts.join(" ")} and ${last} ago`;
}

const STALE_AFTER_MS = 10 * 60 * 1000;

function isQuoteStale(elapsedMs) {
  return Number.isFinite(elapsedMs) && elapsedMs >= STALE_AFTER_MS;
}

module.exports = {
  COST,
  PURCHASED_AT,
  overallPnL,
  todayPnL,
  portfolioDollars,
  portfolioValue,
  rankPositions,
  nextExpandedId,
  calendarDaysBetween,
  historyInterval,
  sliceHistoryFromFill,
  formatMoney,
  formatPercent,
  formatPrice,
  formatSignedPlain,
  formatPortfolioDelta,
  formatElapsed,
  STALE_AFTER_MS,
  isQuoteStale,
};
