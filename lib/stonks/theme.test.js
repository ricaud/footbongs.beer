const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { THEMES, resolveTheme } = require("./theme");

describe("resolveTheme", () => {
  it("uses a saved light, dark, or golf preference", () => {
    assert.equal(resolveTheme("light", true), "light");
    assert.equal(resolveTheme("dark", false), "dark");
    assert.equal(resolveTheme("golf", false), "golf");
  });

  it("follows the system when nothing is saved", () => {
    assert.equal(resolveTheme(null, true), "dark");
    assert.equal(resolveTheme(null, false), "light");
    assert.equal(resolveTheme("neon", true), "dark");
    assert.equal(resolveTheme("", false), "light");
  });

  it("lists the three schemes", () => {
    assert.deepEqual(THEMES, ["light", "dark", "golf"]);
  });
});
