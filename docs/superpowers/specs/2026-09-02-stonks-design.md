# Stonks leaderboard

Date: 2026-09-02  
Route: `/stonks`  
Branch: `2026-stonks`

Track eight equal $400 buys from 2026-09-02 as a ranked desk board. Rank by overall % vs fill. Visual language is institutional (graphite, hairline rules, tabular numbers), not Robinhood and not the Comic Sans home page.

## Positions

Hardcoded in `data/stonks.json`. Bought 2026-09-02. Cost is $400.00 each. History starts at 09:30 America/New_York that day (fill time unknown).

| Ticker | Name | Shares | Fill |
|--------|------|--------|------|
| DKNG | DraftKings | 16.420833 | 24.36 |
| LLY | Eli Lilly | 0.34375 | 1163.64 |
| TXRH | Texas Roadhouse | 2.076735 | 192.61 |
| MRVL | Marvell Technology | 1.93977 | 206.21 |
| NVDA | NVIDIA | 1.759943 | 227.28 |
| LULU | lululemon | 3.311943 | 120.78 |
| SPXL | Direxion Daily S&P 500 Bull 3X | 1.403164 | 285.07 |
| SPCX | AXS SPAC and New Issue ETF | 2.838792 | 140.91 |

No in-app editor. Changing a position means editing the file.

## Page

- Add a Home nav link to `/stonks` next to Golf.
- Isolate styles with a CSS module on the page so global Comic Sans / GIF background do not apply.
- Header: title `Stonks`, last quote timestamp, one portfolio overall `$` (sum of eight positions).
- Single column of compact cards, mobile-first. Desktop is the same stack, wider.
- Rank `1` is best overall `%`. Green/red only on signed P/L and matching sparklines.

### Collapsed card

Rank, ticker, short name, start (fill), last, today `$`/`%`, overall `$`/`%`, sparkline fill → now.

### Expanded card

One card open at a time. Tap toggles. Expanding another collapses the first. Adds: shares, cost $400.00, market value, day open/high/low, larger since-buy chart (price axis, time axis, fill marked).

## Math

- Overall `$` = `(last × shares) − 400`
- Overall `%` = `(last − fill) / fill`
- Rank = overall `%` descending. Ties keep the table order above.
- Today `$` / `%` = last vs previous close (session, not vs fill).
- Portfolio `$` = sum of overall `$`.

Prices, dollars, and percents: 2 decimals. Shares: as stored.

## Data

Server-only Yahoo Finance chart API (`query1.finance.yahoo.com/v8/finance/chart/{ticker}`), wrapped in an adapter so the source can change without UI changes. No API key. Browser never calls Yahoo.

- `GET /api/stonks/quotes` — last, previous close, day open/high/low, quote time for all eight.
- `GET /api/stonks/history?ticker=&detail=0|1` — points since 2026-09-02 09:30 ET.
  - Sparkline (`detail=0`): `5m` if the window is ≤5 calendar days, else `1d`.
  - Expanded (`detail=1`): `5m` if ≤5 days, `1h` if ≤30 days, else `1d`.

Client: load positions + quotes + eight sparklines, sort, render. Poll quotes every 30s only when `document.visibilityState === 'visible'`. Do not poll history. On expand, fetch `detail=1` if not cached.

## Failures

- Quote miss: keep last good numbers, mark that card `stale`, still show it, rank with last known overall %.
- History miss: rank and numbers still work; sparkline is a two-point fill → last segment.
- Market closed: show last quote; timestamp is the quote time. No fake motion.

## Files

- `data/stonks.json` — positions
- `pages/stonks/index.js` — page
- `pages/stonks/stonks.module.css` — isolated styles
- `pages/api/stonks/quotes.js`
- `pages/api/stonks/history.js`
- `lib/stonks/math.js` — overall, today, portfolio, rank, expand toggle
- `lib/stonks/math.test.js` — `node --test`
- `lib/stonks/yahoo.js` — adapter
- `pages/index.js` — nav link

## Tests

`node:test` against `lib/stonks/math.js`. Fixture numbers only. No live network. Confirm the page in a browser after implementation.

1. Rank order from overall %; ties keep file order.
2. Overall and today `$`/`%` from last, fill, shares, previous close. Portfolio `$` is the sum of overall `$`.
3. `nextExpandedId(current, clicked)`: null → A opens A; A → A closes; A → B opens B.

## Out of scope

Period toggles (1D/1W/YTD), auth, editable lots, websockets, other tickers, matching golf/MUI chrome.
