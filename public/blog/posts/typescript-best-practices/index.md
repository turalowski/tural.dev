---
title: "Lesser known TypeScript solutions I learned recently and started to use often"
excerpt: "It's about lesser known TypeScript solutions, which directly help to improve the code and avoid duplication and inconsistency between type definitions"
date: "2026-08-04"
tags:
  - "TypeScript"
  - "Engineering"
  - "Best Practices"
  - "JavaScript"
author: "Tural Hajiyev"
locale: "en"
category: "Engineering"
---

The most recent project I was working on was pretty huge, and the downside was we were not using TypeScript very well. In a few places we had 'any' assertions. We were not using deep TypeScript concepts; generally, we were just creating interfaces for types and objects.

As the project grew, repetition and inconsistency started to hurt us and the project. I read the TypeScript documentation a long time ago, and decided to read it again with a fresh mind, and see what could be applied to the project to simplify things.

## Utility Functions

The first nightmare was duplicate types. In a few places, we were defining types like this:

```typescript
interface Relation {
  id: string;
  name: string;
  surname: string;
}

interface Partner {
  id: Relation["id"];
  name: Relation["name"];
  surname: Relation["surname"];
}
```

At first glance, it looked like we weren't repeating ourselves, and everything seemed fine. But the problem was, we used this logic in more than 100 places, which meant we had to define `name` and `surname` again and again, everywhere.

On top of that, sometimes we'd take the type of `name` from `Partner`, other times from `Relation`.

Our first solution was to extract these types into a shared place like `PublicTypes`. That made things simpler, but didn't solve the fact that we were still defining `name`, `surname`, and other properties over and over.

```typescript
interface Partner {
  id: PublicTypes["id"];
  name: PublicTypes["name"];
  surname: PublicTypes["surname"];
}
```

That's when `Pick` and `Omit` came to the rescue.

Instead of copying properties from one interface to another, we started to use TypeScript's built-in utility types to "pick" just the fields we want:

```typescript
interface Relation {
  id: string;
  name: string;
  surname: string;
}

interface Partner extends Pick<Relation, "name" | "surname"> {
  id: string;
  companyName: string;
}
```

Now, if we ever change the definition of `name` or `surname` in `Relation`, `Partner` will automatically stay in sync. WE don't need to repeat ourselves, and we avoid silent type drift across your codebase.

Conversely, `Omit` helps you reuse all properties _except_ a few:

```typescript
interface ExtendedRelation extends Omit<Relation, "surname"> {
  nickname: string;
}
```

`Pick` and `Omit` helped us dramatically reduce duplicate type definitions, ensured consistency, and made refactoring much safer. If we needed to add or change fields, we'd do it in one place, confident that the rest of the project would instantly benefit.

I remember just applying this change helped us to remove more than 1000 lines in the repository. In addition, later it was pretty easy to define props. Before, we needed to switch between Relation and Partner files, check types, etc. After this logic, we were just entering the names of the props we wanted to use, without any hassle.

## Interfaces with type or variant property

In many places, we had wrapper component/functions and by using a type or variant property, we were rendering different components. At first, one umbrella was used for type and data, and as this component was a "beginner guide", everyone was using the same structure in all components:

```ts
interface Relation {
  name: string;
  surname: string;
  phone: string;
  birthday: Date;
}

interface Partner {
  fullName: string;
  companyName: string;
  companyWebsite: string;
  partnershipSince: Date;
}

interface Person {
  type: "relation" | "partner";
  address: string;
  data: Relation | Partner;
}
```

It was the first solution that came to mind when we were discussing properties, as it lets you add new fields to `Person` without any drama, since `Person` acts as a single wrapper holding both `type` and `data`. If you ever need more shared properties, just add them in `Person`. Feels flexible.

After having property planning and agreeing to use this structure, the nightmare started during development. Every time you want a property like `name`, you've got to drill through `data`: `person.data.name` or `person.data.fullName`. That's simple in a snippet, but in a living, messy codebase, it quickly becomes awkward and hard to follow.

And the biggest problem was TypeScript can't neatly discriminate between `Relation` and `Partner` just by looking at `Person.type`, because that flag's up top while the real variant sits inside `data`. Type narrowing gets terrible. To check if a `person` is a `Relation`, you end up with code like:

```ts
if (person.type === "relation" && "name" in person.data) {
}
```

Elsewhere, you'll see someone checking `"companyName"` for the partner case:

```ts
if (person.type === "partner" && "companyName" in person.data) {
}
```

Yes, it works. But soon every developer starts “checking types” in slightly different ways, and the inconsistency spikes. The more unique properties you probe for (like `"fullName" in person.data"`), the more fragile and less clear the code becomes.

As the repo grew, we started seeing this pattern in a dozen places (honestly, more than 10 components used the data-wrapping hack). At some point, it became obvious: this wasn't scalable, and things needed to change.

We solved this by using discriminated unions in TypeScript, putting the type property directly into each variant instead of separating type and data.

