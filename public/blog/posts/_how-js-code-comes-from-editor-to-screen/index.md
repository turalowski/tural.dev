---
title: "How JavaScript Code Comes From Editor to Screen"
excerpt: "Trace the lifecycle of JavaScript—from the moment you type in the editor, through tooling and build steps, to how it finally runs in the browser. Demystify the pipeline for modern JS apps."
date: "2026-07-17"
tags:
  - "JavaScript"
  - "Web Development"
  - "Tooling"
  - "Frontend"
  - "Build Process"
author: "Tural Hajiyev"
locale: "en"
category: "Engineering"
---

Steps:

- Loading the code
- Parsing
- Lexical analysis (tokenizing)
- Syntactic analysis (building the AST)
- Compilation
- Memory: the stack and the heap
- Execution and the event loop
- Getting pixels on the screen

## Loading the code

The browser (or Node) fetches js file as raw text and hands it to JS Engine. There are 2 pathways here:

- Inline `<script>`: already in the HTML, no network request needed.
- External `<script src="...">`: the browser has to fetch it — DNS lookup, TCP/TLS handshake, HTTP request/response, unless it's cached.

Script tags block the HTML parser by default. The browser's HTML parser reads your page top to bottom, building the DOM as it goes. When it hits a <script> tag with no attributes, it has to:

1. Stop parsing HTML.
2. Fetch the script (if external).
3. Run the JS engine on it, fully, top to bottom.
4. Only then resume parsing the rest of the HTML.

> **That's why put your <script> tags at the bottom of <body>" was classic advice — it let the page's visible content parse first, otherwise all content will be blocked.**

Plain <script>: blocks HTML parsing entirely while it fetches and runs.

![](/blog/posts/how-js-code-comes-from-editor-to-screen/plain-script.png)

**async and defer exist specifically to avoid this blocking.**

async fetches in parallel with HTML parsing, but runs the moment it's ready. It pauses parsing whenever that happens, in whatever order scripts finish downloading.

![](/blog/posts/how-js-code-comes-from-editor-to-screen/async-script.png)

defer fetches in parallel too, but always waits until the HTML document is fully parsed, and runs multiple deferred scripts in their original order.

![](/blog/posts/how-js-code-comes-from-editor-to-screen/defer-script.png)

There is also `type="module"`. It behaves like defer by default, and can also be fetched with dependency graphs (an import in one module triggers fetching another).

## Parsing

After having JS code, it's required to bring it to the readable format.

Parsing helps us here by turning a flat string of characters into a tree the engine can actually reason about. It happens in two stages: lexing (tokenizing) and parsing (building the tree).

### Lexical analysis (tokenizing)

Token is a smallest meaningful unit in the context of lexical anaylsis.

The scanner reads character by character and groups them into tokens. Whitespace and comments get discarded here (mostly).

For let x = 1 + 2; the tokens would be:

![](/blog/posts/how-js-code-comes-from-editor-to-screen/lexical-analysis.png)

### Syntactic analysis (building the AST)

The parser takes that token stream and matches it against JS's grammar rules, building a tree where each node represents a construct. A construct can be a declaration, an expression or an operator with its operands. This is usually a recursive descent parser: a set of functions that call each other matching the grammar, recursing into sub-expressions.

While building the tree, the engine also tracks scopes to know which variables belong to which function or block. It helps to know in advance whether x inside a function refers to a local, an outer closure variable, or a global. This is part of why var (function-scoped) and let/const (block-scoped) behave differently: the parser records different scope boundaries for each.

#### Lazy parsing (the performance trick)

For a function that isn't called immediately, the parser does a cheap pre-parse. It just verifies syntax is valid and records the function's start and end positions, skipping the expensive step of building a full AST for its body. Only when that function is actually invoked does the engine go back and fully parse it. This is why huge JS bundles with lots of unused code paths don't necessarily cost as much startup time as their file size would suggest.

#### Error recovery

If tokens don't match any valid grammar rule, the parser throws a SyntaxError immediately unlike compiled languages with more forgiving pipelines, JS engines generally parse the entire script's syntax upfront (even lazily-skipped function bodies get a syntax check) before executing a single line, which is why a syntax error anywhere in a script prevents the whole thing from running, even the parts before the error.

### Compilation

JS is often called "interpreted," but modern engines are hybrid. Here's roughly what V8 does:

- Interpreter (Ignition in V8): turns the AST into bytecode fast and starts running it immediately. No time wasted waiting to compile everything up front.
- Profiler: watches execution and notices "hot" code — functions or loops called many times with consistent argument types.
- JIT compiler (TurboFan in V8): recompiles those hot paths into real optimized machine code, using assumptions like "this variable is always a number."
- Deoptimization: if an assumption breaks later (that variable suddenly becomes a string), the engine throws away the optimized code and falls back to the interpreter — a real performance cliff you can sometimes trigger by accident.

### Memory: the stack and the heap

Primitives and function call frames live on the call stack. Objects, closures, and arrays live on the heap, managed by a garbage collector that periodically frees memory no longer referenced.

### Execution and the event loop

JS runs on a single thread with one call stack. When code calls something async (setTimeout, a fetch, a DOM event), that work is handed off to the browser/Node APIs. When it finishes, its callback is placed in a queue (macrotask or microtask, depending on type). The event loop constantly checks: is the call stack empty? If so, pull the next task from the queue and run it. This is why a blocking while(true) loop freezes your whole page — nothing else can get a turn.

### Getting pixels on the screen

Once your script runs and touches the DOM (say, element.style.color = 'red'), the browser:

1. Recomputes the style for affected elements (CSS cascade resolution).
2. Runs layout/reflow — calculates size and position of elements.
3. Paints — fills in pixels for each layer (text, colors, images).
4. Composites the layers together on the GPU and presents the final frame, ideally synced to the screen's refresh rate (~16.6ms for 60fps).

This handoff happens through requestAnimationFrame callbacks and the browser's own rendering pipeline, which runs after your JS finishes executing (or yields control back via the event loop).
