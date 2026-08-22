---
title: "Monolith, Monorepo, or Microfrontends?"
excerpt: "Monoliths are simple, monorepos keep projects organized, and most teams don't need microfrontends."
date: "2026-03-04"
tags:
  [
    "Architecture",
    "Monolith",
    "Monorepo",
    "Microfrontends",
    "Web Development",
    "Team Productivity",
  ]
author: "Tural Hajiyev"
locale: "en"
category: "Frontend Architecture"
---

Discussions about frontend architecture often include suggestions to use microfrontends. But when I look for strong reasons behind these recommendations, they rarely hold up for most teams.

**Here's my core takeaway:**

Microfrontends are designed to let completely independent teams deploy their features separately from each other. This only makes sense if you are at a large company with distinct, siloed teams. Most organizations don't need this level of separation. The popularity of microfrontends has more to do with the appeal of new trends than with solving everyday problems.

A lot of confusion comes from treating these ideas as a single decision, when in reality they're separate:

1. **Where does your code live?** One repo or multiple (monorepo vs polyrepo)?
2. **How is code structured inside the repo?** Is everything together, or split into packages (single package vs workspaces)?
3. **How does it run in the browser?** Is there one deployed build, or several independently deployed builds combined at runtime (monolith vs microfrontend)?

You can have a monorepo and still ship a single monolith. You can break a monorepo into workspace packages while keeping one deployable artifact. Microfrontends only address the third point, which is about how your code ships and runs—not where the source lives.

The main promise of microfrontends is this: Teams can deploy to production independently.

That's basically it. In practice, it means scenarios like:

- Team A can release code on Tuesday afternoon, Team B can release Thursday morning. One team's work doesn't block the other. A buggy deployment in one module doesn't crash other unrelated modules on the same page.
- Teams can set their own testing or release cadence, as long as everyone agrees on integration boundaries.
- Ownership lines are clearer and each team handles its own CI/CD, on-call, and maintenance.

**Q: If my code is in different repos or npm packages, do I have microfrontends?**

A: Not exactly. If you publish to npm and your shell app installs other packages from there, you're still combining everything at build time, not at runtime. You don't get real independent deployment. Even with code in different repos, deployments are still tied together and require coordination. Here is the difference visually:

![Diagram: NPM package vs Microfrontend deployment](/blog/posts/monolith-monorepo-microfrontends/npm-package-vs-microfrontend.png)

True independence comes with challenges.

One big challenge is loading React and React DOM as true singletons across all modules. Version mismatches won't always throw build errors; problems may only show up at runtime in production. Each module needs its own build pipeline, deployment environment, and a robust system for sharing and versioning the manifest that lets the shell discover them.

Local development also gets trickier. You may have to juggle multiple dev servers, or mock modules you aren't actively working on, just to get things running.

Tracing problems across runtime boundaries is more complex than tracing through regular function calls. And optimizing performance is less straightforward since the bundler can't see or deduplicate all code in one place.

**Q: Do your HR, Finance, and Trade teams actually need to deploy independently whenever they want?**

A: If each team has its own roadmap, works in isolation, and release coordination is a real, recurring pain, then microfrontends can add value. But if there's really just one team, or everyone ships together by default, microfrontends introduce a lot of complexity for almost no gain.
