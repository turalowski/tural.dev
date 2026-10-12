---
title: "Various topics to prepare for the interview"
excerpt: "Old date on purpose, to keep it at the end"
date: "1999-09-19"
tags:
  - "Browser"
  - "JavaScript"
  - "React"
  - "TypeScript"
author: "Tural Hajiyev"
locale: "en"
category: "Dev notes"
---

## Types & Values

### Data types

JavaScript has 7 primitives: `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, `null`. Everything else is an `object` (arrays, functions, dates, maps...).

- Primitives are immutable. `"abc".toUpperCase()` returns a new string; it never changes the original.
- Primitives still have methods because JS temporarily wraps them in an object (autoboxing): `"abc".length`.

> `typeof null === "object"` is a historic bug.

> `typeof function(){} === "function"`

> Use `Array.isArray()` for arrays.

### undefined vs null

**undefined** means a value hasn't been assigned. The language produces it automatically: a declared variable with no value, a missing object property, a function parameter that wasn't passed, or a function that doesn't return anything.

**null** means "intentionally empty." The language never sets it on its own; a programmer assigns it on purpose to say "there's deliberately nothing here," like clearing a reference or marking a missing result.

### Type conversion vs coercion

Both mean changing a value from one type to another. The difference is who does it:

- **Type conversion (explicit type casting)** is when you deliberately change the type.
- **Type coercion (implicit type casting)** is when JavaScript changes it automatically behind the scenes, usually because an operator needs a certain type.

```js
// conversion (explicit)
Number("42");   // 42
String(1);      // "1"
Boolean("");    // false

// coercion (implicit)
"5" + 1;        // "51"  (+ prefers strings)
"5" - 1;        // 4     (- only works with numbers)
if ("hello") {} // string → true
```

Falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy, including `[]`, `{}` and `"0"`.

### == vs === vs Object.is

```js
// == coerces, === doesn't
1 == "1";            // true   ("1" → 1)
1 === "1";           // false
0 == false;          // true   (false → 0)
"" == 0;             // true   ("" → 0)
"0" == false;        // true   (both → 0)
"" == "0";           // false  (both strings, no coercion; no transitivity!)
null == undefined;   // true
null == 0;           // false  (null only loosely equals undefined)
[1] == 1;            // true   ([1] → "1" → 1)

// === vs Object.is
NaN === NaN;             // false
Object.is(NaN, NaN);     // true
+0 === -0;               // true
Object.is(+0, -0);       // false

// All three compare objects by reference
({}) === ({});           // false
Object.is({}, {});       // false
const o = {};
o === o;                 // true
```

### Value vs Reference

Primitives are copied by value, and objects and arrays are copied by reference.

```js
const a = { n: 1 };
const b = a;      // same object, two references
b.n = 2;
a.n;              // 2
```

Spread (`{...obj}`) and `Object.assign` make shallow copies, so nested objects are still shared. For a deep copy use `structuredClone()` (not `JSON.parse(JSON.stringify(...))`, which drops dates, `undefined`, and Maps). `Object.freeze` is shallow too. Immutable update patterns are what make React state and memoization work: React compares references, not contents.

## Variables & Scope

### Variable naming rules

```js
let userName;   // ok
let _count;     // ok
let $price;     // ok
let item2;      // ok
let 2item;      // SyntaxError
let user-name;  // SyntaxError (hyphen means minus)
let user name;  // SyntaxError (no spaces)
```

Some of the reserved words: `let`, `const`, `class`, `return`, `if`, `function`, `new`, `this`, `typeof` and so on.

Default naming conventions:

```js
let firstName = "Ada";          // camelCase for variables and functions
function getUser() {}

class UserAccount {}            // PascalCase for classes

const MAX_RETRIES = 3;          // UPPER_SNAKE_CASE for fixed config values

let isLoggedIn = true;          // booleans read like yes/no questions
let hasAccess = false;
```

### var vs let vs const

- `var` is function-scoped, while `let` and `const` are block-scoped (limited to the nearest `{}`).
- `var` allows redeclaring the same name in the same scope (a common source of bugs). `let` and `const` throw a SyntaxError.
- `const` can't be reassigned, but the object it points to can still be mutated.
- All three are hoisted, but differently. `var` is initialized as `undefined`, so you can access it before the declaration without an error. `let` and `const` sit in a "temporal dead zone" until the declaration line runs, so early access throws.
- `var` at the top level creates a property on `window`; `let`/`const` don't.

Explain this code:

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));
// 3, 3, 3  — one shared i

for (let i = 0; i < 3; i++) setTimeout(() => console.log(i));
// 0, 1, 2  — new i per iteration
```

> A function reads a variable when it runs, not when it's created. setTimeout means "run this function later." Even with no delay, JavaScript first finishes all the code it's currently running, and only then runs the scheduled functions. As "var" is function scoped, there is only one "i" variable. When the loop is done and the scheduled functions run, "i" is 3 everywhere. `let` creates a fresh binding for every iteration, so each callback closes over its own `i`.

We can see the same behaviour without timers:

```js
const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => console.log(i));
}
fns.forEach(fn => fn()); // 3, 3, 3

const fns2 = [];
for (let i = 0; i < 3; i++) {
  fns2.push(() => console.log(i));
}
fns2.forEach(fn => fn()); // 0, 1, 2
```

### Hoisting

Hoisting is the behavior where JavaScript sets up all declarations in a scope before running any code in that scope. It's often described as declarations being "moved to the top," but nothing actually moves. The engine runs in two passes: first it scans the scope and registers every declared name, then it executes the code line by line. Hoisting is the effect of that first pass.

