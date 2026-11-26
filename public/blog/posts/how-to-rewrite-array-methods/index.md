---
title: "How to Rewrite Array Methods — map and filter methods from scratch"
excerpt: "How to implement JavaScript's map and filter array methods from scratch: callbackFn, thisArg, and the details that trip people up in interviews."
order: 5
date: "2026-09-02"
tags:
  - "JavaScript"
  - "Array Methods"
  - "Interview Prep"
  - "Prototype"
  - "Web Development"
author: "Tural Hajiyev"
locale: "en"
category: "Engineering"
---

While preparing for interviews, I found out that one of the "hot-potato" topics of javascript interviews is, implementing `map`, `reduce`, `filter` `flatMap` methods from scratch. First it sounds easy to do, as JS developer we almost everyday using it but from the first line I got stuck. I even forgot how to add a method to Array, because I don't remember when last time I used prototype. More or less, this is what I relearned while getting it right.

## map method

Map function of Array has 2 parameters - `callbackFn` and `thisArg`.

Callback function is easy, as we always use it. For example,

```js
const items = [1, 2, 3, 4, 5];
const newItems = items.map((item) => item * 2);
```

It's the must-have parameter, but I don't remember any time I used thisArg.

`thisArg` is used as `this` when executing `callbackFn`. For example, let's say we have following code:

```js
const calculator = {
  multiplier: 10,
  multiply(x) {
    return x * this.multiplier;
  },
};

const numbers = [1, 2, 3];

const result = numbers.map(calculator.multiply);
```

I would expect `this.multiplier` will be undefined, and the result will be `[NaN, NaN, NaN]`. But if you ask me how to solve it, I couldn't answer. That's when `thisArg` is useful actually. If we pass calculator as thisArg to map function, the result will change:

```js
// previous object definition
const result2 = numbers.map(calculator.multiply, calculator);
```

This time, the result will be `[10,20,30]` instead of multiple NaN.

`thisArg` is ready, now it's time to think about callback function. It also receives multiple arguments: `element`, `index`, `array`

Now we have the full setup to create our own map function.

First we need to define the function. we can do that by adding function to `Array.prototype`:

```js
Array.prototype.myMap = function (callback, thisArg) {};
```

So it's the background to work with the function. Inside, we can define empty array, we can iterate over initial array, and we can call the callback function we have with `call` function. Why `call` function? It will help us to define the environment to call the callback. First argument of call function is this environment, and the remaining ones are arguments we want to pass to the function.

```js
let array = [];
for (let i = 0; i < this.length; i++) {
  array.push(callback.call(thisArg, this[i], i, this));
}
```

Here, `thisArg` is the environment we want to the call the function. (for example, calculator object). `this[i]` is the element we access currently. `i` is the index, and `this` is the original array.

If we combine it with the previous code, the result will be:

```js
Array.prototype.myMap = function (callback, thisArg) {
  let arr = [];
  for (let i = 0; i < this.length; i++) {
    arr.push(callback.call(thisArg, this[i], i, this));
  }
  return arr;
};
```

It will work. Partially. While working on it, I learned something new related to arrays. `map` function should return the array with the same length. Array can have multiple values like number, string, undefined, null, but it can also have `holes`. For example, following array is valid:

```js
const arrayWithHole = [1, , 3];
```

If we call this array with our method for example to multiply with **2**, the `hole` will become `NaN`. If we don't do anything, it will be undefined. Ideally, we need to keep it as a hole, because we didn't set any value. For that, we need to catch if it's the hole, and skip calling `callback` function. It can be done by having `in` operator:

```js
 if (i in this) // call callback
 // move to the next element
```

The most final code will be:

```js
Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== "function")
    throw new TypeError(`${callback} is not a function`);
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      // skip holes in sparse arrays
      result.push(callback.call(thisArg, this[i], i, this));
    }
  }
  return result;
};
```

## filter method

Filter function has the same shape as `map`. The main difference is we conditionally pushing to the result array, which means length of initial array and output array can be different.

```js
Array.prototype.myFilter = function (callback, thisArg) {
  if (typeof callback !== "function")
    throw new TypeError(`${callback} is not a function`);
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};
```

Here, if it's not a `hole` and `callback.call(...)` returns true, we add the element to the result array. Otherwise we just skip it.
