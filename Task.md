# Build Spendly — Personal Finance PWA

You are an expert full-stack engineer and UI/UX designer.

I want you to build a **production-quality Personal Finance Progressive Web App (PWA)** called **Spendly**.

This is a **personal-use application**, not a SaaS product. The primary target is **mobile phones**, and I want to be able to install it on my phone from the browser as a PWA.

Do not create a basic tutorial-style expense tracker. Build something that feels like a polished modern mobile application.

---

## 1. Core Goal

Spendly should allow me to:

* Track income
* Track expenses
* Categorize transactions
* View spending analytics
* Set monthly budgets
* Track financial goals
* Search and filter transactions
* View spending trends
* Work completely offline
* Install the application on my phone
* Store data locally
* Export my financial data
* Import previously exported data

The application should feel fast and native-like on mobile.

---

# 2. Recommended Technology

Use a modern web stack.

Preferred:

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui where appropriate
* IndexedDB for local persistence
* Dexie.js for IndexedDB abstraction
* Recharts for charts
* Vite PWA plugin / Workbox for PWA functionality
* Lucide icons

Do NOT introduce unnecessary backend infrastructure.

This application should be **local-first**.

The initial version should work without:

* Firebase
* Supabase
* PostgreSQL
* MySQL
* external authentication
* external APIs

All financial data should remain on the device.

---

# 3. Important Architecture Requirement

Build Spendly as an **offline-first PWA**.

The application must continue working when:

* There is no internet connection
* The browser is offline
* The user closes the browser
* The phone is restarted

Transactions must persist between sessions.

Use IndexedDB through Dexie.

Create a clean data layer instead of directly accessing IndexedDB throughout React components.

For example:

```text
src/
  components/
  pages/
  hooks/
  services/
  db/
  types/
  utils/
  lib/
```

Keep business logic separate from UI.

---

# 4. Mobile-First Design

Design this primarily for:

* iPhone
* Android phones

Desktop should still work, but mobile is the priority.

The interface should feel like a real finance application.

Avoid:

* giant desktop dashboards
* excessive cards
* unnecessary gradients
* excessive animations
* cluttered interfaces
* tiny buttons
* tiny text

Use:

* generous spacing
* rounded cards
* clear hierarchy
* large touch targets
* bottom navigation
* mobile-friendly forms
* smooth transitions

The UI should feel premium, minimal, modern, and practical.

---

# 5. App Navigation

Use a mobile bottom navigation bar.

Navigation:

```text
Home
Transactions
Budgets
Analytics
Settings
```

The currently selected tab should be clearly visible.

Use Lucide icons.

---

# 6. Home Dashboard

The Home screen should provide an immediate overview of finances.

Include:

### Current balance

Example:

```text
₱24,580.00
Current Balance
```

Calculate:

```text
Total Income - Total Expenses
```

---

### Monthly summary

Display:

```text
Income       ₱35,000
Expenses     ₱18,420
Remaining    ₱16,580
```

---

### Spending progress

Show a visual indicator of how much of the monthly budget has been used.

Example:

```text
Monthly Budget

₱18,420 / ₱25,000

████████████░░░░░
73.7%
```

---

### Recent transactions

Show the latest 5 transactions.

Each transaction should display:

* category icon
* transaction title
* category
* date
* amount

Expenses should visually distinguish themselves from income.

---

### Quick Add button

Add a prominent floating action button:

```text
+
```

Tapping it opens the transaction creation interface.

---

# 7. Add Transaction

Create a beautiful mobile-friendly transaction form.

Fields:

```text
Type
  Expense
  Income

Amount
₱ 0.00

Category
Food

Description
Lunch at restaurant

Date
Today

Payment Method
Cash
GCash
Bank
Credit Card
Other
```

The form should make entering transactions extremely fast.

Do not force the user through unnecessary steps.

---

# 8. Transaction Types

Support:

```text
Expense
Income
```

Potential future support should be considered in the architecture for:

