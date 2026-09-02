const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { pointsFromChart } = require("./yahoo");

describe("pointsFromChart", () => {
  it("drops unfinished zero bars", () => {
    const points = pointsFromChart({
      timestamp: [1, 2],
      indicators: {
        quote: [{ close: [227.28, 0], low: [226, 0], high: [228, 0] }],
      },
    });
    assert.equal(points.length, 1);
    assert.equal(points[0].close, 227.28);
  });
});