- `var`: hoisted and initialized to `undefined`
- `let` and `const`: hoisted but uninitialized (temporal dead zone)
- Function declarations: fully hoisted (you can call them before the line they're defined on)
- Function expressions and arrow functions: follow the variable's rules
- Classes: behave like `let`

What will be the output of this code:

```js
console.log(typeof foo); // "function"
var foo = 1;
function foo() {}
console.log(typeof foo); // "number"
```

If a function declaration and a `var` share a name, the function wins during hoisting, and a later `var` assignment overwrites it at runtime.

### Variable scopes

- Global scope: declared outside any function or block
- Function scope: declared inside a function
- Block scope: a block is anything inside `{}`. Works only for `let` and `const`.
- Module scope: top-level variables in an ES module are private to that file unless exported

### The scope chain

When you use a variable, JavaScript looks for it in the current scope first, then the one around it, then the next, all the way out to global. It searches outward, never inward. The chain is decided by **where the code is written**, not where it's called from. This is called **lexical scope**:

```js
let a = "global";

function outer() {
  let b = "outer";

  function inner() {
    let c = "inner";
    console.log(a, b, c); // all visible: searches outward
  }

  inner();
  console.log(c); // ReferenceError: can't look inward
}
```

### Shadowing

An inner variable with the same name as an outer one hides the outer one inside its scope. They are two independent variables; changing the inner one doesn't touch the outer one.

```js
let name = "outer";
{
  let name = "inner";
  console.log(name); // "inner"
}
console.log(name);   // "outer"
```

### Lexical Environment vs Execution Context vs Variable Environment

**Lexical Environment**: the data structure containing an Environment Record (local variables) and a reference to the outer/parent lexical environment. That outer reference is what forms the scope chain. Blocks, functions, `catch` clauses and modules each get one; it's where `let`, `const` and `class` live.

**Variable Environment**: a lexical environment at the function level used to store `var` declarations and function declarations (the ones with hoisting behavior).

**Execution Context**: the broader container (managed on the Call Stack) that holds the currently running code, its evaluation state, the `this` binding, and references to its Lexical and Variable Environments. A new one is created for the global code and for every function call.

## Functions

### First-class functions

In JS, functions are first-class citizens: they are values like any other.

```js
const greet = function () { return "hi"; };  // assigned to a variable
const list = [greet, () => "bye"];           // stored in an array
const obj = { sayHi: greet };                // stored as a property

[1, 2, 3].map(n => n * 2);                   // passed as an argument

function makeAdder(a) {
  return b => a + b;                         // returned from a function
}
const add5 = makeAdder(5);                   // created at runtime
add5(3); // 8
```

Because functions are values, you can pass and return them. Currying turns `f(a, b)` into `f(a)(b)`. Partial application pre-fills some arguments. Composition chains functions (`pipe(trim, lower, slugify)`). These patterns give you reusable, testable logic, and they're the idea behind middleware, HOCs, and utilities like debounce and once.

### Function declaration vs Function expression vs Arrow function

A function declaration is a statement that starts with the `function` keyword. A function expression creates a function as part of an expression, usually assigned to a variable.

```js
// Declaration — fully hoisted
function add(a, b) { return a + b; }

// Expression — follows the variable's hoisting rules
const add2 = function (a, b) { return a + b; };

// Arrow functions are always expressions
const add3 = (a, b) => a + b;
```

Arrow functions are not just shorter syntax:

- No own `this`. They take `this` from the surrounding scope, and `call`/`apply`/`bind` can't change it.
- No own `arguments` (use rest params `...args`).
- Can't be used with `new` and have no `prototype`.

Rule of thumb: arrows for callbacks (they keep the outer `this`), regular functions or methods for object methods that need their own `this`.

### IIFE

An IIFE (Immediately Invoked Function Expression) is a function that's defined and run in the same step:

```js
(function () {
  console.log("runs immediately");
})();
```

Before modules and `let`, it was the way to create a private scope and avoid polluting globals. Today modules and blocks cover that, but you still see an async IIFE to use `await` where top-level await isn't available: `(async () => { await init(); })();`

### Closure

A closure is a function bundled together with references to its surrounding state (the lexical environment). In other words, a function remembers the variables from where it was created, even after the outer function has returned. Closures are created every time a function is created.

```js
function createCounter() {
  let count = 0;                 // private, only reachable through the closure
  return {
    inc: () => ++count,
    get: () => count,
  };
}

const c = createCounter();
c.inc(); c.inc();
c.get(); // 2
```

### this keyword

`this` belongs to the **execution context**, not the lexical environment. But the execution context *uses* the lexical environment to resolve variables. So:

- **Lexical Environment = scope + variables**
- **Execution Context = runtime frame +** `this` **+ pointers to LEs**
- `this` **= a runtime binding stored inside the execution context**

`this` tells the function who called it. It's not part of scope and not determined by where the function is written. It is determined **only** by *how the function is called at runtime* (arrow functions are the exception, see below).

- **Default binding** (plain function call): when a function is called with no context object, `this` is `undefined` in strict mode, or the global object (`window`) in non-strict mode. Modules and classes are strict by default, so in modern code it's usually `undefined`.
- **Implicit binding** (called as a method): with `obj.method()`, `this` is whichever object is immediately to the left of the dot at the call site, not necessarily where the function was originally defined.
- **Explicit binding** (`call`, `apply`, `bind`): you manually force what `this` should be.
- **new binding** (constructor calls): `new` creates a brand new empty object, sets `this` to it, links its prototype, and returns it automatically (unless the function explicitly returns another object).
- **Arrow functions**: no own `this`; they use the `this` of the scope they were written in.

Precedence: `new` > explicit > implicit > default.

```js
const user = {
  name: "Ana",
  hi() { return this.name; },
};

user.hi();                 // "Ana" (implicit)
const hi = user.hi;
hi();                      // TypeError in strict mode: this is undefined (binding lost)
hi.call({ name: "Bo" });   // "Bo" (explicit)
setTimeout(user.hi);       // binding lost again — classic bug, fix with user.hi.bind(user)
```

### call vs apply vs bind

All three set `this` explicitly.

- `fn.call(obj, a, b)` invokes immediately, with arguments listed out.
- `fn.apply(obj, [a, b])` invokes immediately, with arguments as an array (mostly replaced by spread).
- `fn.bind(obj, a)` returns a **new function** with `this` (and optionally leading args) permanently fixed, which also makes it useful for partial application.

A bound function's `this` can't be overridden by a later `call` or `bind`, though `new` can override it. Common uses are method borrowing (`Array.prototype.slice.call(arguments)`) and fixing `this` in callbacks.

### Debounce vs Throttle

Both limit how often a function runs. A classic "write it from scratch" question.

- **Debounce**: wait until the calls *stop* for `ms`, then run once. Search input, autosave, resize end.
- **Throttle**: run at most once every `ms`, no matter how many calls. Scroll, mousemove, drag.

```js
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    }
  };
}
```

## Objects & OOP

### Prototypes, prototype chain and prototypal inheritance

In JavaScript, every object has a hidden link to another object called its prototype. When you access a property that the object doesn't have, JavaScript follows that link and looks on the prototype, then the prototype's prototype, and so on until it finds the property or reaches `null`. This sequence of links is the prototype chain, and sharing behavior through it is prototypal inheritance.

How to create an object from another object?

```js
const animal = {
  eats: true,
  describe() { return `I eat: ${this.eats}`; }
};

const rabbit = Object.create(animal); // rabbit's prototype is animal
rabbit.describe(); // "I eat: true" — found on animal via the chain
```

Before ES6:

```js
function Person(name) {
  this.name = name;               // own property per instance
}
Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;  // shared by all instances
};

const ana = new Person("Ana");
ana.greet();                                     // "Hi, I'm Ana"
Object.getPrototypeOf(ana) === Person.prototype; // true
```

After ES6:

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}