```text
Transfer
Refund
```

but don't overcomplicate the initial implementation.

---

# 9. Default Categories

Create sensible default categories.

Expenses:

```text
Food
Transportation
Shopping
Bills
Entertainment
Health
Gym
Education
Travel
Subscriptions
Family
Other
```

Income:

```text
Salary
Freelance
Business
Investment
Gift
Other
```

Allow the user to create custom categories.

Allow:

* rename
* delete
* choose icon
* choose color

Do not allow deleting a category if existing transactions depend on it unless you provide a safe reassignment flow.

---

# 10. Transactions Screen

Create a complete transaction history.

Features:

* Search
* Filter by category
* Filter by type
* Filter by date
* Filter by payment method
* Sort by newest/oldest
* Edit transaction
* Delete transaction

Group transactions by date.

Example:

```text
TODAY

🍔 Lunch
Food
₱250

🏍️ Gas
Transportation
₱500


YESTERDAY

💳 Netflix
Subscriptions
₱549
```

---

# 11. Budgets

Create a dedicated Budgets screen.

Allow monthly budgets.

Example:

```text
August 2026

Overall Budget
₱25,000

Spent
₱18,420

Remaining
₱6,580
```

Allow category budgets:

```text
Food
₱6,000
₱4,250 spent

Transportation
₱4,000
₱2,100 spent

Entertainment
₱2,000
₱1,750 spent
```

Show progress indicators.

If a category exceeds its budget:

```text
⚠️ Over budget
```

Provide sensible visual feedback without making the interface stressful.

---

# 12. Analytics

Create a polished analytics dashboard.

Include:

### Spending by category

Use a donut/pie chart.

Example:

```text
Food           32%
Transportation 18%
Bills          15%
Shopping       12%
Other          23%
```

---

### Monthly spending

Create a bar chart showing spending across recent months.

Example:

```text
Mar  ₱18k
Apr  ₱21k
May  ₱17k
Jun  ₱23k
Jul  ₱19k
Aug  ₱18k
```

---

### Spending trend

Show whether spending is:

* increasing
* decreasing
* stable

Example:

```text
↓ You're spending 8.4% less than last month.
```

---

### Top spending categories

Display the categories where the user spends the most.

---

# 13. Financial Goals

Add a Goals section.

Allow the user to create goals.

Example:

```text
New MacBook

₱30,000 / ₱60,000

50%

Target:
December 2026
```

Features:

* Goal name
* Target amount
* Current amount
* Target date
* Add contribution
* Edit
* Delete
* Progress visualization

---

# 14. Recurring Transactions

Support recurring transactions.

Examples:

```text
Netflix
₱549
Monthly

Internet
₱1,500
Monthly

Salary
₱40,000
Monthly
```

Support:

* Daily
* Weekly
* Monthly
* Yearly

The architecture should make this feature reliable even while offline.

---

# 15. Settings

Create a Settings screen.

Include:

### Appearance

```text
System
Light
Dark
```

### Currency

Default:

```text
PHP ₱
```

Allow future support for:

* USD
* EUR
* GBP
* JPY
* etc.

### Data

```text
Export Data
Import Data
Clear All Data
```

### Categories

Manage categories.

### Security

Prepare the architecture for future:

```text
Biometric Lock
PIN Lock
```

Do not implement fake security.

---

# 16. Export / Import

This is important.

Allow users to export all Spendly data to a JSON file.

Example structure:

```json
{
  "version": 1,
  "exportedAt": "...",
  "transactions": [],
  "categories": [],
  "budgets": [],
  "goals": [],
  "settings": []
}
```

Allow importing the same file later.

Validate imported data before inserting it into IndexedDB.

Handle invalid/corrupted files gracefully.

Do not overwrite existing data without confirmation.

---

# 17. PWA Requirements

This is one of the most important requirements.

Spendly must be a proper installable PWA.

Implement:

