---
title: "GraphQL vs REST API — Which one to choose?"
excerpt: "REST gives you fixed endpoints with set responses controlled by the server. GraphQL lets the client pick the exact data needed in a single request."
date: "2026-04-24"
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

> A REST API is like a restaurant with a set of fixed combo menus. You can order Menu A, which comes with a burger, fries, and a cola — but you can't swap the fries for a salad. GraphQL, on the other hand, sells you everything à la carte, so you build your own plate exactly the way you want it.

Say you're building an ERP application and it uses a REST API to make requests for different modules. Different API endpoints help get data related to relations, trade operations, and finance data. For example, the backend team sets up **/relations** and wires up each endpoint:

```bash
GET /api/v1/relations/
GET /api/v1/relations/[relation-id]

POST /api/v1/relations
PUT /api/v1/relations
DELETE /api/v1/relations
```

In REST APIs, the server shapes every response. You get fixed endpoints like (`/relations/1`, `/relations/1/trade-operations`), and each returns a defined structure.

## Over-Fetching and Needing Backend Changes

The `GET /api/v1/relations` endpoint returns a large dataset for each relation. For example, the data might look like this:

```json
[
  {
    "id": "1725",
    "fullName": "Michael Scott",
    "companyName": "Dunder Mifflin",
    "date": "2024-01-01",
    "address": "1725 Slough Avenue, Scranton, PA",
    "phone": "555-2323",
    "notes": "World's Best Boss"
    // ...many other fields
  },
  {
    "id": "1726",
    "fullName": "Pam Beesly",
    "companyName": "Dunder Mifflin",
    "date": "2024-01-10",
    "address": "1727 Slough Avenue, Scranton, PA",
    "phone": "555-4545",
    "notes": "Receptionist"
    // ...many other fields
  }
]
```

For the relations page, we need this data. A new task comes in, and it's required to show relations on the dashboard in compact form. For the dashboard, you only need `fullName`, `companyName`, and `date`. Calling `GET /api/v1/relations` brings back all fields—more than you want. That's over-fetching.

With REST API, there are two common ways to improve it. Either a new endpoint can be introduced with the compact data,

```bash
GET /api/v1/relations/mini-dashboard
```

or filters can be added, which can be used to get only the necessary fields:

```bash
GET /api/v1/relations?fields=fullName,companyName,date
```

Both implementations require backend changes. It's required to add a new endpoint, or update the existing one. Over time, endpoints may drift from what the frontend needs.

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

Getting a bunch of unnecessary data back, with no way to avoid it, is called **over-fetching**.

GraphQL uses a different model. There's one endpoint (`/graphql`). The frontend picks the fields it wants, regardless of scenario.

Instead of `/api/v1/relations` always returning the same thing, a GraphQL query can be as specific as the client likes:

```graphql
query {
  relations {
    fullName
    companyName
    date
  }
}
```

GraphQL lets the client decide which fields to fetch—from a single endpoint (`/graphql`).

1. No over-fetching anymore, and frontend gets the fields it asks for.
2. No backend change needed for small tweaks. Need to add a date field? Only need to include it in the query (as long as that field's in the schema).

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

It's easy to avoid over-fetching, and there's no need to merge and manage results from multiple REST calls.

## Type Safety

REST returns generic JSON. On the frontend, developers can write TypeScript interfaces to match the responses. If the backend changes a field (or its name), types can get out of sync easily. It's easy to miss these changes, and your app and API quickly drift apart.

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

If the backend renames a field (say, `amount` becomes `value`), in REST you need to find and update every related TypeScript interface throughout your app. As your app grows, this gets more painful.

With GraphQL, the schema is typed, and you can generate your TypeScript types straight from it. When the schema changes, just rerun codegen, and your frontend types stay in sync. No guesswork, no more hand-maintained interfaces.

## Cache Sync

With REST, you typically have to refetch big lists (inefficient), or manually patch cached entries (fragile and messy):

```ts
const mutation = useMutation(updatePost, {
  onSuccess: () => {
    queryClient.invalidateQueries(["posts"]); // refetch all posts
  },
});
```

With a normalized GraphQL client like Apollo or Relay, data is cached by unique ID. When an object is updated, all parts of the UI using that data are updated automatically. No need to refetch lists or manually update the cache. (Note that this caching behavior comes from the client library, not GraphQL itself.)

## When To Use GraphQL or REST

It depends. If the data is deeply nested, and you have multiple clients with different data needs, that's when GraphQL shines. Or, if there are over-fetching pains in many places, GraphQL is a great tool to use. One schema acts as the source of truth. Frontend teams can move faster without constantly asking for changes from backend tweaks.

If the API is simple—just a few resources, basic CRUD, and maybe file uploads, REST is often best. Simple is good for files, webhooks, and integrations that don't need deep flexibility.

In practice, teams mix both: GraphQL for the main app UI, REST for jobs like file uploads, authentication, webhook handlers, or talking to legacy systems. The setup isn't always pretty, but it works and scales as needs evolve.
