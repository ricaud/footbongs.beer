const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  overallPnL,
  todayPnL,
  portfolioDollars,
  rankPositions,
  nextExpandedId,
  historyInterval,
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

describe("portfolioDollars", () => {
  it("sums overall dollars", () => {
    assert.equal(
      portfolioDollars([
        { overall: { dollars: 10 } },
        { overall: { dollars: -3.5 } },
      ]),
      6.5
    );
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