* Web App Manifest
* Service worker
* Offline caching
* App icons
* Splash/loading behavior
* Standalone display mode
* Theme color
* Proper mobile viewport
* Offline fallback

The manifest should have:

```text
name: Spendly
short_name: Spendly
display: standalone
```

Create appropriate app icons.

Make sure Chrome/Android and Safari/iOS can recognize the app as installable where supported.

Add an in-app installation prompt/instructions when appropriate.

---

# 18. PWA Install Experience

Create a small component that detects whether the app is already installed.

If not installed, provide an unobtrusive option:

```text
Install Spendly
Use Spendly like a native app.
```

For Android/Chrome, use the appropriate install event when available.

For iOS Safari, show instructions such as:

```text
Tap Share
→ Add to Home Screen
```

Do not show the installation prompt repeatedly after the user dismisses it.

---

# 19. Offline Experience

The app must clearly communicate offline status when appropriate.

Example:

```text
You're offline
Your data is still available.
```

But don't make offline status annoying.

All core features must remain usable offline:

* Add transaction
* Edit transaction
* Delete transaction
* View dashboard
* View analytics
* Manage budgets
* Manage goals
* Settings
* Export data

---

# 20. Data Model

Create strongly typed TypeScript models.

Example:

```ts
Transaction {
  id
  type
  amount
  categoryId
  description
  date
  paymentMethod
  createdAt
  updatedAt
}
```

```ts
Category {
  id
  name
  type
  icon
  color
  createdAt
}
```

```ts
Budget {
  id
  month
  categoryId
  amount
}
```

```ts
Goal {
  id
  name
  targetAmount
  currentAmount
  targetDate
  createdAt
  updatedAt
}
```

```ts
RecurringTransaction {
  id
  type
  amount
  categoryId
  description
  frequency
  nextOccurrence
  active
}
```

Use UUIDs or another robust ID strategy.

Store dates consistently.

Avoid floating-point currency errors. Store monetary values safely, preferably as integer minor units (e.g. centavos) internally.

---

# 21. Currency

The default currency is Philippine Peso.

Display:

```text
₱1,250.00
```

Use proper currency formatting through Intl.NumberFormat.

Do not manually concatenate the currency symbol everywhere.

---

# 22. Seed / Demo Data

On first launch, give the user the option to load sample data.

Example:

```text
Welcome to Spendly

Start with empty data
or
Explore with demo data
```

Demo data should make the dashboard and analytics immediately look populated.

Do not force demo data onto the user.

---

# 23. Empty States

Every screen must have a useful empty state.

For example:

```text
No transactions yet

Start tracking your spending
by adding your first transaction.

+ Add Transaction
```

Do not leave blank screens.

---

# 24. Loading / Error States

Implement proper:

* loading states
* error states
* confirmation dialogs
* destructive action confirmations

Example when deleting all data:

```text
Delete all Spendly data?

This cannot be undone unless you have an exported backup.

Cancel
Delete Everything
```

---

# 25. UX Details

Make interactions feel polished.

Include:

* subtle animations
* button press feedback
* modal transitions
* toast notifications
* skeleton loading where appropriate
* smooth navigation
* accessible labels
* keyboard-friendly forms

Do not over-animate.

Performance is more important than flashy effects.

---

# 26. Accessibility

Follow good accessibility practices.

Use:

* semantic HTML
* accessible buttons
* proper labels
* sufficient contrast
* keyboard navigation
* screen-reader-friendly labels

Do not rely solely on color to communicate financial status.

---

# 27. Responsive Design

Mobile first:

```text
320px+
```

Support:

* iPhone
* Android
* tablets
* desktop browsers

On desktop, the UI can expand into a dashboard layout.

On mobile, prioritize the bottom navigation and one-handed use.

---

# 28. Security / Privacy

This is a personal finance application.

Do NOT send financial data to external services.

No analytics tracking.

No advertising.

No unnecessary external APIs.

Clearly make the application local-first.

