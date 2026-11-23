---
# Required
title: "What is data normalization and denormalization in frontend development"
excerpt: "Normalized vs denormalized frontend state: How storing entities once prevents UI inconsistency, and when keeping API data as-is is the better choice."
order: 10
tags:
  - "Architecture"
  - "Frontend Engineering"
  - "State Management"
  - "React"

author: "Tural Hajiyev"
locale: "en" #
category: "Engineering"
---

Imagine you're a frontend engineer working on an **ERP application**. You have:

- Products Page
- Sales Operations
- Purchase Operations
- Warehouse Stock Page
- Reports

The same product can appear on multiple pages. For example, `MacBook Pro 14`. It appears on the Products Page, in the lines of a sale operation, in Warehouse Stock, in the Low Stock widget on the dashboard, etc. From the backend, each API returns the product in its own shape. For example:

`/products`

```json
[
  {
    "id": 1,
    "name": "MacBook Pro 14",
    "price": 2499,
    "stock": 10
  }
]
```

`/sales/42`

```json
{
  "id": 42,
  "customer": {
    "id": 7,
    "name": "Acme LLC"
  },
  "lines": [
    {
      "id": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "MacBook Pro 14",
        "price": 2499,
        "stock": 10
      }
    }
  ]
}
```

The same data comes from multiple endpoints, and sometimes it's nested inside other entities.

## Denormalized state

The most straightforward approach is storing the data as we received it:

```ts
setState({
  products: [
    {
      id: 1,
      name: "MacBook Pro 14",
      price: 2499,
      stock: 10,
    },
  ],
  sale: {
    id: 42,
    customer: { id: 7, name: "Acme LLC" },
    lines: [
      {
        id: 1,
        quantity: 2,
        product: {
          id: 1,
          name: "MacBook Pro 14",
          price: 2499,
          stock: 10,
        },
      },
    ],
  },
});
```

Imagine the cashier confirms the sale, and 2 MacBooks are sold. The stock should go from 10 to 8. On the frontend we use an optimistic update, which means we need to update the same product in multiple places (position of product is illustrative):

```
products[0]
sale.lines[0].product
warehouseStock[3]
lowStockWidget[1]
```

> Optimistic Update - the UI behaves as though a change was successfully completed before receiving confirmation from the server that it actually was.

If we forget one of these locations, a data mismatch will happen. The Macbook's stock be 8 in the sale form, but 10 in the warehouse panel next to it. In an ERP it's not only an ugly UI. Somebody can try to sell a product that is not in the warehouse anymore and get confused. This is called UI inconsistency, and it's something we should avoid.

> Normalization keeps one browser consistent and helps to show error messages, warnings or disabled buttons on time. For data validation the main truth point is always server, but having wrong data on frontend can be understand as "action is available" and after the failure user can be confused.

## Normalized State

Another approach is to store each entity once, instead of storing it everywhere. For example:

```json
{
  "products": {
    "1": {
      "id": 1,
      "name": "MacBook Pro 14",
      "price": 2499,
      "stock": 8
    }
  },
  "customers": {
    "7": {
      "id": 7,
      "name": "Acme LLC"
    }
  },
  "sales": {
    "42": {
      "id": 42,
      "customer": 7,
      "lines": [{ "id": 1, "product": 1, "quantity": 2 }]
    }
  },

  "productList": [1],
  "warehouseStock": [1]
}
```

Here the main difference is the source of truth. Product detail is only in one place, and the other places are using the id of the product instead of whole details. Even the sale doesn't hold the product, it only holds the id. We update the stock once, and it's updated in multiple places.

> A fair question is why the backend doesn't send us normalized data in the first place. Actually, it is usually normalized in the database. Products live in one table, and sale lines only reference them by id.
>
> The API denormalizes on purpose. Each endpoint is designed for a specific use case, so `/sales/42` returns everything needed to render the sale in one request, without making the client fetch the customer and each product separately.
>
> More importantly, the server doesn't know what the client already has. It can't know that MacBook is already loaded from `/products` when you call `/sales/42`. The duplication only appears on the client side, when responses from different endpoints are combined in one place. That's why normalization is mostly a frontend concern: the client is the only one who sees the whole picture.

This doesn't mean denormalization is bad or something to avoid. Each has its own benefits, and the decision mostly depends on the domain and structure of the application.

For example, imagine there is a Sales Report page:

```json
{
  "period": "2026-10",
  "rows": [
    { "product": "MacBook Pro 14", "quantity": 124, "revenue": 309876 },
    { "product": "iPhone 17", "quantity": 310, "revenue": 309690 }
  ],
  "total": 619566
}
```

This structure is good for rendering the report as it is. The report is calculated by the server, it's read-only, and nobody edits it on the page. It's a snapshot of a period, so even if the stock changes now, the report shouldn't change. If we normalize the data, we will need a bunch of selectors to join rows with products, and we get nothing for it. Without any lookups, selectors and joins we can render the UI, which is fantastic.