class Dog extends Animal {
  speak() { return `${super.speak()}, specifically a woof`; }
}

const d = new Dog("Rex");
d.speak(); // "Rex makes a sound, specifically a woof"

// Under the hood:
Object.getPrototypeOf(d) === Dog.prototype;                 // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype;  // true
```

`__proto__` exists on (effectively) every object and points to that object's actual prototype, the next link in its chain. It's a getter/setter inherited from `Object.prototype`, and it's the legacy way of doing what `Object.getPrototypeOf(obj)` and `Object.setPrototypeOf(obj, p)` do today.

`prototype` is a regular property that exists **only** on functions that can be used as constructors (normal functions and classes, not arrow functions or methods). It is not the function's own prototype. It's the object that will be assigned as the `__proto__` of instances created with `new`.

```js
function Person(name) { this.name = name; }
const ana = new Person("Ana");

ana.__proto__ === Person.prototype;              // true  ← the key link
Person.__proto__ === Function.prototype;         // true  (Person is itself a function object)
Person.prototype.__proto__ === Object.prototype; // true

ana.prototype;                                   // undefined (ana isn't a function)
Person.prototype.constructor === Person;         // true  (back-reference)
```

### Classes

`class` is syntax over prototypes, but a few details matter:

- **Private fields** (`#x`) are truly private, enforced by the engine, not by convention. `#x in obj` is a brand check.
- **Class fields** (`count = 0`, or `handle = () => {}`) are created per instance as own properties. **Methods** live once on the prototype. An arrow-function field fixes `this` but costs one function per instance.
- `static` members and `static {}` blocks belong to the class itself.
- `super` calls the parent. In a derived constructor you must call `super()` before touching `this`.
- `new.target` tells you whether the function was called with `new`, or which class was actually instantiated (useful for abstract classes).

```js
class Counter {
  #n = 0;
  static create() { return new Counter(); }
  get value() { return this.#n; }
  inc() { this.#n++; }
}
```

### Composition vs Inheritance

- **Inheritance** models "is-a": `Dog extends Animal`. Simple for shallow, stable hierarchies, but deep trees get brittle. A change in the base class ripples into every child (fragile base class), and you inherit everything even if you need one method ("you wanted a banana but got the gorilla holding the banana").
- **Composition** models "has-a" / "can-do": build objects from small, independent pieces and combine only what you need.

```js
const canFly  = (state) => ({ fly:  () => `${state.name} flies` });
const canSwim = (state) => ({ swim: () => `${state.name} swims` });

function createDuck(name) {
  const state = { name };
  return { ...canFly(state), ...canSwim(state) };
}

createDuck("Donald").swim(); // "Donald swims"
```

"Favor composition over inheritance" is the default answer. React is built on it: components compose via `children` and props, and logic is shared through custom hooks, not class hierarchies. Inheritance is still fine for small, stable cases, like custom `Error` classes.

### Proxy & Reflect

A Proxy wraps an object and intercepts operations (`get`, `set`, `has`, `deleteProperty`...) through traps. Reflect mirrors those operations as functions so you can forward them to the original behavior correctly.

```js
const user = new Proxy({ age: 30 }, {
  set(target, key, value, receiver) {
    if (key === "age" && typeof value !== "number") {
      throw new TypeError("age must be a number");
    }
    return Reflect.set(target, key, value, receiver); // do the default thing
  },
});

user.age = 31;    // ok
user.age = "old"; // TypeError
```

Why `Reflect` instead of `target[key] = value`: it returns `true`/`false` like the trap expects, and passing `receiver` keeps `this` correct for getters/setters and inherited properties.