```ts
interface Common {
  address: string;
}

interface Relation extends Common {
  type: "relation";
  name: string;
  surname: string;
  phone: string;
  birthday: Date;
}

interface Partner extends Common {
  type: "partner";
  fullName: string;
  companyName: string;
  companyWebsite: string;
  partnershipSince: Date;
}

type Person = Relation | Partner;
```

Instead of wrapping with a `data` object, the discriminant (`type`) and relevant fields sit directly on each type—forming a proper discriminated union. Now TypeScript can narrow by just checking `person.type`, and you can access properties directly on `person` without an awkward `.data`. Fewer bugs, less duplication, much clearer intent.

Now, discriminating between types is as simple as:

```ts
function printPerson(person: Person) {
  if (person.type === "relation") {
    // person: Relation
  } else {
    // person: Partner
  }
}
```

The `Common` interface handles any genuinely shared props, so you still avoid copy-pasting addresses everywhere.

## Deprecating old function

It's pretty common to have a function that was created a long time ago, and after requirements shift, you need to update its logic, arguments, or return type.

For example, at one of my previous workplace, we agreed functions should have no more than two arguments. If you have three or more, you should use an options object instead. Making this change was not easy for several reasons:

1. Some functions had been exported and used in multiple places. Changing their signatures would easily break consumers' applications, which we wanted to avoid. We needed to communicate with consumers and coordinate changes during the same sprint.

2. There was also the question of _how_ to do it. By default, we'd create a new function, but naming was always a struggle. Sometimes we'd append "New" to the name, or try to invent something better.

Even then, the solution felt clunky. We had to override the JSDoc comment to mark the old function as deprecated, hardcode the new function’s name, and explicitly tell users to stop using the original one.

That's when I discovered function overloads. Instead of creating a new function and a new name (and potentially breaking users’ apps), we can start using function overloads to support different input/output types in a single function.

I couldn't use it in practice as I was pretty close to leaving the company, but this concept is something I will keep in mind and use in the future for sure.

Imagine you have an `addRelation()` function, which originally accepted 3 arguments, and you now want to migrate it to accept a single options object instead. Previously, you might have done something like this:

```ts
/** @deprecated Use addRelationNew instead. */
function addRelation(
  companyId: string,
  relationType: "customer" | "vendor" | "partner",
  createdAt: Date,
): void {}

function addRelationNew(options: {
  companyId: string;
  relationType: "customer" | "vendor" | "partner";
  createdAt: Date;
}): void {}
```

But with function overloads, it's possible to support both signatures in the same function, provide a migration path, and keep IntelliSense accurate for both old and new usage.

```ts
type AddRelationOptions = {
  companyId: string;
  relationType: "customer" | "vendor" | "partner";
  createdAt: Date;
};

/**
 * @deprecated Use the options object instead.
 *
 * @param companyId - The ID of the company to relate.
 * @param relationType - The type of relation ("customer" | "vendor" | "partner").
 * @param createdAt - The date the relation was created.
 */
function addRelation(
  companyId: string,
  relationType: "customer" | "vendor" | "partner",
  createdAt: Date,
): void;
/**
 * Adds a relation using an options object.
 *
 * @param options - An object containing the companyId, relationType, and createdAt date.
 */
function addRelation(options: AddRelationOptions): void;

function addRelation(arg1: string | AddRelationOptions, ...rest: any[]): void {
  const opts: AddRelationOptions =
    typeof arg1 === "object"
      ? arg1
      : {
          companyId: arg1,
          relationType: rest[0],
          createdAt: rest[1],
        };
}

addRelation("c42", "customer", new Date()); // old
addRelation({
  companyId: "c42",
  relationType: "vendor",
  createdAt: new Date(),
}); // new
addRleations();
```

That's how it will look with IntelliSense. By clicking the arrow keys, it's possible to use different argument/return types.

![IntelliSense example](/blog/posts/typescript-best-practices/intellisense.png)

Function overloads are a really cool feature, and I recommend everyone check them out. With overloads, you can use the same function name for different parameter and return type combinations. This leads to more expressive APIs, especially when the relationship between the argument type and return type is important.

For example, it's the traditional function with union type argument and return type:

```ts
function stringifyOrNumber(value: string | number): string | number {
  if (typeof value === "string") {
    return value.toUpperCase();
  } else {
    return value + 1;
  }
}

const a = stringifyOrNumber("hello"); // type: string | number, value: "HELLO"
const b = stringifyOrNumber(41); // type: string | number, value: 42
```

Notice that the return type is always `string | number`, no matter which argument we pass. If you want a more precise relationship, function overloads can be used:

```ts
function advanced(value: string): string;
function advanced(value: number): number;
function advanced(value: string | number): string | number {
  if (typeof value === "string") {
    return value.toUpperCase();
  } else {
    return value + 1;
  }
}

const c = advanced("test"); // type: string, value: "TEST"
const d = advanced(100); // type: number, value: 101
```

Now, TypeScript "remembers" the relation between the parameter and return type for each overload! This is especially valuable for APIs where argument and return types are tightly coupled.
