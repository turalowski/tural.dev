---
title: "Browser Caching and HTTP Cache Headers"
excerpt: "How browser caching works and the HTTP headers that control it: Cache-Control, ETag, Last-Modified and Vary, plus the right settings for HTML, assets and APIs."
order: 12
date: "2026-11-26"
tags:
  - "Caching"
  - "HTTP"
  - "Browser Internals"
  - "Performance"
  - "Web Development"

author: "Tural Hajiyev"
locale: "en"
category: "Engineering"
---

The fastest request is the one that never happens. Every browser keeps an HTTP cache: a local store of responses it already downloaded. If a stored copy is still good, the browser uses it and skips the network entirely. The server decides what "still good" means, and it does that with HTTP headers.

## How the browser decides

```diagram
                  ┌─────────────────────────┐
                  │   Browser needs a file  │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐         ┏━━━━━━━━━━━━━━━━━━━━━┓
                  │        In cache?        │         ┃  Fetch from server  ┃
                  │  Matched by URL + Vary  ├─ no ───▶┃   200, then store   ┃
                  └────────────┬────────────┘         ┗━━━━━━━━━━━━━━━━━━━━━┛
                               │ yes
                               ▼
                  ┌─────────────────────────┐         ╔═════════════════════╗
                  │       Still fresh?      │         ║   Use cached copy   ║
                  │      max-age vs Age     ├─ yes ──▶║  No network at all  ║
                  └────────────┬────────────┘         ╚═════════════════════╝
                               │ no (stale)
                               ▼
                  ┌─────────────────────────┐
                  │        Revalidate       │
                  │    Send If-None-Match   │
                  └────────────┬────────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
╔═══════════════════════════╗     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
║      304 Not Modified     ║     ┃           200 OK          ┃
║    Reuse copy, no body    ║     ┃   New body, replace copy  ┃
╚═══════════════════════════╝     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  ╔═╗ served from cache        ┏━┓ full download from server
```

Caching comes down to two questions:

1. **Freshness:** can the browser use its copy without asking the server? That's controlled by `Cache-Control`.
2. **Validation:** once the copy is stale, can the server confirm it hasn't changed instead of sending it again? That's done with `ETag` or `Last-Modified`.

Here's the same flow for one file over time:

```diagram
┌─────────────────────┐                                ┌─────────────────────┐
│       Browser       │                                │        Server       │
│                     │                                │                     │
│                     ├─────── 1. GET /app.css ───────▶│                     │
│                     │◀──────── 2. 200 + body ────────┤                     │
│                     │           ETag: "v1"           │                     │
│                     │   Cache-Control: max-age=60    │                     │
│  fresh: uses copy,  │                                │                     │
│     no requests     │       ... 60 s pass ...        │                     │
│                     │                                │                     │
│  stale: asks again  │                                │                     │
│                     ├─── 3. If-None-Match: "v1" ────▶│                     │
│                     │◀─────── 4. 304, no body ───────┤                     │
│                     │                                │                     │
└─────────────────────┘                                └─────────────────────┘
```

## Freshness: Cache-Control

`Cache-Control` is the main header. It holds a comma-separated list of directives:

```http
Cache-Control: public, max-age=31536000, immutable
```

The directives you'll actually use:

- `max-age=N`: the response is fresh for N seconds. Until then, the browser uses its copy with no request at all.
- `no-cache`: the browser may store the response but must revalidate it with the server **every time** before using it. Despite the name, it doesn't mean "don't cache".
- `no-store`: don't store the response anywhere. Use it for sensitive data like banking pages or one-time tokens.
- `private`: only the user's browser may store it, not shared caches like CDNs or proxies. Use it for anything personalized.
- `public`: shared caches may store it too, even if the request had an `Authorization` header.
- `must-revalidate`: once stale, the copy must not be used without checking with the server first, even if the server is unreachable.
- `immutable`: the file will never change at this URL, so the browser shouldn't revalidate it, even when the user reloads the page.

## Validation: ETag and Last-Modified

When a copy goes stale, the browser doesn't have to download it again. It asks the server whether the file changed, using a validator it got with the original response.

**ETag** is an identifier for a specific version of the file, usually a hash of its contents:

```http
# first response
ETag: "33a64df5"

# later request
If-None-Match: "33a64df5"
```

If the file hasn't changed, the server returns `304 Not Modified` with no body, and the browser reuses its copy and treats it as fresh again. If it changed, the server returns `200` with the new file and a new ETag.

**Last-Modified** does the same job with a date instead of an ID:

```http
# first response
Last-Modified: Tue, 24 Nov 2026 10:00:00 GMT

# later request
If-Modified-Since: Tue, 24 Nov 2026 10:00:00 GMT
```

It's less precise: it has one-second resolution, and the date changes whenever a file is redeployed, even if its content didn't. When both are present, `ETag` wins. A `304` still costs a round trip, but it skips downloading the body, which is most of the cost for large files.

## The cache key and Vary

The browser finds a cached response by its URL. `Vary` tells it which request headers also matter:

```http
Vary: Accept-Encoding
```

Keep `Vary` to a few headers with a small number of values. `Vary: User-Agent` creates a separate entry for almost every browser version, so it barely caches at all. `Vary: *` means the response can never be reused.

## What to send for each kind of file

| Resource                        | Cache-Control                         | Why                                                                   |
| ------------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| Hashed assets (`app.3f9a1c.js`) | `public, max-age=31536000, immutable` | The URL changes whenever the content does, so a copy can live forever |
| HTML pages                      | `no-cache` + `ETag`                   | Users always get the latest page, and it links to the latest assets   |
| Unhashed files (`/logo.png`)    | `max-age=3600` + `ETag`               | Short freshness, then a cheap revalidation                            |
| Personalized API responses      | `private, no-cache`                   | Never cached on a CDN, always checked with the server                 |
| Sensitive data                  | `no-store`                            | Never written to disk                                                 |

The first two rows together are the most common pattern. Build tools put a content hash in asset file names, so a new build means new URLs, and the old cached files are simply never asked for again. The HTML is the only file that has to be checked on every visit, and it's small.

## Common mistakes

- **Using `no-cache` to mean "don't cache".** It still stores the response; it just revalidates every time. Use `no-store` if nothing should be stored.
- **Long `max-age` on unhashed URLs.** If `/app.js` is cached for a year, users keep the old version after a deploy, and there's no way to make the browser forget it. Long lifetimes only work with hashed file names.
- **Caching HTML for a long time.** A cached HTML page keeps pointing at old asset hashes, which can be gone from the server after a deploy.
- **Forgetting `private` on user-specific responses.** Without it, a CDN may cache one user's data and serve it to others.
- **Missing validators.** Without `ETag` or `Last-Modified`, a stale copy can't be revalidated, so the browser downloads the whole file again.
