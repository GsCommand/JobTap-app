# CLAUDE.md

# JobTap.app

JobTap is a mobile-first CRM and workflow app for solo home-service operators and small field-service businesses.

Examples include:

- pressure washing
- paver sealing
- lawn care
- junk removal
- window cleaning
- exterior cleaning
- handyman services
- similar one-person or small-crew service businesses

JobTap is being built for both iPhone and Android.

The product exists to help owner-operators run a good, honest, efficient business without needing to learn bloated software.

Claude should produce senior-level output while minimizing tokens, wasted code, unnecessary abstraction, and implementation drag.

---

# Core Mission

Always optimize for:

1. Faster workflow
2. Fewer taps
3. Lower cognitive load
4. Mobile usability
5. Reliability in the field
6. Fast shipping
7. Production-quality code
8. Simple maintenance

If multiple solutions are valid, choose the one with:

- fewer files
- fewer lines
- fewer moving parts
- smaller diff
- better mobile UX
- easier maintenance

Do not choose technical elegance over a faster real-world workflow.

---

# Product Reality

JobTap is still evolving.

Some product decisions are firm:
- mobile-first
- field-first
- solo-operator focused
- simple workflow over feature depth
- fast MVP shipping
- cross-platform on iOS and Android

Some product decisions are still flexible:
- final color system
- exact home screen layout
- final card styling
- some navigation and module emphasis
- some feature presentation details

Claude must treat evolving design decisions as flexible unless the user clearly says they are finalized.

Do not harden temporary design choices into permanent implementation rules.

---

# How Claude Should Think

The user usually wants the fastest realistic path to a working feature.

Claude should behave like a senior product-minded mobile engineer building an MVP under real constraints.

Claude should:

- prefer focused patches
- preserve working code
- avoid unnecessary refactors
- preserve the existing style unless the request changes it
- optimize for speed of shipping
- keep implementation practical
- make reasonable assumptions and continue

Do not behave like an enterprise architect.

Do not create architecture for imaginary future scale.

---

# Core Operating Rules

1. Never rewrite large files unless absolutely necessary.
2. Prefer small, focused patches.
3. Preserve existing naming, structure, imports, and style when possible.
4. Only modify code directly related to the request.
5. Never introduce a new abstraction unless it will likely be reused 3+ times.
6. Never create extra files unless clearly needed.
7. Do not over-explain.
8. Avoid speculative refactors.
9. Avoid boilerplate unless required.
10. Keep changes easy to paste into the existing codebase.
11. Assume the user wants the smallest working solution first.
12. Prefer simple patterns over clever patterns.
13. Avoid "cleanup" work unless it directly improves the requested feature.
14. Do not silently redesign unrelated parts of the app.

Bad:
- rewriting an entire large screen for a small UI change
- introducing Redux, CQRS, event buses, or microservices
- splitting a simple feature into many files
- inventing generic abstractions too early
- restyling unrelated screens during a logic change

Good:
- replacing one section
- patching one screen
- adding one route
- updating one service
- adding one small reusable component when clearly justified

---

# Required Response Style

For code requests, Claude should use patch-style output whenever possible.

Preferred format:

File: src/screens/HomeScreen.tsx

Replace this block:

```tsx
// old code
```

With:

```tsx
// new code
```

Why:

- reduces taps
- improves scan speed
- preserves the current screen structure

For larger work:

- break the change into small steps
- show only the next file or next few files
- do not output unrelated code
- do not output full files unless explicitly requested

Always prefer patch-style output over full rewrites.

When full files are explicitly requested, keep them clean, production-ready, and minimal.

---

# Product Priorities

Current priority order:

1. Leads
2. Clients
3. Quotes
4. Jobs
5. Calendar
6. Before / After Photos
7. Review Request Automation
8. Measure Tool
9. Recurring Reminders
10. Social Posting

Do not spend meaningful time on later-stage features before the core workflow works.

Primary workflow:

Lead -> Client -> Quote -> Job -> Complete -> Review Request -> Reminder

Every major screen and backend flow should reinforce that path.

---

# JobTap User Mindset

The user is usually:

- busy
- outside
- using one hand
- moving between jobs
- dealing with sunlight glare
- on weak cellular service
- trying to do something quickly
- not interested in learning complex software

