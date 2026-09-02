const STREAM_URL = "wss://streamer.finance.yahoo.com/?version=2";

function bytesFromBase64(b64) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function readVarint(view, offset) {
  let value = 0n;
  let shift = 0n;
  let index = offset;
  while (index < view.byteLength) {
    const byte = BigInt(view.getUint8(index));
    index += 1;
    value |= (byte & 0x7fn) << shift;
    if ((byte & 0x80n) === 0n) break;
    shift += 7n;
  }
  return [value, index];
}

function zigzag(value) {
  return Number((value >> 1n) ^ -(value & 1n));
}

function decodePricingData(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  const fields = {};
  while (offset < view.byteLength) {
    const [key, next] = readVarint(view, offset);
    offset = next;
    const field = Number(key >> 3n);
    const wire = Number(key & 7n);
    if (wire === 0) {
      const [value, after] = readVarint(view, offset);
      offset = after;
      fields[field] = zigzag(value);
    } else if (wire === 1) {
      fields[field] = view.getFloat64(offset, true);
      offset += 8;
    } else if (wire === 2) {
      const [length, after] = readVarint(view, offset);
      offset = after;
      const size = Number(length);
      fields[field] = new TextDecoder().decode(
        bytes.subarray(offset, offset + size)
      );
      offset += size;
    } else if (wire === 5) {
      fields[field] = view.getFloat32(offset, true);
      offset += 4;
    } else {
      break;
    }
  }

  const last = Number(fields[2]);
  const change = Number(fields[12]);
  const previousClose = Number.isFinite(last) && Number.isFinite(change)
    ? last - change
    : Number(fields[16]);
  return {
    ticker: fields[1] || null,
    last,
    time: Number(fields[3]) || Date.now(),
    changePercent: Number(fields[8]),
    change,
    previousClose,
    high: Number(fields[10]),
    low: Number(fields[11]),
    open: Number(fields[15]),
  };
}

function parseStreamMessage(raw) {
  try {
    const frame = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!frame || frame.type !== "pricing" || !frame.message) return null;
    const live = decodePricingData(bytesFromBase64(frame.message));
    if (!live.ticker || !Number.isFinite(live.last)) return null;
    return live;
  } catch {
    return null;
  }
}

function mergeLiveQuote(current, live) {
  const next = { ...(current || {}), ticker: live.ticker, last: live.last };
  if (Number.isFinite(live.previousClose)) next.previousClose = live.previousClose;
  if (Number.isFinite(live.open)) next.open = live.open;
  if (Number.isFinite(live.high)) next.high = live.high;
  if (Number.isFinite(live.low)) next.low = live.low;
  next.quoteTime = new Date(live.time).toISOString();
  return next;
}

function streamUi(status) {
  if (status === "live") {
    return { note: "live data", button: "connected", canRefresh: false };
  }
  if (status === "reconnecting") {
    return { note: null, button: "reconnecting", canRefresh: false };
  }
  return { note: null, button: "refresh now", canRefresh: true };
}

const LIVE_STORAGE_KEY = "stonks-live";

function resolveLiveEnabled(stored) {
  return stored !== "off";
}

function readLiveEnabled() {
  if (typeof window === "undefined") return true;
  try {
    return resolveLiveEnabled(window.localStorage.getItem(LIVE_STORAGE_KEY));
  } catch {
    return true;
  }
}

function writeLiveEnabled(enabled) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LIVE_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    /* private mode */
  }
}

module.exports = {
  STREAM_URL,
  parseStreamMessage,
  mergeLiveQuote,
  streamUi,
  LIVE_STORAGE_KEY,
  resolveLiveEnabled,
  readLiveEnabled,
  writeLiveEnabled,
};
