## Feature-Sliced Design (FSD)

```
app/          — app setup: root files, providers, environment setup, global styles, routing
pages/        — route boundaries, page-level compositions (often 1:1 with routes)
widgets/      — composite UI blocks, each bundling multiple features/entities for a single piece of the UI (e.g. ContactsTableWidget, TradeOverviewWidget)
features/     — user-driven interactions or isolated complex logic (e.g. "add-contact", "create-trade", "submit-expense-report", "hire-employee")
entities/     — business domain objects/entities, reused in features/widgets (e.g. "contact", "trade", "finance", "employee")
shared/       — truly generic or cross-cutting code (UI kit, utilities, config, API base)
```

Feature-Sliced Design (often shortened to FSD) is a modern approach to scalable frontend architecture that builds on lessons from both type-based and feature-based structures. It's pretty new, but on their website there are many example applications already using this folder structure. It introduces new terms such as layers, slices and segments.

The motivation of feature-sliced design is to organize the code into layers, each with its own responsibility and strict import rules. Higher layers can depend only on lower layers, but not the other way around. For instance, you can import something from the entities folder within features, but you can't import something from the features folder into entities. Within each layer, code is separated by business domain or module. For example, in the case of `entities/trade` and `features/add-contact` — `trade` and `add-contact` are called slices. Each slice is then further organized by its technical purpose, such as **ui**, **model**, **api**, and **lib**.

### Advantages

As advantages, this folder structure has really strict boundaries, and each piece of business logic has a clear home. Team members always know where new code should go, and separation of concerns is explicit. If you are working on an ERP application with modules like contacts, trade, and HR, the most basic structure will be something like:

```plaintext
  pages/
    contacts/
      list/        # Route: /contacts/list
      detail/      # Route: /contacts/detail
    trade/
      dashboard/   # Route: /trade/dashboard
      orders/      # Route: /trade/orders
    hr/
      employees/   # Route: /hr/employees
      payroll/     # Route: /hr/payroll

  widgets/
    contacts/
      contact-list-widget/
    trade/
      trade-stats-widget/
    hr/
      employee-overview-widget/

  features/
    contacts/
      add-contact/
      edit-contact/
    trade/
      new-order/
      settle-invoice/
    hr/
      hire-employee/
      process-payroll/

  entities/
    contact/
      model/    # State, types, selectors for contact
      api/      # Network logic for contacts
      ui/       # Small, reusable UI (e.g., <ContactCard />)
    trade/
      model/
      api/
      ui/
    employee/
      model/
      api/
      ui/
```

Secondly, dependencies between features are better maintainable in this structure if you compare it with feature-based structure. `widgets/trade/new-operation` can consume `features/finance/new-payment` easily, and it doesn't break any rules of this folder structure. As boundaries are pretty clear, it makes the code easy to scale, refactor and even delete.

### Disadvantages

As you can see in examples, the structure and rules are unfamiliar to newcomers. People might need some training beforehand to fully meet with the project, and folder structure. As it's not newcomer-friendly, it's not ideal for simple projects. Imagine you are working on a side project and you try to apply this structure. Probably you will lose your motivation easily before seeing any clear result.

A common challenge is that teams may disagree about where one feature stops and another begins. For example, should authentication (login, registration, password reset) be a single `features/auth` slice, or is it better to split it into separate slices like `features/login`, `features/register`, and `features/reset-password`? These debates can result in inconsistent structures if everyone chooses their own approach. Because the structure is both folder-rich and type-rich, it's easy for different developers to argue for different ways to organize features.

### Final thought

We need to accept that none of these architectures are "the best"; each comes with its own advantages and disadvantages. The final decision depends on the project's needs, requirements, and context. It's easier to change the structure from the first to the last (for example, to refactor a type-based folder structure into a feature-based one), so if you are not sure which approach to follow, I recommend starting with a type-based structure and deciding on the final structure as the project grows and you have a clearer picture.