Every screen should answer:

- What matters most right now?
- What should the user do next?
- Can this be done in fewer taps?
- Can this be understood instantly?

Claude should always optimize for field reality, not desk-worker assumptions.

---

# Cross-Platform Rules

JobTap must work cleanly on both iOS and Android.

Claude should:

- prefer cross-platform solutions first
- avoid platform-specific code unless there is a real reason
- keep layouts stable on small and tall phones
- support safe areas
- support keyboard avoidance
- support bottom tab spacing
- avoid assumptions that only hold on iPhone
- avoid UI that behaves badly on Android

When changing:

- navigation
- bottom tabs
- bottom sheets
- modals
- date pickers
- camera flows
- maps
- image upload
- permissions

Always think through both iOS and Android behavior.

Prefer consistent workflow over platform-specific purity.

---

# UX Principles

The app should feel:

- calm
- fast
- trustworthy
- simple
- mobile-first
- contractor-friendly
- easy to read quickly

Prefer:

- large tap targets
- short labels
- strong spacing
- clear hierarchy
- simple flows
- visible next steps
- bottom-sheet or modal treatment for secondary actions when appropriate

Avoid:

- clutter
- small text
- deep nesting
- tiny hit areas
- long forms
- hidden actions
- multiple competing primary actions
- desktop-style dense interfaces

Every screen should have one obvious next move.

---

# Visual Design Rules

Visual direction should feel:

- calm
- trustworthy
- simple
- modern
- contractor-friendly
- readable outdoors

Prefer:

- strong contrast
- generous spacing
- rounded surfaces
- clean card-based layouts
- clear hierarchy
- minimal clutter

Do not lock the app into one permanent palette unless the design system is finalized.

If design is still evolving:

- preserve the current palette unless the request is specifically about design
- prefer semantic color tokens over hardcoded hex values
- avoid scattering raw colors across screens
- centralize reusable colors in one theme file or token system

Prefer this mindset:

1. structure first
2. usability second
3. styling third
4. visual polish last

Freeze behavior before freezing styling.

---

# Design Flexibility Rules

If the user is still exploring:

- layout direction
- branding
- card styles
- color systems
- home screen modules
- visual hierarchy options

Claude should:

- preserve flexibility
- avoid hardcoding temporary design assumptions
- optimize the structure and flow first
- treat styling decisions as adjustable unless explicitly finalized

Do not write code that makes visual changes harder than necessary later.

Prefer:

- theme tokens
- reusable spacing
- semantic naming
- loosely coupled layout sections

Avoid:

- styling logic spread everywhere
- one-off visual hacks
- overfitting to a temporary mockup unless asked

---

# Home Screen Rules

The Home screen is still evolving.

Claude should not assume the exact final layout unless the user explicitly asks for it.

Home should generally prioritize some mix of:

- what needs attention today
- the quickest next action
- active jobs or schedule visibility
- leads / quotes / revenue visibility
- recent activity

When modifying Home:

- preserve the current direction unless asked to redesign it
- optimize for scan speed and low tap count
- keep the layout understandable in a few seconds
- avoid turning Home into a feature dump
- make the most likely next action easy to reach

If Quick Create exists, current preferred actions are:

- New Lead
- Add Client
- New Quote
- Block Off Time

This is a current product preference, not a permanent architectural rule.

If the product direction changes, Claude should follow the new direction without fighting the old one.

---

# Bottom Navigation Rules

Preferred bottom navigation stays simple:

- Home
- Jobs
- Clients
- Calendar
- More

Never exceed 5 primary tabs unless the user explicitly changes the navigation model.

Everything else belongs:

- inside job detail
- inside client detail
- inside a create menu
- inside More / Settings

Do not put secondary actions in the primary bottom nav.

---

# Preferred Screen Structure

Preferred order inside a screen file:

```
// imports
// constants
// component
// handlers
// styles
```

Preferred component structure:

```tsx
export default function ScreenName() {
  // hooks
  // derived state
  // handlers

  return (
    <Screen>
      <Header />
      <Content />
      <PrimaryAction />
    </Screen>
  )
}
```

Try to keep screens under roughly 500 lines.

If a screen grows too large:

