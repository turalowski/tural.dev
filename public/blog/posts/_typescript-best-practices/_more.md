## Using Construct Signatures for Class-like Operations

Passing class as argument doesn't work the same always. For example, let's say we have following classes

```ts
class BuyOperation {
  constructor(
    public amount: number,
    public asset: string,
  ) {}
}

class SaleOperation {
  constructor(
    public amount: number,
    public asset: string,
  ) {}
}
```

Now suppose you want a function that takes a constructor for a trade operation and uses it to instantiate new operations:

```ts
function createOperation(
  OpClass: BuyOperation | SaleOperation,
  amount: number,
  asset: string,
) {
  return new OpClass(amount, asset);
}
```

Typescript is not happy, and it will return following error message "No constituent of type 'BuyOperation | SaleOperation' is constructable"

```ts
function createOperation(
  OpClass: typeof BuyOperation | typeof SaleOperation,
  amount: number,
  asset: string,
) {
  return new OpClass(amount, asset);
}
```

But this doesn’t scale well or provide generics if you later add more operation types.

**Here's the better way: use a _construct signature_.**

A construct signature describes something you can `new`, and can be generic:

```ts
type OperationCtor<T> = new (amount: number, asset: string) => T;

function createOperation<T>(
  OpClass: OperationCtor<T>,
  amount: number,
  asset: string,
): T {
  return new OpClass(amount, asset);
}
```

Now, TypeScript checks arguments and return types:

```ts
const buy = createOperation(BuyOperation, 1000, "EUR");
const sale = createOperation(SaleOperation, 500, "USD");

// TypeScript knows `buy` is BuyOperation and `sale` is SaleOperation
buy.amount; // ok
sale.asset; // ok
```
