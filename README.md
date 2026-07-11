# Move to Chicago

A relocation guide site for RE/MAX Metropolitan IL — Chicago neighborhoods,
suburbs, live MLS listings, and a daily-refreshing local content feed.

## Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. The site works fully out of the box with
mock listings and seed daily content — nothing else is required to preview
or design-review it.

## Deploying to movetochicago.com

The `/api` folder uses Vercel serverless functions and Vercel Cron, so
**Vercel** is the easiest host:

1. Push this project to a GitHub repo, then import it in Vercel.
2. In Vercel → your project → **Settings → Domains**, add `movetochicago.com`
   and follow the DNS instructions (point the domain's A/CNAME records at
   Vercel from wherever it's registered).
3. Add environment variables (Settings → Environment Variables) — see
   `.env.example`. At minimum you can deploy with none of them set; the
   listings and daily content will just show mock/seed data until connected.

If you would rather host elsewhere (e.g., keep it a static site on the same
host as remaxmetropolitanil.com), `npm run build` produces a static `dist/`
folder you can upload anywhere — you would just lose the `/api` daily content
automation and instead update `src/data/dailyContent.seed.json` by hand.

## Connecting real MLS listings (IDX)

Listings currently come from `src/data/listings.mock.json`, shaped exactly
like a real feed so swapping it out is a config change, not a rewrite. Real
listings **cannot be scraped** from remaxmetropolitanil.com — MLS data is
licensed and brokerage sites block scraping for exactly that reason. To get
live listings:

1. Ask your broker/MLS (MRED, for Chicago) for **RESO Web API** access — this
   is the modern standard most MLSs now support directly.
2. Alternatively, ask whoever manages remaxmetropolitanil.com whether the
   RE/MAX franchise platform (often Booj) already exposes an API or embeddable
   widget you're entitled to as a franchisee — this can be faster than a
   fresh MLS request.
3. Once you have a base URL and API key, set `VITE_IDX_API_BASE` and
   `VITE_IDX_API_KEY` in your environment. `src/lib/idx.js` will
   automatically start hitting the real feed instead of mock data — no other
   code changes needed.

## Daily fresh content (news, food, festivals, schools)

The "Chicago Daily" page is built to auto-refresh once a day via:

- `api/cron-refresh-daily-content.js` — calls the Claude API with web search
  enabled, asks it to find current Chicago news/food/festival/school items,
  and writes the result to a small key-value store (Vercel KV).
- `api/daily-content.js` — serves whatever the cron job last wrote.
- `vercel.json` — schedules the cron job to run once a day at 11:00 UTC
  (adjust the cron string for a different time).

To turn this on:

1. In Vercel: **Storage → Create Database → KV**, link it to this project
   (this sets `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically).
2. Get an Anthropic API key at console.anthropic.com and add it as
   `ANTHROPIC_API_KEY` in your environment variables. Note this is billed at
   standard API rates — this is a different thing from Claude.ai usage.
3. Set `CRON_SECRET` to any random string; Vercel automatically sends it as a
   Bearer token when it triggers the cron job, and `cron-refresh-daily-content.js`
   checks it to make sure random visitors cannot trigger the job themselves.
4. Deploy. The first run happens on the next scheduled cron tick — you can
   also trigger it manually once by calling the endpoint yourself with the
   right Bearer token to confirm it works.

If you would rather not depend on an LLM call for this, an equally valid
alternative is swapping the body of `cron-refresh-daily-content.js` to instead
pull from a couple of Chicago RSS feeds directly (Block Club Chicago, Choose
Chicago's events calendar, CPS announcements) and skip the API key entirely —
the shape written to KV just needs to match `{ generatedAt, items: [...] }`.

## Content

- `src/data/neighborhoods.json` — 24 Chicago neighborhoods across all sides
  of the city. Add more by following the existing shape.
- `src/data/suburbs.json` — 18 suburbs across the North Shore, west,
  northwest, and southwest regions.
- Both are plain JSON, so a non-developer can extend them without touching
  any component code.

## Photography and editorial copy

**Real photos, sourced from Wikimedia Commons:** 8 of the 42 neighborhoods/
suburbs now have real, freely-licensed photos instead of generic stock —
Lincoln Park, Lakeview, Wicker Park/Bucktown, Logan Square, and Andersonville
in the city; Evanston, Oak Park, and Hinsdale in the suburbs (the ones
featured on the homepage). Each has a `photo` field pointing at a Commons
file and a `photoCredit` field with attribution, shown as a small caption on
that entry's detail page hero image.

The remaining 34 entries still use generic Unsplash placeholders. To finish
the rest with the same method:

1. Search `commons.wikimedia.org Category [Neighborhood name] Chicago` (or
   `File [Landmark name]` for a specific building/street).
2. Pick a file that's a genuine streetscape/landmark shot for that specific
   place — Commons only hosts freely-licensed or public-domain media by
   policy, so any file found this way is legally safe to use; the only
   judgment call is whether the photo actually looks right.
3. Build the URL as:
   `https://commons.wikimedia.org/wiki/Special:FilePath/<url-encoded filename>?width=1200`
   This redirects to the actual image and works directly in an `<img src>`.
4. Add both `photo` (the URL above) and `photoCredit` (a short attribution
   line — file title, photographer if credited, "via Wikimedia Commons") to
   that entry in `neighborhoods.json` or `suburbs.json`.

This is mechanical enough to hand to any developer or do yourself a
neighborhood at a time — I did the first 8 as a working example of the
exact pattern.

**Stories**: the restaurant reviews, neighborhood stories, and festival
previews in `stories.json` (with their own separate photo set) are
illustrative drafts, not fact-checked journalism — some reference real
restaurants and events (Kasama, Girl & the Goat, Taste of Chicago) and should
be reviewed for current accuracy (hours, status, festival dates) before
publishing, or replaced with your own writers' content entirely. Their
photos are still Unsplash placeholders and would benefit from the same
Commons treatment, or original photography of the dish/event itself.

## What still needs a real decision from you

- **Domain**: confirm movetochicago.com is available/registered and pointed
  at this deployment.
- **MLS/IDX credentials**: the single biggest unlock — everything else works
  today without it.
- **Legal/compliance**: confirm your MLS's Internet Data Exchange (IDX)
  display rules (required disclaimers, listing agent attribution, etc.) —
  these vary by MLS and are usually spelled out in the IDX agreement you sign.
