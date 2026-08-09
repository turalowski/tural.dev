---
title: "GraphQL vs REST API — What REST Pain Points Does GraphQL Solve?"
excerpt: "REST gives you fixed endpoints with set responses controlled by the server. GraphQL lets the client pick the exact data needed in a single request."
date: "2024-11-24"
tags:
  - "API Design"
  - "GraphQL"
  - "REST API"
  - "Backend"
  - "Frontend"
  - "Web Development"
author: "Tural Hajiyev"
locale: "en"
category: "Engineering"
---

> In REST APIs, the server shapes every response. You get fixed endpoints like (`/relations/1`, `/relations/1/trade-operations`), and each returns a defined structure. GraphQL lets the client decide which fields to fetch—from a single endpoint (`/graphql`).

Suppose you're building an ERP app and using REST. You want to display relations, trade operations, and finance data. The backend team sets up **/relations** and wires up each endpoint:

```bash
GET /api/v1/relations/
GET /api/v1/relations/[relation-id]

POST /api/v1/relations
PUT /api/v1/relations
DELETE /api/v1/relations
```

## Over-Fetching and Needing Backend Changes

Maybe the relations list is huge. But for a dashboard, you only need `fullName`, `companyName`, and `date`. Calling `GET /api/v1/relations` brings back all fields—more than you want. That's over-fetching.

You can try to fix this in REST in two ways:

```bash
GET /api/v1/relations/mini-dashboard
```

or:

```bash
GET /api/v1/relations?fields=fullName,companyName,date
```

Either way, you need backend changes. Each adjustment means new endpoints or changes to field handling. There's no built-in flexibility. Over time, endpoints may drift from what the frontend needs.

Over-fetching isn't just a read concern. If you POST a new relation and want only the `id` and `fullName` back, you still might get the entire object:

```json
{
  "id": "1725",
  "fullName": "Michael Scott",
  "companyName": "Dunder Mifflin",
  "date": "2024-01-01",
  "address": "1725 Slough Avenue, Scranton, PA",
  "phone": "555-2323",
  "notes": "World's Best Boss"
  // many other fields
}
```

GraphQL uses a different model. There's one endpoint (`/graphql`). The client picks the fields it wants, regardless of scenario.

Instead of `/api/v1/relations` always returning the same thing, a GraphQL query can be as specific as you like:

```graphql
query {
  relations {
    fullName
    companyName
    date
  }
}
```

1. No over-fetching—just the fields you ask for.
2. No backend change needed for small tweaks. Need to add `date`? Just include it in your query (as long as that field's in the schema).

## Multiple Requests and Chatty APIs

REST usually means making several calls to build a single page. A dashboard, for example, might need:

- `GET /api/v1/relations`
- `GET /api/v1/relations/:id/trade-operations`
- `GET /api/v1/relations/:id/financial-operations`

Each call adds to network overhead. If the data is nested or related, you have to keep stacking requests to get a complete view.

With GraphQL, the client can ask for everything at once—including nested and related records:

```graphql
query DashboardRelations {
  relations {
    id
    name
    tradeOperations {
      id
      date
      financialOperations {
        id
        amount
      }
    }
  }
}
```

You avoid both over- and under-fetching, and you don't need to merge and manage results from multiple REST calls.

## Type Safety

REST returns generic JSON. On the frontend, you write TypeScript interfaces to match the responses. If the backend changes a field (or its name), your types can get out of sync. It's easy to miss these changes, and your app and API quickly drift apart.

You often handcraft interfaces:

```ts
interface FinancialOperation {
  id: number;
  amount: number;
}

interface TradeOperation {
  id: number;
  date: string;
  financialOperations: FinancialOperation[];
}

interface Relation {
  id: number;
  name: string;
  tradeOperations: TradeOperation[];
}
```

## Cache Sync

With REST, you typically have to refetch big lists (inefficient), or manually patch cached entries (fragile and messy):

```ts
const mutation = useMutation(updatePost, {
  onSuccess: () => {
    queryClient.invalidateQueries(["posts"]); // refetch all posts
  },
});
```

GraphQL tools cache data by unique ID. When you update an object, all clients using that data see the change automatically. No need to refetch lists or manually update the cache.

If the backend renames a field (say, `amount` becomes `value`), in REST you need to find and update every related TypeScript interface throughout your app. As your app grows, this gets more painful.

With GraphQL, the schema is typed, and you can generate your TypeScript types straight from it. When the schema changes, just rerun codegen, and your frontend types stay in sync. No guesswork, no more hand-maintained interfaces.

## When To Use GraphQL or REST

It depends. If your data is deeply nested, you support multiple clients with different data needs, or you hit over-/under-fetching pains, GraphQL fits the bill. One schema acts as the source of truth. Frontend teams can move faster—no constant backend tweaks.

If your API is simple—just a few resources, basic CRUD, file uploads—REST is often best. Simple is good for files, webhooks, and integrations that don't need deep flexibility.

In practice, teams mix both: GraphQL for the main app UI, REST for jobs like file uploads, authentication, webhook handlers, or talking to legacy systems. The setup isn't always pretty, but it works and scales as needs evolve.
