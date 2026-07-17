---
title: "Monolith, Monorepo, or Microfrontends? What these mean and what they actually fix"
excerpt: "Spoiler alert: You probably don't need microfrontends unless your org chart looks like a subway map. Monoliths work, monorepos are tidy, and microfrontends... Well, after working at five different companies, I've seen lots of people suggest them, but whenever I asked what real benefits we'd get, the room got pretty quiet."
date: "2026-07-16"
author: "Tural Hajiyev"
locale: "en"
category: "Engineering"
draft: false
tags:
  [
    "Architecture",
    "Monolith",
    "Monorepo",
    "Microfrontends",
    "Web Development",
    "Team Productivity",
  ]
---

Last 10 years I've heard "let's split this up into microfrontends" or "a monorepo would solve our problems" countless times. But whenever it's time to push the details, nobody can really point to what problems we're actually solving. I've read article after article on the topic, and honestly, it gets exhausting. "If you want to split the login page and the main page between different teams..." Hold on, do we really need a special task force just to manage a login page? Till now, in all applications I worked, we built-in login page once, and never open that file again. That's pretty much why I built a little demo app with all these different setups, just to see for myself what actually works and what doesn't.

Here’s the simple version: microfrontends fix one problem, but it’s a problem most companies never actually run into. Unless you have a big company with separate teams working on totally different parts, you probably don’t need them. Still, people keep suggesting microfrontends because it sounds like the modern thing to do, even when it doesn’t really fit their situation.

Half the confusion around this topic comes from treating these as one decision when they are actually three:

1. Where does the code live? One repo, or a bunch of them? That's **monorepo vs polyrepo.**
2. How's the code organized inside the repo? One giant package, or split into workspace packages? **single package vs workspace/monorepo packages.**
3. How does it actually run in the browser? One built that ships as a unit, or several independently-deployed pieces that get stitched together at runtime? **monolith vs microfrontend.**

You can have a monorepo that still ships a single monolithic build. You can split a monorepo into tidy workspace packages and still ship one artifact. And you can go full microfrontend from separate repos entirely. "Microfrontend" is really only about question 3 — nothing to do with where your source lives.

And here's the thing: most of the pain people are trying to solve actually lives in question 2, not question 3. That's the whole point of this post, honestly.

Teams can ship to production independently of each other.

That's it. That's the whole prize. In practice, it looks like:

- Team A deploys Tuesday afternoon, Team B deploys Thursday morning, and neither one is blocked on the other.
- A bad deploy in one module doesn't drag down a totally unreleated module sharing the same page.
- Different teams can run different testing standards, different release rhythms, whatever works for them, as long as everyone agrees on the pieces plus together.
- Ownership gets real - separate CI/CD, separate on-call, not fust a folder someone agreed to leave alone.

**Q: Why isn't using separate repos and npm packages the same as microfrontends?**

A: When you publish to npm and have your shell app install other modules from there, you're still composing everything at build time, not at runtime. That means you don't actually get true independent deploys. Even if the code lives in different repos, you're still locked into coordinating builds and releases together.

![Diagram: NPM package vs Microfrontend deployment](/blog/posts/npm-package-vs-microfrontend.png)

Getting this level of independence comes with serious tradeoffs:

- **Dependency wrangling:** React and React DOM usually need to be singletons across every loaded module. Mess up the version constraints and you get weird runtime bugs that don't show up until production - not clean build errors.
- **More infra to babysit:** Every module needs its own pipeline, its own deploy target, and some reliable way to publish and version the manifest file that lets the shell find it at runtime.
- **Local dev gets annoying:** Running the whole thing locally can mean spinning up several dev servers at once, or faking out remote modules you are not actively working on.
- **Design drift:** Keeping HR, Finance and Trade feeling like one product takes real discipline - a shared component library someone actually maintains and enforces.
- **Debugging:** It gets fuzzier. When something breaks, "is this my bug or theirs" becomes an actual question you have to answer, and it takes longer across a runtime boundary that across a normal function call.
  Harder to optimize. You lose the nice thing a single bundler gives you for free: seeing everything at once and deduping it.

**Q: Do the teams building HR, Finance, and Trade need to ship independently, on their own schedules, without waiting on each other?**

A: If yes and if these are genuinely separate teams with their own roadmaps, and coordinating releases would be a problem, then microfrontends actually make sense. But if not, if it's really just one team or a few people collaborating closely, then microfrontends aren't worth it. You'd be paying all the costs for a benefit you won't use.

Honestly, most teams, especially at the start, fall into that second group without really noticing. "Microfrontends" just has a certain grown-up sound when you want modular software.

### What actually solves the pain, most of the time

If what you're really after is fast CI, clear boundaries between the modules, and shared components without copy-pasting everywhere - a monorepo split into workspace packages, still shipping as one build, gets you almost all of that.

Throw in Turborepo or Nx and you get:

- **Only rebuilding what changed:** CI can tell that only `hr` touched, and skip tebuilding `finance` and `trade`
- **Clean dependency graphs:** each app has its own `package.json`, no more "what does this even depend on"
- \***\*Fast local dev:** one install, everything wired together, no publishing a package just to test a shared button change
- **One version of everything:** no singleton negotiation headaches, no version mismatch bugs
- **Real ownership:** a CODEOWNERS file on `/apps/hr` does basically the same job as a separate repo would.
- **Lazy loading for free:** `React.lazy` and dynamic `import()` mean the browser only pulls down HR's code when someone actually visits `/hr`

> The one thing you don't get here is truly independent production deploys — a change to hr still ships in the same release as everything else, even if CI only rebuilt that one package. For most teams that's completely fine, because they were never going to deploy separately in the first place.