Real uses: reactive systems (Vue 3's reactivity, MobX), validation, Immer's "mutate a draft, get an immutable result", logging/mocking. The cost is some performance overhead and behavior that is harder to debug, so use it deliberately.

## Modules

### ES Modules vs CommonJS

- **ESM** (`import`/`export`) is static, so bundlers can **tree-shake** it. It has **live bindings** (imports reflect later changes in the exporter), supports top-level `await` and dynamic `import()` (code splitting), is loaded asynchronously, and is strict by default.
- **CommonJS** (`require`/`module.exports`) is dynamic and synchronous, so it can't be reliably tree-shaken. When you destructure from `require`, you get the values as they were at that moment, not live bindings.

ESM is the standard for browsers and modern Node. CommonJS mostly lives in older Node code and packages.

## Asynchronous JavaScript

### Synchronous vs Asynchronous

Synchronous code runs top-to-bottom and blocks the thread until each line finishes. Asynchronous code starts work now and handles the result later, without blocking.

The JS language itself is single-threaded and synchronous. Async behavior comes from the environment (browser or Node): timers, network and I/O run outside the JS thread, and their callbacks are queued and executed later by the **event loop**. So a long synchronous task blocks everything, including clicks and rendering.

### Event Loop & Task Queues

The event loop's job is to check the call stack continuously. When the call stack is empty, it takes the next task from a queue and pushes it onto the stack.

There are two kinds of queues:

1. **Macrotask (task) queue**: `setTimeout`, `setInterval`, I/O, user events (click, input), `MessageChannel`. Node also has `setImmediate`.
2. **Microtask queue**: promise callbacks (`then`, `catch`, `finally`), code after `await`, `queueMicrotask()`, `MutationObserver`.

One loop iteration:

1. Run **one** macrotask (the initial script is the first one).
2. Run **all** microtasks, including ones added while draining.
3. The browser **may render** (`requestAnimationFrame` callbacks → style → layout → paint).
4. Repeat.

> Microtasks always beat macrotasks. That's also a trap: a microtask that keeps scheduling microtasks starves the loop and freezes the page, because rendering never gets a turn.

What's the output?

```js
console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
queueMicrotask(() => console.log(4));
console.log(5);
// 1, 5, 3, 4, 2
```

```js
async function f() {
  console.log("a");
  await null;          // everything below becomes a microtask
  console.log("b");
}
console.log("start");
f();
console.log("end");
// start, a, end, b
```

The body of an async function runs synchronously until the first `await`.

### Promises and async/await

A promise is a state machine (pending → fulfilled/rejected) that settles **once**. `then` returns a new promise, which is what makes chaining work. `async/await` is syntax sugar over promises: an `async` function always returns a promise, and `await` pauses that function (not the thread) until the promise settles.

```js
// promise chain
fetchUser(id)
  .then(user => fetchPosts(user.id))
  .then(posts => render(posts))
  .catch(handleError)
  .finally(hideSpinner);

// same thing with async/await
async function load(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    render(posts);
  } catch (err) {
    handleError(err);
  } finally {
    hideSpinner();
  }
}
```

Combinators:

- `Promise.all`: waits for all, fails fast on the first rejection.
- `Promise.allSettled`: waits for all, never rejects; gives you `{ status, value | reason }` for each.
- `Promise.race`: first to settle (fulfilled or rejected) wins.
- `Promise.any`: first *fulfilled* wins (rejects with `AggregateError` if all fail).

Common mistakes:
- Sequential `await`s in a loop when the work is independent and could run in parallel.
- `array.forEach(async ...)` doesn't wait for anything. Use `for...of` (sequential) or `Promise.all(array.map(...))` (parallel).
- Forgetting `try/catch` or `.catch()`, which leads to unhandled rejections.
- Forgetting `return` inside `.then`, which breaks the chain.

### Parallel, Sequence, and Race

```js
// Sequence: one after another. Use when each step depends on the previous one.
const results = [];
for (const id of ids) {
  results.push(await fetchUser(id));     // total time = sum of all requests
}

// Parallel: start all at once, wait for all.
const users = await Promise.all(ids.map(fetchUser)); // total time = slowest request

// Race: e.g. a timeout
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
  ]);
```

Senior details:
- Firing 1000 requests with `Promise.all` can overload the server or hit browser connection limits. Use **limited concurrency** (process in batches, or a pool such as `p-limit`).
- `race` doesn't cancel the loser; it keeps running. To actually cancel a `fetch`, use `AbortController` (`fetch(url, { signal })`, or `AbortSignal.timeout(ms)`).

### Concurrency vs Parallelism & Threads

- **Concurrency**: dealing with many tasks at once by switching between them. One cook preparing three dishes, moving between them while each one simmers.
- **Parallelism**: doing many tasks at literally the same time. Three cooks, three dishes.
- **Thread**: an independent line of execution with its own call stack. Threads in the same process share memory.

JavaScript on the main thread is **concurrent but not parallel**: one call stack, and the event loop interleaves tasks. The browser itself is multi-threaded (network, parsing, compositor, raster threads), and Node runs fs/crypto/DNS work on a libuv thread pool. That's why waiting for I/O doesn't block JS.

### Single-threaded vs Multi-threaded

| | Single-threaded (JS main thread) | Multi-threaded |
|---|---|---|
| Shared state | No data races, no locks needed | Needs locks/atomics, risk of race conditions and deadlocks |
| Simplicity | Easy to reason about | Harder to write and debug |
| CPU-heavy work | Blocks everything, the UI freezes | Can use multiple cores |

To get real parallelism in JS:
- **Web Workers** (browser) / **worker_threads** (Node): separate threads with their own event loop and no DOM access. They talk via `postMessage`, which copies data (structured clone), or transfers ownership of an `ArrayBuffer` for zero-copy.
- `SharedArrayBuffer` + `Atomics` give truly shared memory (the page has to be cross-origin isolated).

If the main thread is busy for more than 50ms, that's a **long task** and it hurts INP. Fixes: move work to a worker, split it into chunks and yield between them (`await scheduler.yield()` or `setTimeout`), or do less work.

## Engine & Memory

### How the JS Engine Works

1. Parse the source into an AST
2. Compile it to bytecode
3. Run it in an interpreter
4. Hot code is recompiled by a JIT compiler into optimized machine code. (The optimizer makes assumptions, like "this object always has the same shape".)
5. When an assumption breaks, the code is deoptimized back to slower bytecode.

**Tokens (lexical analysis)**: the lexer reads characters and groups them into meaningful chunks. It has no idea what they mean together. The acorn library can be used to see the tokenization output for code. For `const total = 2 + 3 * 4;`:

```
Keyword      const
Identifier   total
Punctuator   =
Numeric      2
Punctuator   +
Numeric      3
Punctuator   *
Numeric      4
Punctuator   ;
```

**AST (syntax analysis)**: the parser takes those tokens and applies the grammar rules. Here is the same code as a tree, trimmed of position info. Notice how `3 * 4` sits deeper than `+`; operator precedence is encoded in the tree's shape:

```json
{
  "type": "Program",
  "body": [{
    "type": "VariableDeclaration",
    "kind": "const",
    "declarations": [{
      "type": "VariableDeclarator",
      "id": { "type": "Identifier", "name": "total" },
      "init": {
        "type": "BinaryExpression",
        "operator": "+",
        "left":  { "type": "Literal", "value": 2 },
        "right": {
          "type": "BinaryExpression",
          "operator": "*",
          "left":  { "type": "Literal", "value": 3 },
          "right": { "type": "Literal", "value": 4 }
        }
      }
    }]
  }]
}
```

**Ignition**: V8's interpreter. It takes the AST, produces compact bytecode, and runs it right away, without waiting for machine-code compilation. That's why JS starts fast. Bytecode is much smaller than machine code and cheap to generate, which is the trade-off: fast startup, slower steady-state speed.

**TurboFan**: V8's optimizing compiler. It turns hot functions into fast machine code using the type feedback Ignition collected. (Modern V8 also has middle tiers, Sparkplug and Maglev, between the two.)

```
Ignition runs bytecode ──► records types in feedback slots
        ▲                              │
        │                              ▼
   deopt (guard fails)  ◄──  TurboFan compiles machine code using those types
```

### Optimization techniques

**Hidden Classes** (called "Maps" or "shapes" inside V8): when you create an object, V8 assigns it a hidden class, an internal description of its structure.

```js
const user = { name: "Tural", age: 30 };

// HiddenClass:
//   name → offset 0
//   age  → offset 1
```

- V8 can access properties by fixed offsets instead of slow dictionary lookups.
- Objects that get the same properties in the same order share a hidden class. Adding properties in a different order, adding them later, or using `delete` creates new hidden classes and makes code slower.
- In practice: initialize all properties in the constructor, always in the same order.

**Inline Caches**: when a property access runs repeatedly, V8 remembers where that property lives for the shapes it has seen.

```js
function greet(u) {
  return u.name;
}
```

1. The first call looks up `name` on the object → slow.
2. V8 caches "for this hidden class, `name` is at offset 0". The next calls with the same shape skip the lookup.

> Monomorphic = same object shape every time → fast path.
> 
> Polymorphic = a few shapes → slower.
> 
> Megamorphic = too many shapes → the cache gives up and falls back to slow generic lookups.

### Memory: Stack, Heap and Garbage Collection

- The **stack** holds call frames: local variables, primitives, and references (pointers). It's fast, and frames are freed automatically when a function returns.
- The **heap** holds objects, arrays, closures, and strings. Their lifetime isn't tied to a function call, so something has to figure out when they're dead. That something is the garbage collector.

**Common memory leaks** (a memory leak = memory that is still reachable but no longer needed):
- Event listeners that are never removed (especially on `window`/`document`)
- `setInterval` that is never cleared
- Closures holding big objects longer than needed
- Detached DOM nodes still referenced from JS
- Unbounded caches/Maps and accidental globals

## TypeScript

### type vs interface

A type alias can name *any* type, not just object shapes: unions, intersections, primitives, tuples, mapped types, and conditional types:

```other
type ID = string | number;
type Pair = [string, number];
type Status = "idle" | "loading" | "error";
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

Interfaces can only describe object (and function/class) shapes, so anything union-based or computed has to be a `type`.

**What only `interface` can do.** Interfaces support *declaration merging*: declaring the same interface twice combines them. This is how libraries let you augment global or third-party types.

```other
interface Window { myGlobal: string }
// merges with the built-in Window interface
```

**Extending.** Both can build on other shapes, with slightly different syntax and behavior:

```other
interface Animal { name: string }
interface Dog extends Animal { bark(): void }

type Animal2 = { name: string };
type Dog2 = Animal2 & { bark(): void };
```

### Declaration Merging and Module Augmentation

Because interfaces merge, you can extend types you don't own:

```other
declare module "styled-components" {
  interface DefaultTheme { colors: { primary: string } }
}
declare global {
  interface Window { analytics: Analytics }
}
```

This is how you type theme objects, extend `Window`, `ImportMeta.env`, or Express requests. Know the difference between `.d.ts` files (ambient declarations, no runtime) and regular modules, and remember that augmentation files must be picked up by `include` in `tsconfig`.

### any vs unknown vs never

These three sit at the extremes of TypeScript's type system: `unknown` and `any` are "top" types (every value fits in them), and `never` is the "bottom" type (no value fits in it).

- `any` turns off type checking and spreads silently through your code.
- `unknown` is the type-safe `any`. You can assign anything to it, but you must narrow it before use.
- `never` is the empty set: no value can inhabit it. It's the return type of functions that always throw, and it's how you build exhaustiveness checks.

Use `unknown` for untrusted input (`catch` clauses, `JSON.parse`, API responses), and treat every `any` as a debt.

### Structural Typing and Branded Types

TypeScript is structural: two types are compatible if their shapes match, regardless of their names. That's flexible, but it means `UserId` and `OrderId` (both `string`) are interchangeable by accident. A **brand** fakes nominal typing:

```other
type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };

