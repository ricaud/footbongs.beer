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

module.exports = {
  COST,
  PURCHASED_AT,
  overallPnL,
  todayPnL,
  portfolioDollars,
  rankPositions,
  nextExpandedId,
  calendarDaysBetween,
  historyInterval,
  formatMoney,
  formatPercent,
  formatPrice,
};