- extract one reusable section or helper
- do not over-split the file
- avoid turning one screen into an unnecessary mini-framework

---

# Preferred Reusable Components

Prefer these patterns when reuse is justified:

- Card
- SectionHeader
- EmptyState
- StatusBadge
- KPIChip
- BottomSheetActionList
- PrimaryButton
- SecondaryButton

Do not create a reusable component until it is likely to be reused 3+ times.

Small duplication is better than premature abstraction.

---

# Frontend Stack

Preferred mobile stack for MVP:

- React Native
- Expo
- TypeScript
- React Navigation
- Zustand
- React Query

Prefer:

- Zustand for shared app state
- React Query for server state
- centralized styling or theme tokens
- simple reusable components

Do not default to web-first patterns.

Do not introduce Redux unless there is an unusually strong reason.

---

# State Management Rules

Use:

- local component state for temporary UI state
- Zustand for shared client state
- React Query for API/server data

Do not:

- put server data in Zustand
- prop-drill more than 2 levels unless trivial
- store derived values unnecessarily
- duplicate the same state across layers

Prefer simple data flow.

---

# Native Feature Rules

For:

- camera
- maps
- photos
- notifications
- file uploads
- permissions
- background behavior

Prefer Expo-supported APIs first during MVP.

Avoid custom native modules unless there is no practical alternative.

When implementing native features:

- mention permission requirements when relevant
- handle denied permissions
- include empty states
- include loading states
- include failure states
- include retry behavior when useful
- build a fallback, not just a happy path

Do not assume permissions will be granted.

Do not build native-risk features in a way that makes iOS work and Android flaky.

---

# Mobile Performance Rules

Optimize for real field conditions:

- weak cellular service
- older phones
- bright sunlight
- short usage windows
- quick entry and exit between tasks

Prefer:

- fast screen load
- minimal re-renders
- small focused lists
- pagination where needed
- memoized expensive calculations
- short interaction paths
- optimistic UI only when failure is recoverable

Avoid:

- heavy animations
- huge nested lists
- long blocking spinners
- expensive background work
- unnecessary re-fetching
- giant screens with too much logic in render

Performance matters because field users are impatient and often distracted.

---

# Offline Rules

JobTap should remain usable with poor or no service whenever reasonably possible.

For important workflows, prefer:

- local draft persistence
- retryable requests
- persisted unsent work
- visible sync state for important records
- graceful reconnect recovery

Especially for:

- leads
- quotes
- jobs
- notes
- photos

Do not assume a perfect connection.

Do not make core field workflows fragile.

---

# Form Rules

Forms should always:

- be short
- be easy to complete one-handed
- use mobile-appropriate keyboard types
- use clear labels
- have large touch targets
- avoid unnecessary fields

Every form should include:

- loading state
- disabled submit state
- validation
- success state
- error state

Prefer inline validation over alert-only validation.

Do not rely only on popups for errors.

Example mindset:

```tsx
disabled={!canSubmit || isSaving}
```

Money must be stored as integer cents, never floats.

Example:

```
totalPriceCents: 12500
```

Dates should be stored in UTC ISO format when persisted.

Example:

```
2026-04-18T14:30:00Z
```

Display times in the user's local timezone.

---

# List Rules

Every list screen should support:

- loading state
- empty state
- error state

Prefer:

- important records first
- recent records second
- archived or lower-priority records last

Avoid dense desktop-style tables on mobile.

Prefer stacked, readable cards or rows built for thumb use.

Lists should help users decide quickly, not study the screen.

---

# Naming Rules

Never use vague names like:

- data
- item
- temp
- value
- obj
- thing

Prefer names with business meaning:

- activeJob
- selectedClient
- quoteDraft
- scheduledDate
- recentLeads
- pendingQuotes
- todayJobs

Use names that explain real intent.

---

# File Structure Rules

Preferred structure:

```
/src
  /screens
  /components
  /features
  /store
  /services
  /hooks
  /utils
  /types
```

As the app grows, feature-first organization is preferred:

```
/features/leads
/features/clients
/features/quotes
/features/jobs
/features/measure
```

Do not reorganize the codebase unless the benefit is obvious and immediate.

Do not create folder structures that look impressive but slow shipping.

---

# Backend Philosophy

The backend should be:

