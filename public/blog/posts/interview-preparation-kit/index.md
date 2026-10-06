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

## Variables & Scope

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