const toUserId = (s: string) => s as UserId;
function getUser(id: UserId) {}
getUser("abc" as OrderId); // error
```

Also remember that **excess property checks** only apply to fresh object literals, not to variables you pass in.

### Inference, Widening, and `as const`

`const x = "a"` infers the literal type `"a"`. `let x = "a"` widens to `string`. Object properties widen too, even on `const` objects. `as const` freezes the inference: literals stay narrow and everything becomes `readonly`.

```other
const routes = { home: "/", about: "/about" } as const;
type Route = typeof routes[keyof typeof routes]; // "/" | "/about"
```

### Type Annotation vs `as` vs `satisfies`

- An **annotation** (`const x: Config = ...`) checks the value but widens `x` to `Config`, losing specifics.
- An **assertion** (`as Config`) overrides the compiler. It doesn't check, it tells. It's a lie if you're wrong.
- **`satisfies`** validates the value against a type *and* keeps the narrower inferred type.

```other
const theme = {
  primary: "#00f",
  sizes: [4, 8],
} satisfies Record<string, string | number[]>;

theme.primary.toUpperCase(); // still a string, not string | number[]
```

### Union vs Intersection Types

`A | B` means a value is *either* A or B, so you can only safely use what they share until you narrow. `A & B` means it's *both*, so you get all members of each. Intersections of conflicting properties collapse to `never`. Unions model "one of several states", and intersections model "combining capabilities" (mixins, props merging).

### Narrowing and Custom Type Guards

TypeScript narrows types through control flow: `typeof`, `instanceof`, `in`, equality checks, and truthiness. When built-in narrowing isn't enough, write a **type predicate**:

```other
function isUser(x: unknown): x is User {
  return typeof x === "object" && x !== null && "id" in x;
}
```

There are also **assertion functions** (`asserts x is User`) that throw on failure. The danger is that TypeScript trusts your predicate, so a wrong body creates a silent unsound type.

### Discriminated Unions and Exhaustiveness Checking

Give each variant a literal `kind` field and TypeScript can narrow on it. This is the best way to model UI state, since it makes impossible states unrepresentable:

```other
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: Error };

function assertNever(x: never): never { throw new Error("Unhandled"); }
// In a switch's default: assertNever(state)
```

If you add a new variant and forget a case, the compiler errors. That beats a pile of `isLoading`, `isError`, and `data?` booleans.

### Generics and Constraints

Generics let a function or type work over many types while preserving the relationship between input and output. Use `extends` to constrain what's allowed:

```other
function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

Avoid generics that appear only once in a signature. If `T` isn't linking two things together, it's probably just `unknown` or a concrete type in disguise. Defaults (`<T = string>`) keep APIs friendly.

### keyof, typeof, and Indexed Access Types

These are the building blocks for deriving types from values instead of duplicating them:

- `keyof T` gives the union of T's keys.
- `typeof value` gives the type of a runtime value.
- `T[K]` looks up a property type. `T[number]` gives an array's element type.

```other
const STATUSES = ["draft", "live"] as const;
type Status = (typeof STATUSES)[number]; // "draft" | "live"
```

### Mapped Types and Utility Types

A mapped type transforms every property of another type: `{ [K in keyof T]: ... }`. You can add or remove modifiers (`-?`, `readonly`) and remap keys with `as`. The built-in utilities are all mapped or conditional types underneath:

- `Partial`, `Required`, `Readonly`
- `Pick`, `Omit`, `Record`
- `ReturnType`, `Parameters`, `Awaited`

Know how to write them yourself. It's how you build things like `Nullable<T>` or `Getters<T>`.

### Conditional Types and `infer`

`T extends U ? X : Y` is an `if` at the type level. `infer` captures a piece of a matched type:

```other
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type ElementOf<T> = T extends (infer E)[] ? E : never;
```