If you add future cloud synchronization, design it so it can be added later without rewriting the entire data layer.

---

# 29. Performance

Optimize for mobile.

Avoid unnecessary React re-renders.

Use memoization only where useful.

Lazy-load heavy pages/components where appropriate.

Keep the initial bundle reasonable.

Charts should not make the application sluggish.

---

# 30. Visual Direction

The visual style should be:

```text
Modern
Minimal
Premium
Financial
Mobile-first
Clean
Calm
Professional
```

Think:

* modern banking application
* modern fintech dashboard
* Apple-like simplicity
* excellent typography
* subtle depth
* restrained use of color

Do not make it look like an admin dashboard template.

---

# 31. App Branding

Name:

# Spendly

Tagline:

```text
Know where your money goes.
```

Create a simple text/icon-based logo using CSS/SVG.

Do not depend on an external logo service.

Use a consistent visual identity throughout the application.

---

# 32. Development Quality

Write clean, maintainable TypeScript.

Avoid:

* giant components
* duplicated logic
* hardcoded financial calculations inside JSX
* unnecessary dependencies
* fake placeholder functionality
* TODO comments instead of implementation

Create reusable components.

Create reusable hooks for:

* transactions
* budgets
* analytics
* goals
* settings

---

# 33. Testing

Add tests for important financial logic.

At minimum test:

* balance calculation
* income calculation
* expense calculation
* budget calculation
* category totals
* monthly totals
* percentage calculations
* recurring transaction logic
* import validation

Financial calculations must be reliable.

---

# 34. README

Create a professional README.

Include:

* Spendly description
* Features
* Screenshots section placeholder
* Tech stack
* Architecture
* Local-first philosophy
* PWA installation instructions
* Development setup
* Build commands
* Testing commands
* Privacy statement
* Future roadmap

Make it look like a serious GitHub project.

---

# 35. GitHub Quality

Organize the project professionally.

Create:

```text
README.md
LICENSE
.gitignore
```

Do not commit:

* node_modules
* environment secrets
* local databases
* personal financial data
* generated build artifacts unless appropriate

Use meaningful commit-ready structure.

---

# 36. Important Development Rule

Before writing code:

1. Inspect the current directory.
2. Determine whether a project already exists.
3. If this is an empty directory, initialize the project.
4. Do not overwrite unrelated existing files.
5. Install only necessary dependencies.
6. Build incrementally.
7. Run the application.
8. Run tests.
9. Run a production build.
10. Fix all TypeScript/build errors.
11. Verify the PWA configuration.
12. Verify that IndexedDB persistence works.
13. Verify offline functionality.
14. Verify responsive behavior.

Do not stop after generating the initial UI.

The application must actually work.

---

# 37. Final Verification

Before considering the project complete, verify:

```text
[ ] npm install works
[ ] npm run dev works
[ ] npm run build works
[ ] TypeScript has no errors
[ ] Tests pass
[ ] PWA manifest works
[ ] Service worker works
[ ] App can be installed
[ ] App works offline
[ ] Transactions persist after refresh
[ ] Transactions persist after closing/reopening browser
[ ] Add transaction works
[ ] Edit transaction works
[ ] Delete transaction works
[ ] Income works
[ ] Expenses work
[ ] Budgets work
[ ] Analytics work
[ ] Goals work
[ ] Recurring transactions work
[ ] Export works
[ ] Import works
[ ] Dark mode works
[ ] Mobile layout works
[ ] Desktop layout works
[ ] No financial data leaves the device
```

---

# 38. Execution Style

Work autonomously.

Do not ask me to approve every small implementation decision.

Make reasonable engineering decisions yourself.

If you encounter an issue, investigate and fix it rather than stopping.

Prioritize a working application over explaining what you intend to build.

At the end, provide:

1. What you built
2. Important files created
3. Dependencies added
4. Commands to run it
5. How to install it on an iPhone/Android phone
6. Any remaining limitations

Start by inspecting the current directory and then begin building Spendly.
