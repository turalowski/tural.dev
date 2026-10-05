There are 2 for loops, one defined with var, and the other one defined with let. Even the rest is the same, they have totally different output. Why is it like this?

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3, 3, 3 — one shared `var` binding
}
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2 — new binding per iteration
}
```

## The `var` version

`var` is a function-scoped(or global-scoped if there is no function), not block-scoped. The `for() {}` block doesn't create a new scope for `var` variable. It means for the entire loop, there is exactly **one** variable. It lives in the global scope, and every iteration just mutates the same variable.

**Closures** capture variables, not values. Each arrow function, `() => console.log(i)` doesn't capture the value of **i** at the time it's created. It just captures reference to the **i** variable itself. That's why, all 3 functions don't now anything about the current value of **i**, they only know **i**.

Step 3 — Timing. setTimeout(fn, 0) doesn't run fn immediately — even with a 0ms delay, it's a macrotask, so it gets queued and can only run after the current synchronous code (the whole for loop) finishes completely. By the time the loop finishes, i has been incremented all the way past the exit condition — its final value is 3 (the loop increments to 3, checks 3 < 3, fails, and stops).

Step 4 — Callbacks fire. Now the event loop pulls the three queued callbacks off the macrotask queue one by one and runs them. Each one does console.log(i) — but since all three point to the same i, and that i is now 3, all three print 3.

```
Timeline:
sync:  i=0 → schedule cb1 → i=1 → schedule cb2 → i=2 → schedule cb3 → i=3, loop exits
later: cb1 runs → reads shared i → 3
       cb2 runs → reads shared i → 3
       cb3 runs → reads shared i → 3
```

## The `let` version

Step 1 — Scope. let is block-scoped. But there's a special rule in the ECMAScript spec specifically for let/const in the head of a for loop: the engine creates a brand new lexical binding of i for every single iteration, not one shared binding. This is called per-iteration let binding in the spec (CreatePerIterationEnvironment).

Concretely, the engine does something conceptually equivalent to this desugaring:

```
{
  let i0 = 0;
  if (i0 < 3) {
    setTimeout(() => console.log(i0), 0);
    let i1 = i0 + 1;      // new binding, copied value, for next iteration
    if (i1 < 3) {
      setTimeout(() => console.log(i1), 0);
      let i2 = i1 + 1;
      if (i2 < 3) {
        setTimeout(() => console.log(i2), 0);
        let i3 = i2 + 1;  // 3 < 3 fails, loop stops
      }
    }
  }
}
```

Each iteration gets its own copy of i, initialized from the previous iteration's value. So the arrow function created in iteration 1 closes over i0 (value 0), the one in iteration 2 closes over i1 (value 1), and so on — three separate variables in three separate closures.

Step 2 — Timing works the same as before — all three callbacks are still queued as macrotasks and run after the loop finishes. But this time it doesn't matter, because each callback has its own private i that was frozen at the value it had during that specific iteration.

```
Timeline:
sync:  i=0 (binding #1) → schedule cb1 (closes over binding #1)
       i=1 (binding #2) → schedule cb2 (closes over binding #2)
       i=2 (binding #3) → schedule cb3 (closes over binding #3)
       loop exits
later: cb1 runs → reads binding #1 → 0
       cb2 runs → reads binding #2 → 1
       cb3 runs → reads binding #3 → 2
```

## Why this matters practically

Before let existed (ES5 and earlier), the standard workaround for this exact bug was to manually create a new scope per iteration using an IIFE (Immediately Invoked Function Expression):

```
for (var i = 0; i < 3; i++) {
  (function (capturedI) {
    setTimeout(() => console.log(capturedI), 0);
  })(i); // pass i in *by value* as an argument, creating a new binding each time
}
// logs: 0, 1, 2
```

This works for the same underlying reason let works — a function call creates a new scope, and the parameter capturedI is a fresh variable each invocation, so each closure gets its own copy.