| When                                       | Normalize | Denormalize |
| ------------------------------------------ | --------- | ----------- |
| The same entity appears in multiple places | yes       | no          |
| Data is updated frequently                 | yes       | no          |
| You have relational data                   | yes       | no          |
| Data is mostly read-only                   | no        | yes         |
| Data is page-specific                      | no        | yes         |
| The UI consumes the structure directly     | no        | yes         |
| Simplicity matters more than reuse         | no        | yes         |

One of the best modern practices is mixing them. For example, data can be normalized in the store, then by using selectors denormalized objects can be built for components. It means components will get full data, which is great for the view, but when any update happens it will be updated only in one place.

For example, let's keep the normalized state in a Zustand store. Updating the stock is one small change in one place:

```ts
import { create } from "zustand";

const useErpStore = create<ErpState>()((set) => ({
  products: {},
  customers: {},
  sales: {},

  decreaseStock: (productId: number, quantity: number) =>
    set((state) => ({
      products: {
        ...state.products,
        [productId]: {
          ...state.products[productId],
          stock: state.products[productId].stock - quantity,
        },
      },
    })),
}));
```

The sale page needs the full sale: the customer's name and the product of each line. The store only has ids, so we join them in a selector:

```ts
const sale = useErpStore((state) => {
  const sale = state.sales[42];

  return {
    ...sale,
    customer: state.customers[sale.customer],
    lines: sale.lines.map((line) => ({
      ...line,
      product: state.products[line.product],
    })),
  };
});
```

The component gets the same shape as `/sales/42` returned, so it's easy to render. When `decreaseStock` changes the MacBook in `state.products`, the sale page shows the new stock automatically.

But there is a trap here. This selector returns a new object every time it runs. Zustand compares the result with the previous one by reference, and a new object is never equal to the old one. So React thinks the data always changed. In Zustand v5 it's even worse: the page crashes with `Maximum update depth exceeded`. `useShallow` doesn't help either, because `lines` is a new array every time.

The fix is to select only what already exists in the store, and to build the full sale with `useMemo`:

```ts
import { useMemo } from "react";

const useSale = (saleId: number) => {
  const sale = useErpStore((state) => state.sales[saleId]);
  const customers = useErpStore((state) => state.customers);
  const products = useErpStore((state) => state.products);

  return useMemo(
    () => ({
      ...sale,
      customer: customers[sale.customer],
      lines: sale.lines.map((line) => ({
        ...line,
        product: products[line.product],
      })),
    }),
    [sale, customers, products],
  );
};

// In the component
const sale = useSale(42);
```

Each selector returns an object that lives in the store, so its reference stays the same until it really changes. Now the sale object is rebuilt only when the sale, customers or products change. For any other update in the store, the component gets the same object, and React skips the re-render. This is also what Apollo and Relay do for us under the hood: they keep a normalized cache, and build the denormalized result for each query.

## Modern world practices

Today, most complex applications use a state library, and each of them takes a different side of this topic:

- Apollo and Relay use a **normalized cache**. Redux doesn't normalize by default, but `createEntityAdapter` is an option to do it.
- TanStack Query and SWR use a **query cache**. They store the data as is, per query, without any normalization.

So how do TanStack Query and SWR avoid the MacBook problem without normalization? They don't try to keep one copy of the product. Instead, when the sale is confirmed, they refetch every query that can contain the product. It's called invalidation:

```ts
const queryClient = useQueryClient();

const { mutate } = useMutation({
  mutationFn: createSale,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    queryClient.invalidateQueries({ queryKey: ["low-stock"] });
  },
});
```

It looks simple, but in an ERP the lists are paginated and filtered. `["products"]` matches every cached page and filter: page 1, page 2, the laptops category, the search results, etc. Every sale refetches all of them. When cashiers make hundreds of sales a day, it's a lot of requests just to update one number.

For optimistic updates, we can update each cached query manually. But it means we are back to the same problem: we need to know every place where MacBook lives. And each place has a different shape:

```ts
const decreaseStock = (product: Product) =>
  product.id === 1 ? { ...product, stock: product.stock - 2 } : product;

queryClient.setQueriesData<Page<Product>>({ queryKey: ["products"] }, (page) =>
  page ? { ...page, items: page.items.map(decreaseStock) } : page,
);

queryClient.setQueryData<Sale>(["sales", 42], (sale) =>
  sale
    ? {
        ...sale,
        lines: sale.lines.map((line) => ({
          ...line,
          product: decreaseStock(line.product),
        })),
      }
    : sale,
);

// ...and warehouse stock, low stock widget, product picker in the form
```

Here the main difference is how the data stays consistent. With a normalized cache, we update the product once, and it's updated everywhere. With a query cache, there is no normalization to maintain, but after each update we need to refetch or patch every query that contains the product. We pay with extra requests, or extra code.

How to choose between them?

- If the app mostly reads data and updates are rare (blogs, content sites, streaming catalogs), TanStack Query or SWR is simpler. Refetching after an update is cheap, and the data stays fresh.
- If the same entity appears in many places and changes often (ERPs, CRMs, chats, collaborative tools), a normalized cache saves us from tracking every query by hand.

For an ERP, products, customers and operations are connected to each other, and every operation changes something that is visible on another page. Here normalization is not over-engineering, it's what keeps the numbers right. But the reports stay denormalized, because they are snapshots, and nobody edits them.
