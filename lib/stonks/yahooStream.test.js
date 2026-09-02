const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  parseStreamMessage,
  streamUi,
  resolveLiveEnabled,
} = require("./yahooStream");

describe("parseStreamMessage", () => {
  it("decodes a Yahoo pricing envelope", () => {
    const live = parseStreamMessage(
      '{"type":"pricing","message":"CgRES05HFa5HxEEYkJu3uYxoKgNOTVMwCDgBRet8lUBIpqS0BmXwKIw/2AEE"}'
    );
    assert.equal(live.ticker, "DKNG");
    assert.equal(Number(live.last.toFixed(2)), 24.53);
    assert.ok(Number.isFinite(live.previousClose));
    assert.ok(live.time > 0);
  });

  it("ignores non-pricing frames", () => {
    assert.equal(parseStreamMessage('{"type":"ping"}'), null);
  });
});

describe("resolveLiveEnabled", () => {
  it("defaults on unless stored off", () => {
    assert.equal(resolveLiveEnabled(null), true);
    assert.equal(resolveLiveEnabled("on"), true);
    assert.equal(resolveLiveEnabled("off"), false);
  });
});

describe("streamUi", () => {
  it("labels live, reconnecting, and idle controls", () => {
    assert.deepEqual(streamUi("live"), {
      note: "live data",
      button: "connected",
      canRefresh: false,
    });
    assert.deepEqual(streamUi("reconnecting"), {
      note: null,
      button: "reconnecting",
      canRefresh: false,
    });
    assert.deepEqual(streamUi("idle"), {
      note: null,
      button: "refresh now",
      canRefresh: true,
    });
  });
});
