const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  overallPnL,
  todayPnL,
  portfolioDollars,
  portfolioValue,
  formatPortfolioDelta,
  formatElapsed,
  isQuoteStale,
  rankPositions,
  nextExpandedId,
  historyInterval,
  sessionOffsets,
  sliceHistoryFromFill,
} = require("./math");

describe("overallPnL", () => {
  it("uses last vs fill and $400 cost", () => {
    const r = overallPnL({ last: 26.36, fill: 24.36, shares: 16.420833 });
    assert.equal(Number(r.dollars.toFixed(2)), 32.85);
    assert.equal(Number(r.percent.toFixed(4)), 0.0821);
  });
});

describe("todayPnL", () => {
  it("uses last vs previous close times shares", () => {
    const r = todayPnL({ last: 26.36, previousClose: 25.0, shares: 16.420833 });
    assert.equal(Number(r.dollars.toFixed(2)), 22.33);
    assert.equal(Number(r.percent.toFixed(4)), 0.0544);
  });
});

describe("rankPositions", () => {
  it("sorts by overall percent desc and keeps file order on ties", () => {
    const rows = [
      { ticker: "AAA", fileIndex: 0, overall: { percent: 0.1, dollars: 10 } },
      { ticker: "BBB", fileIndex: 1, overall: { percent: 0.2, dollars: 20 } },
      { ticker: "CCC", fileIndex: 2, overall: { percent: 0.1, dollars: 10 } },
    ];
    const ranked = rankPositions(rows);
    assert.deepEqual(
      ranked.map((r) => r.ticker),
      ["BBB", "AAA", "CCC"]
    );
    assert.deepEqual(
      ranked.map((r) => r.rank),
      [1, 2, 3]
    );
  });
});

describe("portfolioValue", () => {
  it("is $400 times lots plus overall dollars", () => {
    assert.equal(
      portfolioValue([
        { overall: { dollars: 10 } },
        { overall: { dollars: -3.5 } },
      ]),
      806.5
    );
  });
});

describe("formatPortfolioDelta", () => {
  it("formats unsigned total with dollar or percent P/L", () => {
    assert.equal(formatPortfolioDelta(3204.23, 4.23), "3204.23 (+4.23)");
    assert.equal(formatPortfolioDelta(3204.23, 4.23, "$"), "3204.23 (+4.23)");
    assert.equal(formatPortfolioDelta(3204.23, 4.23, "%"), "3204.23 (+0.13%)");
    assert.equal(formatPortfolioDelta(3195.77, -4.23, "%"), "3195.77 (-0.13%)");
    assert.equal(formatPortfolioDelta(3200, 0, "%"), "3200.00 (0.00%)");
  });
});

describe("isQuoteStale", () => {
  it("is stale at 10 minutes", () => {
    assert.equal(isQuoteStale(9 * 60 * 1000), false);
    assert.equal(isQuoteStale(10 * 60 * 1000), true);
    assert.equal(isQuoteStale(11 * 60 * 1000), true);
    assert.equal(isQuoteStale(null), false);
  });
});

describe("formatElapsed", () => {
  it("names seconds, minutes, and hours in spoken form", () => {
    assert.equal(formatElapsed(0), "0 seconds ago");
    assert.equal(formatElapsed(1000), "1 second ago");
    assert.equal(formatElapsed(32000), "32 seconds ago");
    assert.equal(formatElapsed(273000), "4 minutes and 33 seconds ago");
    assert.equal(formatElapsed(60000), "1 minute ago");
    assert.equal(
      formatElapsed(3873000),
      "1 hour 4 minutes and 33 seconds ago"
    );
    assert.equal(formatElapsed(3600000), "1 hour ago");
    assert.equal(formatElapsed(7200000), "2 hours ago");
  });
});

describe("nextExpandedId", () => {
  it("opens, closes, and switches", () => {
    assert.equal(nextExpandedId(null, "A"), "A");
    assert.equal(nextExpandedId("A", "A"), null);
    assert.equal(nextExpandedId("A", "B"), "B");
  });
});

describe("historyInterval", () => {
  it("picks sparkline and detail intervals", () => {
    assert.equal(historyInterval(1, 0), "5m");
    assert.equal(historyInterval(6, 0), "1d");
    assert.equal(historyInterval(5, 1), "5m");
    assert.equal(historyInterval(6, 1), "1h");
    assert.equal(historyInterval(31, 1), "1d");
  });
});

describe("sessionOffsets", () => {
  it("collapses overnight gaps to one bar width", () => {
    const bar = 5 * 60 * 1000;
    const xs = sessionOffsets([
      { t: 0, close: 100 },
      { t: bar, close: 101 },
      { t: bar + 17 * 3600 * 1000, close: 108 },
      { t: bar + 17 * 3600 * 1000 + bar, close: 109 },
    ]);
    assert.deepEqual(xs, [0, bar, bar * 2, bar * 3]);
  });

  it("keeps regular session spacing", () => {
    const bar = 5 * 60 * 1000;
    const xs = sessionOffsets([
      { t: 0, close: 1 },
      { t: bar, close: 2 },
      { t: bar * 2, close: 3 },
    ]);
    assert.deepEqual(xs, [0, bar, bar * 2]);
  });
});

describe("sliceHistoryFromFill", () => {
  it("starts at the first bar that traded the fill", () => {
    const sliced = sliceHistoryFromFill(
      [
        { t: 1, close: 219.87, low: 219.5, high: 220.2 },
        { t: 2, close: 227.29, low: 226.9, high: 227.61 },
        { t: 3, close: 224.22, low: 224.0, high: 225.0 },
      ],
      227.28
    );
    assert.equal(sliced.length, 2);
    assert.equal(sliced[0].t, 2);
    assert.equal(sliced[0].close, 227.28);
    assert.equal(sliced[1].close, 224.22);
  });

  it("falls back to the closest close", () => {
    const sliced = sliceHistoryFromFill(
      [
        { t: 1, close: 24.75 },
        { t: 2, close: 24.36 },
        { t: 3, close: 24.53 },
      ],
      24.36
    );
    assert.equal(sliced[0].t, 2);
    assert.equal(sliced[0].close, 24.36);
    assert.equal(sliced.length, 2);
  });
});