Key gotcha: conditional types **distribute over naked unions**. `Unwrap<A | B>` becomes `Unwrap<A> | Unwrap<B>`. Wrap in a tuple (`[T] extends [U]`) to turn that off.

### Template Literal Types

Build string types from other string types, including unions (which produce every combination):

```other
type Side = "top" | "bottom";
type Padding = `padding-${Side}`; // "padding-top" | "padding-bottom"
type Handler<E extends string> = `on${Capitalize<E>}`;
```

Combined with mapped-type key remapping, this powers typed event emitters, CSS-in-JS APIs, and route param extraction. Powerful, but heavy use slows the compiler and hurts readability.

### Overloads vs Generics vs Union Parameters

Three ways to make a function flexible:

- **Union params** are simplest when the return type doesn't depend on the input.
- **Generics** fit when the output type is a function of the input type.
- **Overloads** fit when distinct call signatures return distinct types. Only the overload signatures are visible to callers, not the implementation signature.

Prefer the simplest one that works. Overloads are often a sign a generic or discriminated union would be cleaner.

### Covariance vs Contravariance

Variance describes how subtyping of a *container* relates to subtyping of its contents.

- **Covariant** (outputs): `Dog[]` is assignable to `Animal[]`.
- **Contravariant** (inputs): a function accepting `Animal` is assignable where one accepting `Dog` is expected, not the reverse.

With `strictFunctionTypes`, function-typed *properties* are checked contravariantly, but **method shorthand** stays bivariant for compatibility. Arrays are covariant in TypeScript, which is technically unsound. You can also annotate generics with `in` and `out`. This explains many "why won't this callback type assign?" errors.

### Enums vs Union Literals vs Const Objects

Enums generate runtime code and have quirks (reverse mappings on numeric enums, `const enum` problems with `isolatedModules`). Modern tooling that just strips types, like Node's type stripping and `erasableSyntaxOnly`, doesn't support them well. The common alternative:

```other
const Role = { Admin: "admin", User: "user" } as const;
type Role = (typeof Role)[keyof typeof Role];
```

You get a runtime object *and* a union type, with zero emitted magic. Plain string unions work fine when you don't need the runtime object.

### Typing React Components

Patterns worth knowing cold:

- Extend native props with `React.ComponentProps<"button">` (or `ComponentPropsWithoutRef` when forwarding refs).
- Generic components: `function List<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode })`.
- Discriminated-union props to make invalid prop combinations a compile error.
- Event types like `React.ChangeEvent<HTMLInputElement>`, or inline handlers that infer them automatically.
- `React.FC` is optional and no longer adds implicit `children`. Plain function signatures are usually preferred.

Derive prop types from components (`ComponentProps<typeof Button>`) rather than re-declaring them.

### Compile Time vs Runtime: Type Erasure and Validation

Types vanish at build time. `const user = (await res.json()) as User` compiles fine even if the server returns garbage. At trust boundaries (APIs, `localStorage`, URL params, form data), validate at runtime with Zod, Valibot, or similar, and *derive* the type from the schema:

```other
const User = z.object({ id: z.string(), age: z.number() });
type User = z.infer<typeof User>;
```

Validate at the edge, then trust types inside. This also gives you one source of truth instead of a type and a validator that drift apart.

### tsconfig Strictness and Module Settings

Beyond `"strict": true`, the flags that catch real bugs:

- `noUncheckedIndexedAccess`: `arr[i]` becomes `T | undefined`.
- `exactOptionalPropertyTypes`: `foo?: string` no longer allows an explicit `undefined`.
- `noImplicitOverride` and `noFallthroughCasesInSwitch` for safer classes and switches.

For bundler and tooling compatibility: `isolatedModules` (each file must be transpilable alone), `verbatimModuleSyntax` with `import type` (guarantees type-only imports are erased), and the right `moduleResolution` (`bundler` for Vite/webpack setups). Also know that `tsc` is often just a type checker in modern pipelines, while esbuild, SWC, or Babel do the actual transpiling.

## React

### ref vs props vs state

- **Props** are read-only inputs from a parent. They are how data flows down.
- **State** is data owned by a component. Changing it triggers a re-render.
- **Ref** is a mutable box (`.current`) that persists across renders but does *not* trigger a re-render. Use it for DOM nodes, timers, and previous values.

### Controlled vs Uncontrolled Components

A controlled input's value lives in React state (`value` + `onChange`), so React is the source of truth. An uncontrolled input keeps its value in the DOM, and you read it via a ref or `FormData`. Controlled gives you validation and instant feedback but re-renders on every keystroke. Uncontrolled is cheaper and often enough for simple forms.

### What causes a component to re-render?

Its own state changes, its parent re-renders, or a context it uses changes. Props changing isn’t a trigger by itself: a child re-renders when its parent does, unless it’s wrapped in React.memo and its props are equal.

### Render Phase vs Commit Phase

"Rendering" means React calling your component functions to figure out what the UI should look like. "Committing" means applying the diff to the DOM. A component can render without the DOM changing. Effects run *after* commit. Rendering must be pure because React may call it multiple times, pause it, or throw it away.

### Reconciliation and Keys

React diffs the new element tree against the old one. Same type at the same position means it updates the existing instance and keeps its state. A different type means unmount and remount. `key` gives list items a stable identity. Using array indexes as keys in reorderable lists causes state to attach to the wrong items. Changing a `key` deliberately is also the cleanest way to reset a component's state.

### Batching and Stale Closures

React batches multiple state updates into one render, and state is a snapshot per render:

```ts
setCount(count + 1);
setCount(count + 1); // still +1 total, both read the same snapshot

setCount(c => c + 1);
setCount(c => c + 1); // +2, updater functions chain
```

Effects and callbacks "close over" the values from the render they were created in. This is the source of most stale-state bugs.

### Purity and StrictMode

Components should be idempotent: same inputs, same output, no side effects during render. StrictMode double-invokes renders and effects in development to expose violations, such as effects missing cleanup or mutations of shared objects. If your effect breaks under double-invocation, it has a real bug.

### useState vs useReducer

