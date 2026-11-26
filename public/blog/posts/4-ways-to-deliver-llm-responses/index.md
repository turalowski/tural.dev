---
# Required
title: "4 Ways to Deliver LLM Responses"
excerpt: "How to deliver LLM responses with REST, streaming (SSE), WebSockets or async jobs: how each one works, when to use it, and the trade-offs of each."
order: 11 # Higher = newer; posts are listed highest first
date: "2026-11-26"
tags:
  - "LLM"
  - "AI Engineering"
  - "API Design"
  - "Streaming"
  - "WebSocket"
  - "Web Development"

# SEO / social (all supported by generateMetadata + JSON-LD)
author: "Tural Hajiyev"
locale: "en" # "en" → en_US, "az" → az_AZ
category: "Engineering"
---

## REST API (plain request/response)

The frontend sends a POST request, the backend waits for the model to finish, and it returns the whole answer in one JSON response. It's the simplest option to build, test, cache, and debug.

```diagram
┌─────────────────┐                            ┌─────────────────┐
│     Frontend    │                            │     Backend     │
│                 │                            │                 │
│                 ├────── 1. POST /chat ──────▶│                 │
│                 │                            │                 │
│     nothing     │                            │    model runs   │
│     to show     │                            │     10-60 s     │
│                 │◀── 2. full answer (JSON) ──┤                 │
│                 │                            │                 │
└─────────────────┘                            └─────────────────┘
```

Benefits:

- It works with every HTTP client, framework and hosting platform, with no special setup.
- Responses are easy to cache, retry and log, because each one is a single complete JSON body.
- You get the whole answer at once, so you can validate it, parse structured output or run moderation before showing anything.
- It's a good fit for short answers and for backend-to-backend calls where no one is watching the output appear.

Downsides:

- The user sees nothing until generation finishes, which can take 10 to 60 seconds and makes the app feel slow.
- Long requests can hit timeouts at proxies, gateways or serverless platforms (often 30 to 60 seconds).
- There is no good way to show progress or partial output.

## Data Stream (SSE or HTTP chunked streaming)

The frontend makes one HTTP request and the server sends tokens back as they're generated. This is usually done with Server-Sent Events (text/event-stream) or a chunked response read through `fetch` and `ReadableStream`. ChatGPT-style apps and most LLM APIs work this way.

```diagram
┌─────────────────┐                            ┌─────────────────┐
│     Frontend    │                            │     Backend     │
│                 │                            │                 │
│                 ├────── 1. POST /chat ──────▶│                 │
│                 │◀──────── 2. token ─────────┤                 │
│    renders as   │◀──────── 3. token ─────────┤                 │
│  tokens arrive  │◀──────── 4. token ─────────┤                 │
│                 │◀──────── 5. [DONE] ────────┤                 │
│                 │                            │                 │
└─────────────────┘                            └─────────────────┘
```

Benefits:

- Users see tokens almost immediately, which makes the app feel much faster.
- It's still plain HTTP, so it works with most infrastructure.
- It's one directional and simple, with no extra protocol to manage.
- Most AI SDKs support it out of the box.

Downsides:

- It only goes from server to client. You can stop generation by closing the connection, but sending anything else mid-stream, such as approving a tool call, needs a separate request.
- A dropped connection is harder to handle. The stream only exists inside that one request: when it drops, the server usually stops generating, and the tokens already sent aren't stored anywhere. Resuming means regenerating the answer, unless you buffer the output on the server (in Redis, for example) and let the client reconnect from the last token it received.

## WebSocket

A persistent, two-way connection between client and server.

```diagram
┌─────────────────┐                            ┌─────────────────┐
│     Frontend    │                            │     Backend     │
│                 │                            │                 │
│                 ├────── 1. open ws:// ──────▶│                 │
│                 ├───── 2. user message ─────▶│                 │
│                 │◀── 3. status: searching ───┤                 │
│    same open    │◀──────── 4. token ─────────┤                 │
│    connection   │◀──────── 5. token ─────────┤                 │
│                 ├─── 6. stop / follow-up ───▶│                 │
│                 │◀─────── 7. stopped ────────┤                 │
│                 │                            │                 │
└─────────────────┘                            └─────────────────┘
```

Benefits:

- Fully two-way: the client can interrupt, send follow-ups, or stream audio while receiving output.
- Low latency per message once the connection is open.
- Ideal for real time voice AI, collaborative sessions, agents that push status updates, and multi-user apps.

Downsides:

- Stateful connections are harder to scale. You need sticky sessions or a pub/sub layer like Redis.
- You have to build reconnection, heartbeats and message ordering yourself.
- Auth, rate limiting and logging don't plug in as neatly as they do with HTTP.

## Async jobs + polling or webhooks

The frontend submits a job and immediately gets back a `job_id`. A worker processes it in the background. The frontend then either polls `GET /jobs/{id}` or gets notified when it's done, through a webhook, a push notification or an email.

```diagram
┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐
│   Frontend  │                 │     API     │                 │    Worker   │
│             │                 │             │                 │             │
│             ├ 1. POST /jobs ─▶│             │                 │             │
│             │◀── 2. job_id ───┤             ├─ 3. enqueue ───▶│             │
│             │                 │             │                 │             │
│             ├ 4. GET status ─▶│             │                 │  works for  │
│             │◀─ 5. pending ───┤             │                 │   minutes   │
│             │                 │             │◀── 6. result ───┤             │
│             ├ 7. GET status ─▶│             │                 │             │
│             │◀─── 8. done ────┤             │                 │             │
│             │                 │             │                 │             │
└─────────────┘                 └─────────────┘                 └─────────────┘
```

Benefits:

- Handles very long tasks well, from minutes to hours: video or image generation, large document analysis, batch jobs, deep research agents.
- Jobs survive page refreshes, client disconnects and server restarts if they're queued in something like Redis.

Downsides:

- More moving parts: a queue, workers, job storage and status tracking.
- Polling wastes requests and adds lag, while webhooks need a publicly reachable endpoint, which browsers don't have.
