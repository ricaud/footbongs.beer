import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import lots from "../../data/stonks.json";
import {
  formatMoney,
  formatPercent,
  formatPrice,
  nextExpandedId,
  overallPnL,
  portfolioDollars,
  rankPositions,
  todayPnL,
} from "../../lib/stonks/math";
import styles from "./stonks.module.css";

function tone(n) {
  if (n > 0) return styles.up;
  if (n < 0) return styles.down;
  return "";
}

function formatQuoteTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function linePath(points, width, height, pad) {
  if (!points.length) return "";
  const ys = points.map((p) => p.close);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min || 1;
  return points
    .map((point, i) => {
      const x =
        pad + (i / Math.max(points.length - 1, 1)) * (width - pad * 2);
      const y = pad + (1 - (point.close - min) / span) * (height - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function Sparkline({ points, up }) {
  const width = 72;
  const height = 28;
  const d = linePath(points, width, height, 1.5);
  return (
    <svg
      className={styles.spark}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke={up ? "#1f6b3a" : "#a32d2d"}
        strokeWidth="1.25"
      />
    </svg>
  );
}

function DetailChart({ points, fill }) {
  const width = 480;
  const height = 180;
  const pad = { l: 44, r: 8, t: 10, b: 24 };
  const ys = points.map((p) => p.close);
  const min = Math.min(...ys, fill);
  const max = Math.max(...ys, fill);
  const span = max - min || 1;
  const x0 = points[0]?.t ?? 0;
  const x1 = points[points.length - 1]?.t ?? 1;
  const xSpan = x1 - x0 || 1;

  const d = points
    .map((point, i) => {
      const x = pad.l + ((point.t - x0) / xSpan) * (width - pad.l - pad.r);
      const y =
        pad.t + (1 - (point.close - min) / span) * (height - pad.t - pad.b);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const fillY =
    pad.t + (1 - (fill - min) / span) * (height - pad.t - pad.b);
  const last = points[points.length - 1]?.close ?? fill;
  const stroke = last >= fill ? "#1f6b3a" : "#a32d2d";

  const startLabel = formatQuoteTime(new Date(x0).toISOString());
  const endLabel = formatQuoteTime(new Date(x1).toISOString());

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Price since purchase"
    >
      <line
        x1={pad.l}
        x2={width - pad.r}
        y1={fillY}
        y2={fillY}
        stroke="#d6d0c8"
        strokeDasharray="3 3"
      />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" />
      <text className={styles.axis} x={4} y={pad.t + 8}>
        {formatPrice(max)}
      </text>
      <text className={styles.axis} x={4} y={height - pad.b}>
        {formatPrice(min)}
      </text>
      <text className={styles.axis} x={pad.l} y={height - 6}>
        {startLabel}
      </text>
      <text
        className={styles.axis}
        x={width - pad.r}
        y={height - 6}
        textAnchor="end"
      >
        {endLabel}
      </text>
    </svg>
  );
}

function mergeRows(quotesByTicker, historyByTicker, now) {
  return lots.positions.map((position) => {
    const quote = quotesByTicker[position.ticker];
    const stale = !quote;
    const last = quote?.last ?? position.fill;
    const previousClose = quote?.previousClose ?? position.fill;
    const overall = overallPnL({
      last,
      fill: position.fill,
      shares: position.shares,
    });
    const today = todayPnL({
      last,
      previousClose,
      shares: position.shares,
    });
    let points = historyByTicker[position.ticker];
    if (!points?.length) {
      points = [
        { t: Date.parse(lots.purchasedAt), close: position.fill },
        { t: now, close: last },
      ];
    }
    return {
      ...position,
      stale,
      last,
      previousClose,
      open: quote?.open,
      high: quote?.high,
      low: quote?.low,
      quoteTime: quote?.quoteTime,
      overall,
      today,
      points,
      marketValue: last * position.shares,
    };
  });
}

export default function Stonks() {
  const [quotesByTicker, setQuotesByTicker] = useState({});
  const [fetchedAt, setFetchedAt] = useState(null);
  const [historyByTicker, setHistoryByTicker] = useState({});
  const [detailByTicker, setDetailByTicker] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const loadQuotes = useCallback(async () => {
    try {
      const res = await fetch("/api/stonks/quotes");
      if (!res.ok) return;
      const data = await res.json();
      const next = {};
      for (const quote of data.quotes || []) {
        next[quote.ticker] = quote;
      }
      setQuotesByTicker(next);
      setFetchedAt(data.fetchedAt);
      setNow(Date.now());
    } catch {
      /* keep last good quotes */
    }
  }, []);

  useEffect(() => {
    document.body.classList.add(styles.bodyLock);
    return () => document.body.classList.remove(styles.bodyLock);
  }, []);

  useEffect(() => {
    loadQuotes();
    let timer = null;
    const tick = () => {
      if (document.visibilityState === "visible") {
        loadQuotes();
      }
    };
    timer = setInterval(tick, 30000);
    const onVis = () => {
      if (document.visibilityState === "visible") loadQuotes();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [loadQuotes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        lots.positions.map(async (position) => {
          try {
            const res = await fetch(
              `/api/stonks/history?ticker=${position.ticker}&detail=0`
            );
            if (!res.ok) return [position.ticker, null];
            const data = await res.json();
            return [position.ticker, data.points || []];
          } catch {
            return [position.ticker, null];
          }
        })
      );
      if (cancelled) return;
      const next = {};
      for (const [ticker, points] of entries) {
        if (points?.length) next[ticker] = points;
      }
      setHistoryByTicker(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!expandedId || detailByTicker[expandedId]) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/stonks/history?ticker=${expandedId}&detail=1`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data.points?.length) return;
        setDetailByTicker((prev) => ({ ...prev, [expandedId]: data.points }));
      } catch {
        /* keep sparkline points */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expandedId, detailByTicker]);

  const ranked = useMemo(() => {
    return rankPositions(mergeRows(quotesByTicker, historyByTicker, now));
  }, [quotesByTicker, historyByTicker, now]);

  const portfolio = portfolioDollars(ranked);
  const quoteTimes = ranked
    .map((row) => row.quoteTime)
    .filter(Boolean)
    .sort();
  const asOf = quoteTimes[0] || fetchedAt;

  return (
    <div className={styles.root}>
      <Head>
        <title>Stonks</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.wrap}>
        <div className={styles.top}>
          <Link href="/" className={styles.home}>
            Home
          </Link>
        </div>
        <header className={styles.header}>
          <h1 className={styles.title}>Stonks</h1>
          <div className={styles.portfolio}>
            <div className={`${styles.portfolioValue} ${tone(portfolio)}`}>
              {formatMoney(portfolio)}
            </div>
          </div>
        </header>
        <p className={styles.asOf}>As of {formatQuoteTime(asOf)} ET</p>
        <div className={styles.list}>
          {ranked.map((row) => {
            const open = expandedId === row.ticker;
            const chartPoints =
              (open && detailByTicker[row.ticker]) || row.points;
            return (
              <article
                key={row.ticker}
                className={styles.card}
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={() =>
                  setExpandedId((current) =>
                    nextExpandedId(current, row.ticker)
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setExpandedId((current) =>
                      nextExpandedId(current, row.ticker)
                    );
                  }
                }}
              >
                <div className={styles.row}>
                  <div className={styles.rank}>{row.rank}</div>
                  <div className={styles.identity}>
                    <div className={styles.tickerLine}>
                      <span className={styles.ticker}>{row.ticker}</span>
                      <span className={styles.name}>{row.name}</span>
                      {row.stale ? (
                        <span className={styles.stale}>stale</span>
                      ) : null}
                    </div>
                    <div className={styles.prices}>
                      Start {formatPrice(row.fill)} · Last{" "}
                      {formatPrice(row.last)}
                    </div>
                    <div className={styles.today}>
                      Today{" "}
                      <span className={tone(row.today.dollars)}>
                        {formatMoney(row.today.dollars)}{" "}
                        {formatPercent(row.today.percent)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.right}>
                    <div
                      className={`${styles.overall} ${tone(
                        row.overall.percent
                      )}`}
                    >
                      <span>{formatMoney(row.overall.dollars)}</span>
                      <span>{formatPercent(row.overall.percent)}</span>
                    </div>
                    <Sparkline
                      points={row.points}
                      up={row.overall.percent >= 0}
                    />
                  </div>
                  {open ? (
                    <div className={styles.detail}>
                      <dl className={styles.stats}>
                        <div className={styles.stat}>
                          <dt>Shares</dt>
                          <dd>{row.shares}</dd>
                        </div>
                        <div className={styles.stat}>
                          <dt>Cost</dt>
                          <dd>$400.00</dd>
                        </div>
                        <div className={styles.stat}>
                          <dt>Value</dt>
                          <dd>{formatPrice(row.marketValue)}</dd>
                        </div>
                        <div className={`${styles.stat} ${styles.statWide}`}>
                          <dt>Open / High / Low</dt>
                          <dd>
                            {formatPrice(row.open)} / {formatPrice(row.high)} /{" "}
                            {formatPrice(row.low)}
                          </dd>
                        </div>
                      </dl>
                      <div className={styles.chartWrap}>
                        <DetailChart points={chartPoints} fill={row.fill} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
