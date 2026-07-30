---
title: "GraphQL vs REST API — What pains do we have with Rest API that GraphQL solves it?"
excerpt: "REST gives you fixed endpoints and rigid responses — the server decides the shape. With GraphQL, the client defines exactly the data needed in one request."
date: "2024-10-24"
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

> With Rest API, the server decided the shape of the response. You get fixed endpoints (`/relations/1`, `/relations/1/trade-operations`), each returning a fixed data structure. With GraphQL, the client decides the shape of the response. You send a query describing exactly what fields you want, from a single endpoint (`/graphql`)

Let's imagine that we are starting to a new application with a rest API. it's an ERP application, we require to show relations, trade operations and finance operations. First backend team is required to start with relations, and provide necessary endpoints.

```
GET /api/v1/relations/
GET /api/v1/relations/[relation-id]

POST /api/v1/relations
PUT /api/v1/relations
DELETE /api/v1/relations
```

## Over-fetching and requesting changes from backend team each time

Imagine relations data is too big, so for the dashboard, we need a mini version that returns only `fullName`, `companyName`, and `date`. If we continue using `GET /api/v1/relations`, each time we will get more data than needed, which can be called **over-fetching**.

We can fix this issue with Rest API by either implementing a new endpoint,

```
GET /api/v1/relations/mini-dashboard
```

or we can implement a new query parameter to mention which fields we need,

```
GET /api/v1/relations?fields=fullName,companyName,date
```

The first pain is already started. Initially we were **over-fetching**. When we want to fix it, either backend team needs to implement new API endpioints each time, or they need to manually implement fields query parameter, and maintain it properly. Nothing is automated. Everything is error-prone, and can be outdated quickly.

**Over-fetching** isn't just an issue when fetching data and it applies to posting data too. For example, suppose we create a new relation by posting data to the server, and in the response, we only want the newly created relation's `id` and `fullName`.

A typical REST endpoint often returns the whole relation object, with all available fields (including many you don't need):

```
{
  "id": "1725",
  "fullName": "Michael Scott",
  "companyName": "Dunder Mifflin",
  "date": "2024-01-01",
  "address": "1725 Slough Avenue, Scranton, PA",
  "phone": "555-2323",
  "notes": "World's Best Boss",
  // many other fields
}
```

The main difference of GraphQL starts here. Instead of having multiple endpoints, GraphQL offers a single endpoint (generally `/graphql`) to make API requests. With this single endpoint, the client specifies the exact data structure needed for each specific case.

For example, instead of hitting `/api/v1/relations` and always getting the same full relation object, with GraphQL you can send a query like:

```
query {
  relations {
    fullName
    companyName
    date
  }
}
```

1. No **over-fetching** anymore. This will return only the fields you requested, nothing more, nothing less. You don't have to ask the backend to create a new endpoint or a "mini" version—all flexibility is in the client's hands.
2. Nothing required to be requested from backend team. If we want to get `date` propety of relations, we can just add it to the request, that's all. If data is there, we will get it.

## Multiple round trips (chatty APIs)

A common issue with REST APIs is that you often need to make several requests to get all the data needed for a single feature or page. For example, if your dashboard needs information about relations, recent trade operations, and related financial data, this might require:

- One request to `GET /api/v1/relations`
- Another to `GET /api/v1/relations/:id/trade-operations`
- Another for `GET /api/v1/relations/:id/financial-operations`

Each of these is a separate network round trip, increasing total loading times and complexity. Especially as the relationships get more complex or deeply nested, you can quickly find yourself making a series of dependent requests just to assemble one view.

GraphQL fixes this by letting the client request exactly the shape of data it needs—including nested or related objects—all in a single query. You get only what you ask for, no more, no less, and the number of network round trips is typically just one. This dramatically reduces both over-fetching and under-fetching, and means the client no longer has to “stitch together” the result with several fetches.

Here's a practical example of a GraphQL query compared to REST for fetching deeply nested relational data for a dashboard:

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

## Type Safety

With REST APIs, there's no built-in type system and you just get raw JSON back. That means, as a frontend dev, you have to manually write TypeScript interfaces for every response, and if backend changes something (adds, removes, or renames a field), it's very easy for your types to silently go out of sync. You're stuck chasing changes and hoping your types are up to date.

To work safely in TypeScript, you'd need to define interfaces yourself, like:

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

## Cache Updates After a Mutation

With Rest API, it's required either refetch broadly (wasteful) or manually patch the cache entry by hand (fragile, lots of boilerplate as the app grows)

```ts
const mutation = useMutation(updatePost, {
  onSuccess: () => {
    queryClient.invalidateQueries(["posts"]); // blunt: refetch everything tagged 'posts'
  },
});
```

With GraphQL, every object in the cache has a stable id and you can surgically update just that object, and every component reading it anywhere in the tree updates. It doesn't require refetch and over-invalidation.

Whenever the backend adds or changes a field (for example, renaming `amount` to `value`, or adding another property), you have to manually update your interfaces everywhere you use the response. This can become tedious and error-prone, especially as your API evolves.

With GraphQL, the API schema is typesafe by default. You can automatically generate TypeScript types right from the backend schema and no more guessing or maintaining a pile of hand-written interfaces. When the schema changes, you just re-run codegen and your app knows about it. It's safer, faster to develop, and means way fewer surprises when someone changes a field name.

## So... Should You Use GraphQL or REST?

There is no universal answer here and anyone who tells you otherwise is probably trying to sell you a consultancy. Here's how I think about it:

Does your data look like nested objects inside other nested objects, different clients needing just the right slice of data, and everyone whining about over/under-fetching? That's where GraphQL quietly shines. You define your single source of truth (the schema), and suddenly the frontend folks aren't chasing backend changes every week. No new endpoint just because one screen needs a slightly different shape.

But, let's keep it real: sometimes you just need to expose a couple of resources, make a classic CRUD app, or hand off some files. REST does this out of the box and has almost boringly reliable primitives for things like file uploads and webhooks.

And here's the practical part nobody admits until much later: most big companies end up mixing both. GraphQL often becomes the brains where the core graph that powers the product UI while REST endpoints handle your file handling, auth, Stripe webhooks, and connections to those old-school third-party systems. The best architecture might be a little bit messy, but it works.
