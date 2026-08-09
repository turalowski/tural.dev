---
title: "React Project Folder Structure — Patterns for Scalable Frontend Apps"
excerpt: "A comparison of Type-based and  Feature-based project folder structures."
date: "2026-06-18"
tags:
  - "React"
  - "Architecture"
  - "Frontend"
  - "Project Structure"
  - "Web Development"
  - "Type-based folder structure"
  - "Feature-based folder structure"
  - "Feature-Sliced Design (FSD)"
author: "Tural Hajiyev"
locale: "en"
category: "Frontend architecture"
---

Picking the right folder structure for teams is one of the first choices a team has to make together. If you make a good choice, your project can grow smoothly and stay organized. But if you pick the wrong structure and keep building on it, it can be really difficult, sometimes impossible to change things later without risking breaking something. My experience lets me talk about 2 main folder structures:

- Type-based folder structure
- Feature-based folder structure

While writing this article, I also wanted to include Atomic Design, but then I realized it's not really a folder structure. It's a great example of how UI libraries can be organized, but the biggest blind spot of Atomic Design is that it wasn't designed for data or logic. It says nothing about where API calls, hooks, or business logic go. Atomic Design was created purely for UI composition, not for handling data or application logic. It can be used together with all folder structures, but alone it can't help to create a full frontend application. Maybe that's not really a blind spot and it's just a different topic and worth addressing separately in another article.

To make things easy to understand, I will mention an ERP application with **contacts**, **trade**, **finance**, and **hr** modules. I will mention this application in multiple places.

## Type-based folder structure

I want to start with a common example of how a type-based folder structure looks like:

```
src/
  components/
  hooks/
  services/
  utils/
  pages/
```

Here, the idea is having a folder for each type (component, hook, etc) and storing them together. This structure has its own advantages and disadvantages.

### Advantages

Firstly, this is the first architecture introduced with React, and many companies started their React projects with it. Today you can still find many small-mid applications using it. Being the first structure makes this folder structure easy to understand for new members of the team.

Secondly, as it's a well-known folder structure choice, it doesn't require any upfront architecture decisions, and you just dump files where their "types" say they go. I can say if you are not sure about which folder structure to use, it's the safest one, because it's easier to shift from this structure to other folder structures. Usually, after having clear requirements, and seeing the full scope of the application, it's easier to decide which folder structure fits well, and start to use it.

### Disadvantages

Because the relationships between files aren’t clear in this structure (for example, a component in `components` might use another component or a custom hook from somewhere else), it becomes pretty difficult to make changes to a single feature. Imagine the company decides the `hr` module should become its own standalone application. Trying to delete that module or move it to a new GitHub repo quickly turns into a headache, since there's not any clear way to know which files belong to HR, what its dependencies are, or where its boundaries end. Sure, you could try to prefix everything with `HR` (`HRLandingPage.tsx`, `HRPeople.tsx`) to keep things together, but once you break this naming rule anywhere, or if you rely on a shared function (like a `usePeople.tsx` hook), it all gets messy and hard to untangle.

Also, it's worth mentioning that if you decide to define boundaries by using prefixes like `HR`, `Finance`, or `Contacts`, after a while you will see really ugly file names in the repo. `HRPayrollTableWithEditModal.tsx` is not a good name, and you will not be happy to see it every time.

Additionally, as files for a single feature end up shared between different folders, you have to jump around a lot. For people who work on the project every day, it's fine, but new team members can spend a lot of time trying to understand how components, hooks, and other files connect. If you leave the project for a bit and come back, it's easy to forget these relationships too, especially once folders start to fill up. (Imagine having over 100 components in the `/components` folder and 25 hooks in `/hooks`. When you’re used to the project, you remember which component uses which hook, but it’s pretty easy to get mixed up.)

## Feature-based folder structure

```
src/
  features/
    hr/
      components/
      hooks/
      api/
    finance/
      components/
      hooks/
      api/
    shared/
      components/
      hooks/
      api/
```

With this structure, each feature has its own folder to live in. Additionally, there is a `shared` folder to store common code and services used across multiple modules.

Firstly, this structure is really great to understand the business and manage, because all files related to a feature are grouped together. If you hired a new person and they are required to work in the **finance** module, they don't need to check the **hr** module. (It's not always true, but it works in certain cases. My point is it's easier to work within a feature's folder without jumping around the project.) Also, this benefit makes it easier to delete a feature or promote it to a new application, which was a nightmare with a type-based folder structure.

Secondly, as the project grows, new features don't clutter up unrelated areas. If you start to work on an "Orders" module, it will be fully isolated, and you won't need to worry about your code mixing with HR or Finance.

Finally, shared code lives in a clear location, and features are less likely to depend on each other's internals. It's not 100% true, but works in most cases. I will mention in the next paragraph that sometimes one module needs to consume another module's functionality, and that's when things can get messy.

### Disadvantages

As mentioned in the previous paragraph, sometimes features can depend on each other's internals. Imagine there is a **trade** module, and after you create a trade invoice, you need to call a function from the finance module to make the payment. This logic breaks the motivation behind the feature-based structure, as one feature depends on another one, and they are not isolated anymore. You can think to move this functionality to the `shared` folder, but then a functionality related to finance will sit in the **shared** folder, instead of **finance**. I would say it's one of the main constraints of the feature-based structure in large scale applications.

Secondly, if not managed carefully, some logic might get duplicated across feature folders. Especially at rush times or with short deadlines, when you tweak code reviews, you can easily find some functionality (`utils/disableScroll.tsx`) defined in 2 modules instead of the shared folder.

Finally, if you have work which covers all components or all hooks, this structure is less predictable by type. It means if you need to check all components, you need to visit each feature's components folder instead of having a single components folder.

Feature-based folder structure is ideal for most medium sized projects. For large projects, sometimes it raises questions as mentioned before, like should features only use code in the `shared` folder, or is it okay for one feature to directly import code from another? What if the trade module has a small feature that after a trade operation, it's required to call a finance operation? Without clear rules, you can accidentally create tangled dependencies between features and suddenly lose the main benefit this structure brings. In addition, over time, a single feature folder can become bloated as new components, hooks, and logic are added. It's not always obvious when a feature has grown too large and should be split up into smaller sub-features or reorganized for clarity.

## What about Feature-Sliced Design (FSD)?

You might have heard about Feature-Sliced Design (FSD). It's a relatively new, layered architectural approach that's gaining popularity for organizing large-scale frontends. FSD introduces concepts like "layers" (app, pages, widgets, features, entities, shared) and "slices" for domain grouping, and enforces clear, strict boundaries between them.

I haven't used Feature-Sliced Design (FSD) in a production project myself yet. I'm still learning about it and exploring how it works.
