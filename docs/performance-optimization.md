# Performance optimization notes

## Work completed

- Kept the existing courier dashboard and API in separate `frontend/` and `backend/` folders.
- Retained the existing Next.js App Router and React setup. The page shell and layout remain server-rendered; interactive areas are client components.
- Added dynamic loading for dashboard analytics, operations, and list widgets, with loading fallbacks.
- Added TanStack React Virtual for parcel and customer lists, debounced parcel search, memoized derived dashboard data, and cleanup for the toast timer.
- Raised the backend parcel list limit to 100 so the dashboard's bounded list query can request its full page.
- Added `/performance`, a self-contained comparison page that renders the same 1,000 synthetic parcels and 1,000 synthetic customers either all at once or through virtualized lists. `React.Profiler` reports render durations in the browser console.
- Refreshed the public home, authentication screens, dashboard, and performance page with a consistent forest-and-citrus palette, clearer type scale, roomier cards, responsive controls, and reduced-motion support.

The implementation follows the framework's dynamic loading guidance and TanStack Virtual's React virtualizer API: [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading), [TanStack React Virtual](https://tanstack.com/virtual/latest/docs/framework/react/react-virtual).

## Bundle comparison

The dashboard route's emitted JavaScript references were measured from the built HTML and referenced static assets, before and after the changes.

| Build | Referenced JS assets | Total JS bytes | Total |
| --- | ---: | ---: | ---: |
| Before | 10 | 664,105 | 648.5 KiB |
| After | 9 | 628,346 | 613.6 KiB |
| Change | -1 | -35,759 | -34.9 KiB (-5.4%) |

Reproduce after a frontend build with `node scripts/measure-route-bundle.mjs dashboard` from `frontend/`.

## Lighthouse: public homepage

Lighthouse 13.6.0 desktop audits were run against local production builds on the same machine. This is the public homepage (`/`), not the authenticated dashboard. Saved audit JSON files are alongside this report. For what the performance score covers, see [Chrome Lighthouse overview](https://developer.chrome.com/docs/lighthouse/overview).

| Metric | Before | After |
| --- | ---: | ---: |
| Performance score | 100 | 100 |
| First Contentful Paint | 223 ms | 214 ms |
| Largest Contentful Paint | 223 ms | 214 ms |
| Speed Index | 364 ms | 338 ms |
| Total Blocking Time | 0 ms | 0 ms |
| Cumulative Layout Shift | 0 | 0 |
| Requests | 19 | 18 |
| Script transfer | 261,242 bytes | 247,183 bytes |
| Total transfer | 287,970 bytes | 280,099 bytes |

The Lighthouse navigation run did not report Interaction to Next Paint (INP), so no INP result is claimed.

## List rendering comparison

The browser check used the performance page with the same 1,000-row fixtures per list in both modes:

| Mode | Parcel rows in DOM | Customer rows in DOM | Profiler actual duration (parcels / customers) |
| --- | ---: | ---: | ---: |
| Render all | 1,000 | 1,000 | 343.3 ms / 123.4 ms |
| Virtualized | 13 | 13 | 7.9 ms / 5.4 ms |

These React Profiler durations came from a development browser session, so they demonstrate the fixture comparison rather than production user timings. A 390 × 844 viewport also showed no horizontal overflow, and the browser console had no errors or warnings during this check.

## Scope and remaining work

- The dashboard bundle comparison is based on locally built static route HTML and its referenced JS assets. It is not a full authenticated production session measurement.
- The Lighthouse result is from the public homepage. The actual dashboard needs local PostgreSQL/Redis configuration, backend setup, API data, and an authenticated account.
- The performance page uses synthetic data. The parcel API query is bounded at 100; the customer directory currently loads the available customer collection, so server-side pagination/search would be a next step for very large accounts.
- No deployment URL or repository was supplied. A hosted demo and demo video remain outside this local implementation.