`useState` suits independent, simple values. `useReducer` suits state with many transitions or where the next state depends on the previous one in complex ways. It centralizes logic into a pure reducer, which is easy to test, and you can pass `dispatch` down (it's stable) instead of many callbacks.

### useEffect vs useLayoutEffect

`useEffect` runs after the browser paints, so it doesn't block visuals. `useLayoutEffect` runs after DOM mutation but *before* paint. Use it when you must measure the DOM and adjust synchronously (tooltips, scroll position) to avoid flicker. It blocks painting, so use it sparingly.

### "You Might Not Need an Effect"

Effects are for syncing with external systems (network, subscriptions, DOM APIs). They are not for:

- Derived data: compute it during render.
- Responding to user events: put the logic in the event handler.
- Resetting state on prop change: use a `key`.

Redundant effects that call `setState` cause extra renders and hard-to-follow data flow.

### useMemo vs useCallback vs React.memo

useMemo caches a computed value, useCallback caches a function reference, and React.memo skips re-rendering a component when props are unchanged. useCallback mostly matters when passing functions to memoized children. I use them where profiling shows a problem, not everywhere. The React Compiler now handles much of this automatically.

### useTransition vs useDeferredValue

Both keep the UI responsive during expensive updates. `useTransition` marks a *state update* as low priority, so urgent input stays responsive and you get an `isPending` flag. `useDeferredValue` defers a *value* you receive (e.g., a search query prop) so a heavy list renders behind the fast-updating input. Use the first when you own the `setState`, the second when you don't.

```ts
function TeamCalendarPage() {
  const [query, setQuery] = useState('');        // urgent: what's in the input
  const [filter, setFilter] = useState('');      // non-urgent: what the calendar uses
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);              // updates immediately
          startTransition(() => {
            setFilter(e.target.value);           // can be interrupted
          });
        }}
      />
      {isPending && <Spinner />}
      <TeamCalendar filter={filter} />
    </>
  );
}
```

### Context vs External Stores (Redux, Zustand, Jotai)

Context is dependency injection, not a state manager. Every consumer re-renders when the context value changes, with no selector support. That's fine for rarely changing values like theme or auth. For frequently updated state, external stores let components subscribe to *slices* (`useSyncExternalStore` underneath), avoiding needless re-renders.

### Server State vs Client State

Server state (users, products) is remote, async, cacheable, and can go stale. Client state (modal open, selected tab) is local and synchronous. Don't put server data in Redux and hand-roll loading flags. Use TanStack Query or SWR for caching, dedup, refetching, and invalidation, and keep your client store small.

### Custom Hooks vs HOCs vs Render Props

All three share stateful logic. HOCs wrap components, causing "wrapper hell" and prop collisions. Render props pass a function as a child, causing nesting. Custom hooks (`useDebounce`, `useMediaQuery`) share logic without changing the component tree, which is why they're now the default.

### Composition and Compound Components

Prefer composition over configuration props. Instead of `<Select options={...} renderItem={...} />`, expose `<Select><Select.Option/></Select>`, with shared state passed internally via context. Using `children` and slots avoids prop drilling and keeps components flexible (see Radix, Headless UI).

### Suspense and Error Boundaries

Suspense declares a loading fallback for anything that is "not ready" (lazy code, data fetching in supporting frameworks). Error boundaries (class components or `react-error-boundary`) catch render-time errors in a subtree and show a fallback. Place them strategically, per route or feature, so one failure doesn't blank the whole app. They don't catch errors in event handlers or async code.

### Code Splitting and Lazy Loading

`React.lazy` + `Suspense` (or route-level splitting in your framework) loads code on demand and shrinks the initial bundle. Split by route first, then by heavy, rarely used components (charts, editors, modals). Preload on hover or intent to hide the latency.

### Profiling and List Virtualization

Don't optimize by guessing. Use the React DevTools Profiler to find what re-renders and why. Common fixes are moving state down, lifting content up via `children`, and memoizing at the right boundary. For huge lists, virtualize (`react-window`, TanStack Virtual) so only visible rows are in the DOM. Pair with Web Vitals (INP, LCP) to confirm real user impact.

### CSR vs SSR vs SSG vs Streaming, and Hydration

- **CSR**: the browser builds everything. Simple, but slow first paint and weak SEO.
- **SSR**: HTML per request. Fast first paint, but a server cost.
- **SSG/ISR**: HTML built ahead of time, optionally revalidated.
- **Streaming SSR**: sends HTML in chunks as Suspense boundaries resolve.

When to pick which:

- For Highly Interactive Applications: If you’re building a single-page application (SPA) that needs smooth, app-like interactivity — such as a dashboard or a social platform — Client-Side Rendering (CSR) is likely your best option. CSR allows you to deliver dynamic and interactive content by rendering everything in the browser. However, if SEO is a priority, you may need to explore workarounds, as CSR is less SEO-friendly than server-rendered solutions.

- For SEO-Focused Applications with Dynamic Data: If SEO is essential to your application, and you have pages that need regular data updates, Server-Side Rendering (SSR) might be the right fit. SSR provides the SEO benefits of pre-rendered HTML, with each request delivering up-to-date content. For example, e-commerce platforms and real estate listings — where search engines need to crawl frequently changing data — can benefit from SSR’s real-time freshness.

- For Mostly Static Content: When your application is content-driven and doesn’t require frequent updates, Static Site Generation (SSG) offers speed and efficiency. Blogs, portfolios, and documentation sites are great candidates for SSG because they serve pre-rendered HTML, giving users fast load times. Although SSG doesn’t handle real-time data well, its static nature makes it ideal for sites that don’t require frequent changes.

### Server Components vs Client Components

Server Components run only on the server. They can access databases directly, ship zero JS to the client, and can't use state, effects, or browser APIs. Client Components (`"use client"`) are the interactive ones. The skill is drawing the boundary: keep data-heavy, static parts on the server and push interactivity to small leaf components.

## React Patterns

### HOC

You have a sprawling React codebase. Every screen needs to fire an analytics event when it mounts, but only when the current user has consented to tracking. Sprinkling that logic into each page component would be repetitive, easy to forget, and a nightmare to update when the analytics SDK changes.

The Higher-Order Component (HOC) pattern is one of React’s oldest answers to this kind of cross-cutting problem. A HOC is just a function: it accepts a component and returns a new component that wraps the original with extra behavior. Think of it as a decorator for components.

```ts
import { useEffect } from "react";
import { track } from "./analytics";

export function withAnalytics<P extends object>(
  Wrapped: React.ComponentType<P>,
  eventName: string,
) {
  function WithAnalytics(props: P) {
    useEffect(() => {
      track(eventName, { path: window.location.pathname });
    }, []);

    return <Wrapped {...props} />;
  }

  // Helpful in React DevTools
  WithAnalytics.displayName = `withAnalytics(${
    Wrapped.displayName ?? Wrapped.name ?? "Component"
  })`;

  return WithAnalytics;
}
```

Using HOC for feature flags:

```ts
import { useFlag } from "./flagsClient";

export function withFeatureFlag<P extends object>(
  flagKey: string,
  Treatment: React.ComponentType<P>,
  Control: React.ComponentType<P>,
) {
  return function WithFeatureFlag(props: P) {
    const enabled = useFlag(flagKey);
    return enabled ? <Treatment {...props} /> : <Control {...props} />;
  };
}

// At the call site:
export const PricingPage = withFeatureFlag(
  "pricing_redesign_2025",
  PricingPageNew,
  PricingPageLegacy,
);
```

### Render props Pattern

You are passing a React component as a prop, and rendering it.

Component:

```ts
type RenderProp<T> = (value: T) => React.ReactNode;

function Geolocation({ render }: { render: RenderProp<GeoState> }) {
  const state = useGeolocation(); // does the actual work
  return <>{render(state)}</>;
}
```

Consumer:

```ts
<Geolocation
  render={({ coords, error, status }) => {
    if (status === "pending") return <Spinner />;
    if (error) return <PermissionPrompt error={error} />;
    return <MapMarker lat={coords.latitude} lng={coords.longitude} />;
  }}
/>
```

### Compound Pattern

```ts
<Dropdown value={sort} onChange={setSort}>
  <Dropdown.Trigger>Sort by</Dropdown.Trigger>
  <Dropdown.Menu>
    <Dropdown.Item value="new">Newest</Dropdown.Item>
    <Dropdown.Item value="price"><DollarIcon /> Price</Dropdown.Item>
    <Dropdown.Divider />
    <a href="/help">Help</a>
  </Dropdown.Menu>
</Dropdown>
```

### Container/Presentational component pattern

Outdated, can be replaced with react hooks easily.

## react-query

### What is the difference between using an array and object as a query key?

No matter the order of keys in objects, all of the following queries are considered equal

```other
useQuery({ queryKey: ['todos', { status, page }], ... })
useQuery({ queryKey: ['todos', { page, status }], ...})
useQuery({ queryKey: ['todos', { page, status, other: undefined }], ... })
```

The following query keys, however, are not equal. Array item order matters!

```other
useQuery({ queryKey: ['todos', status, page], ... })
useQuery({ queryKey: ['todos', page, status], ...})
useQuery({ queryKey: ['todos', undefined, page, status], ...})
```

### What is Query functions, and what happens if it returns undefined or null?

A query function can be literally any function that **returns a promise**. The promise that is returned should either **resolve the data** or **throw an error**.

On success, the resolved value may be anything **except undefined**. Queries that resolve to undefined will be [treated as failed](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-react-query-4#undefined-is-an-illegal-cache-value-for-successful-queries). To store "nothing" as a successful result in the query cache, resolve null instead.

### How to use query key in query function?

```other
function Todos({ status, page }) {
  const result = useQuery({
    queryKey: ['todos', { status, page }],
    queryFn: fetchTodoList,
  })
}

// Access the key, status and page variables in your query function!
function fetchTodoList({ queryKey }) {
  const [_key, { status, page }] = queryKey
  return new Promise()
}
```

### Does fetch throw error by default for unsuccessful HTTP calls?

While most utilities like axios or graphql-request automatically throw errors for unsuccessful HTTP calls, some utilities like fetch do not throw errors by default. If that's the case, you'll need to throw them on your own. Here is a simple way to do that with the popular fetch API:

```other
useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    const response = await fetch('/todos/' + todoId)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  },
})
```

### What is query options?

One of the best ways to share queryKey and queryFn between multiple places, yet keep them co-located to one another, is to use the queryOptions helper. At runtime, this helper just returns whatever you pass into it, but it has a lot of advantages when using it [with TypeScript](https://tanstack.com/query/latest/docs/framework/react/typescript#typing-query-options). You can define all possible options for a query in one place, and you'll also get type inference and type safety for all of them.

```other
import { queryOptions } from '@tanstack/react-query'

function groupOptions(id: number) {
  return queryOptions({
    queryKey: ['groups', id],
    queryFn: () => fetchGroups(id),
    staleTime: 5 * 1000,
  })
}

// usage:

useQuery(groupOptions(1))
useSuspenseQuery(groupOptions(5))
useQueries({
  queries: [groupOptions(1), groupOptions(2)],
})
queryClient.query(groupOptions(23))
queryClient.setQueryData(groupOptions(42).queryKey, newGroups)
```

### What is the manual parallel queries and Dynamic Parallel Queries (useQueries)

When the number of parallel queries does not change, there is **no extra effort** to use parallel queries. Just use any number of TanStack Query's useQuery and useInfiniteQuery hooks side-by-side!

```other
function App () {
  // The following queries will execute in parallel
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: fetchTeams })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects })
  ...
}
```

If the number of queries you need to execute is changing from render to render, you cannot use manual querying since that would violate the rules of hooks. Instead, TanStack Query provides a useQueries hook, which you can use to dynamically execute as many queries in parallel as you'd like.

useQueries accepts an **options object** with a **queries key** whose value is an **array of query objects**. It returns an **array of query results**:

```other
function App({ users }) {
  const userQueries = useQueries({
    queries: users.map((user) => {
      return {
        queryKey: ['user', user.id],
        queryFn: () => fetchUserById(user.id),
      }
    }),
  })
}
```

> When using TypeScript, an inline select written on a query object passed to useQueries can't infer its data argument from that same object's queryFn — it falls back to unknown. Annotate the select parameter explicitly, or define the query with the [queryOptions](https://tanstack.com/query/latest/docs/framework/react/reference/functions/queryOptions) helper, to keep type inference. See [this known limitation](https://github.com/TanStack/query/issues/6556).

### What is useQuery dependent Query (enabled property)

Dependent (or serial) queries depend on previous ones to finish before they can execute. To achieve this, it's as easy as using the enabled option to tell a query when it is ready to run:

```other
// Get the user
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})

const userId = user?.id

// Then get the user's projects
const {
  status,
  fetchStatus,
  data: projects,
} = useQuery({
  queryKey: ['projects', userId],
  queryFn: getProjectsByUser,
  // The query will not execute until the userId exists
  enabled: !!userId,
})
```

### Background Fetching Indicators

A query's status === 'pending' state is sufficient enough to show the initial hard-loading state for a query, but sometimes you may want to display an additional indicator that a query is refetching in the background. To do this, queries also supply you with an isFetching boolean that you can use to show that it's in a fetching state, regardless of the state of the status variable.

In addition to individual query loading states, if you would like to show a global loading indicator when **any** queries are fetching (including in the background), you can use the useIsFetching hook.

### Window Focus Refetching

If a user leaves your application and returns and the query data is stale, **TanStack Query automatically requests fresh data for you in the background**. You can disable this globally or per-query using the refetchOnWindowFocus option.