- simple
- reliable
- cheap
- easy to maintain
- easy to reason about

Avoid premature microservices.

Prefer one clean backend until real scale demands more.

Preferred MVP stack:

- Node.js
- TypeScript
- PostgreSQL
- Prisma
- Express or Fastify
- Supabase or Railway
- S3-compatible storage for photos/files

Use:

- Fastify if performance matters
- Express if speed of development matters

---

# API Rules

Prefer REST for MVP.

Do not introduce GraphQL unless there is a strong reason.

Preferred route style:

```
GET    /jobs
POST   /jobs
GET    /jobs/:id
PATCH  /jobs/:id
DELETE /jobs/:id
```

Nested routes only when meaningful:

```
/jobs/:id/photos
/clients/:id/quotes
```

Controllers should stay thin.

Business logic belongs in services.

Preferred backend structure:

```
/routes
/services
/db
/middleware
```

Example:

```
jobs.route.ts
jobs.service.ts
jobs.schema.ts
```

---

# Database Rules

Core tables:

- users
- businesses
- leads
- clients
- jobs
- quotes
- invoices
- photos
- reminders
- automation_rules

Important relationships:

- one client -> many jobs
- one job -> many photos
- one quote -> one client
- one business -> many users

Prefer explicit columns over large JSON blobs unless flexibility is truly necessary.

Example MVP tables:

```
clients
- id
- business_id
- first_name
- last_name
- phone
- email
- address
- created_at

jobs
- id
- business_id
- client_id
- status
- service_type
- scheduled_at
- total_price_cents
- notes
```

---

# Measure Tool Rules

Build the Measure tool in this order:

1. Satellite trace mode
2. Camera tap mode
3. Drag / edit points
4. Save to quote or job
5. Multi-area support
6. Better AR later

Never start with advanced AR.

Preferred first implementation:

- map or satellite view
- user taps corners
- polygon is drawn
- square footage is calculated
- result is saved to quote or job

Do not over-engineer v1.

---

# Token-Efficient Code Rules

When generating code:

- include only changed code unless full file is explicitly requested
- avoid repeating unchanged imports unless needed
- avoid regenerating whole stylesheets unless required
- use short real sample data
- keep patches small and easy to paste
- do not output giant "complete refactors" unless explicitly requested

Bad:

- rewriting a full file for one button change

Good:

- "replace this block with this"

---

# Decision Rules For Existing Code

When the existing codebase is imperfect:

- follow the current working pattern unless it is actively hurting the requested change
- improve obvious local issues only if the change already touches them
- do not widen scope just because you notice something messy
- prefer consistency over idealism in MVP code

If the current pattern is bad but usable:

- patch it cleanly
- leave broad cleanup for a separate task

If the current pattern will break the requested feature:

- fix the smallest necessary layer
- briefly explain why

---

# Testing Rules

Every feature should be checked for:

- iOS behavior
- Android behavior
- loading state
- empty state
- error state
- denied permission state when relevant
- offline or weak-network behavior when relevant

Before marking a change complete, Claude should ask internally:

- Is this the fewest taps possible?
- Is this the smallest working implementation?
- Does this work in the field, not just on good Wi-Fi?
- Does this preserve flexibility where product decisions are still evolving?
- Would another senior engineer merge this immediately?

---

# Anti-Patterns To Avoid

Never:

- create enterprise architecture for MVP features
- add Redux, CQRS, event sourcing, or microservices without a real need
- over-explain obvious code
- create generic abstractions too early
- generate giant files full of boilerplate
- use vague variable names
- build mobile flows with too many steps
- hardcode temporary design decisions like they are final product law

Avoid:

- styling scattered across the app
- overbuilt component systems
- unnecessary custom hooks
- hidden logic inside reusable components
- feature work that ignores field conditions

---

# Definition of Done

A change is complete when:

- it is production-ready
- it is smaller and clearer than before
- it improves the workflow
- it reduces taps, confusion, or friction
- it avoids unnecessary complexity
- it works on both iOS and Android
- it is easy to paste into the existing codebase
- it does not over-lock still-evolving product decisions

If multiple valid solutions exist, choose the one with:

- smaller diff
- simpler code
- fewer files
- better mobile UX
- faster shipping
- more flexibility where design is still evolving
