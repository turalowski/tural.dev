---
title: "Fancy TypeScript Things I Use Every Day (But Didn't Know Their Names)"
excerpt: "Personal notes on TypeScript features and patterns I use regularly, but never knew the official terminology for."
date: "2025-10-05"
tags:
  - "TypeScript"
  - "Type System"
  - "Personal Notes"
  - "Everyday TS"
author: "Tural Hajiyev"
locale: "en"
category: "Dev notes"
---

## Static vs dynamic typing

JavaScript is dynamically typed, TypeScript is statically typed. Day to day, it means, in JavaScript, a variable's type is a runtime fact. The engine doesn't know or care what `user` is until the code actually runs and it looks at the value sitting in memory.

```js
var user = { name: "Tural" };
user = 42; // Even if there is a police, it's totally legal
```

TypeScript moves that check earlier, to the moment you write the code, not the moment the engine runs it. The compiler builds a model of what every variable should be, and if you try to violate that model, it complains before your code ever executes.

```typescript
var user = { name: "Dana" };
user = 42; // Type 'number' is not assignable to type '{name: string}'
```

These types do not exist at runtime. They are erased during compilation, as we generate `.js` code from `.ts` code to run the app. The browser or Node environment has never seen a `type` or an `interface` in its life. It can't save us from a bad API response or a null value that we defined as `number`, because TypeScript is reasoning about the code without running it.

## Type narrowing

Narrowing is TypeScript watching your control flow and shrinking a type based on what you have already checked. It's the reason this doesn't work:

```typescript
function printLength(value: string | number) {
  console.log(value.toFixed(2));
}
```

and this works:

```ts
function printLength(value: string | number) {
  if (typeof value === "string") {
    console.log(value.length); // TS knows it's a string here
  } else {
    console.log(value.toFixed(2)); // and a number here
  }
}
```

In the `if` block, we don't need to say TypeScript value is a string. It figured that out on its own from the `typeof` check. **That's narrowing**. It works with `typeof`, `instanceof`, `in`, truthiness checks, equality checks against literals.

Narrowing lets TypeScript discriminate between variants of a union:

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2; // radius exists, guaranteed
  }
  return shape.side ** 2; // side exists here instead
}
```

That `kind` field is doing all the work. Because each variant has its own literal type for `kind`, checking it lets TypeScript figure out exactly which shape of object you are holding at each branch. In the TypeScript world, it is also known as a **tagged union**.

## Control flow analysis

TypeScript doesn't just look at each line in isolation, it keeps track of how your code flows, updating what it knows about each variable along the way. This is called **control flow analysis**.

Because of that, TypeScript can spot when certain conditions are no longer possible, which lets you write safer, more expressive code. For example:

```ts
function getUser(id: string | null) {
  if (!id) {
    return null;
  }
  // TypeScript knows id can't be null here
  return fetchUser(id);
}
```

Here, since we return early when `id` is null, TypeScript understands that by the time we reach `fetchUser(id)`, `id` must be a string, not null.

But control flow analysis really shines when dealing with union types and exhaustive checks. If you forget to handle all possible cases in a `switch`, TypeScript can catch it at compile time:

```ts
type Status = "loading" | "success" | "error";

function getMessage(status: Status) {
  switch (status) {
    case "loading":
      return "Loading...";
    case "success":
      return "It worked!";
    // What if we forget "error"?
    default:
      // TypeScript can flag this as an unhandled case.
      // To make this safer:
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
  }
}
```

If you later add another variant (like `"idle"`) to `Status`, TypeScript will warn you anywhere the type needs to be updated.

## Contextual typing

This is something all of us using every day, just don't know its name. Contextual typing is when TypeScript infers a type for something based on where it's being used, rather than from the expression itself.

```ts
window.addEventListener("click", (event) => {
  console.log(event.button); // event is inferred as MouseEvent, not `any`
});
```

In this example, we never define type for `event`. TypeScript looked at the signature of `addEventListener`, saw that `click` event maps to a `MouseEvent` handler, and typed the callback's parameter accordingly. Same story with array methods:

```ts
const prices = [10, 25, 40];
const doubled = prices.map((price) => price * 2); // price: number, inferred
```

`price` is contextually typed as number, because TypeScript knows that `prices` is `number[]` and`map`'s callback parameter matches the array's element type.
