# Social Wishlist App — Roadmap

## Mission
Build a production-like social wishlist web application for the test assignment.

A user creates a wishlist, adds gift items, and shares a public link.
Friends can reserve gifts or contribute money toward expensive items.

Core privacy rule:
the wishlist owner must not see who reserved a gift or who contributed money.

Core technical rule:
the application must support real-time updates without page reload.

---

## Scope Rules

We follow MVP-first delivery.

Allowed:
- only features required by the assignment
- minimal UX improvements that reduce friction
- safe engineering decisions that improve stability

Not allowed:
- extra modules outside the assignment
- premature optimization
- unnecessary architectural expansion
- optional features before core flows are complete

---

## Approved Tech Stack

Frontend:
- Next.js
- React
- Tailwind CSS

Backend:
- Supabase
  - PostgreSQL
  - Auth
  - Realtime
  - Storage if needed

Deployment:
- Vercel

AI-assisted development:
- Cursor / Claude Code / ChatGPT

---

## Product Requirements

### R1. User account
The user can sign up and sign in using email and password.

### R2. Wishlist management
The owner can:
- create a wishlist
- set title and description
- add items
- edit items
- remove items

### R3. Item data
Each item supports:
- title
- URL
- price
- image

### R4. Public sharing
Each wishlist has a public link.
Visitors can open it without registration.

### R5. Gift reservation
A visitor can reserve a gift so it is not duplicated.

### R6. Group contribution
Expensive gifts can accept contributions from multiple people.
A progress bar shows how much has been collected.

### R7. Real-time updates
All viewers see reservation and contribution updates instantly.

### R8. Surprise protection
The owner can see status and totals, but cannot see identities of reservers or contributors.

---

## Product Decisions

### D1. Two item modes
Each item supports one of two modes:

1. single_gift
- one person reserves the item

2. group_gift
- many people contribute toward the target amount

Reason:
this cleanly matches the assignment and simplifies UX.

### D2. Public page without forced auth
Visitors can view the wishlist through a public link without registration.

Reason:
lower friction and matches assignment requirements.

### D3. Owner sees aggregate data only
The owner sees:
- reserved / not reserved
- collected amount
- contributor count

The owner does not see:
- names of reservers
- names of contributors
- individual contribution amounts

Reason:
preserve surprise.

### D4. Mobile-first layout
The public page and dashboard must work well on mobile.

Reason:
explicit requirement and common reviewer check.

---

## Edge Cases To Support

The application must safely handle:

- empty wishlist
- missing item image
- missing item price
- broken or removed external link
- already reserved single gift
- concurrent reservation attempts
- contribution amount greater than remaining target
- owner opening the public link to their own wishlist

---

## Development Stages

## Stage 0 — Planning
Tasks:
- create roadmap.md
- confirm MVP scope
- confirm stack

Definition of Done:
- roadmap committed
- stack fixed
- no unresolved scope ambiguity

---

## Stage 1 — Foundation
Tasks:
- initialize Next.js app
- install Tailwind
- connect Supabase
- configure environment variables
- prepare base folder structure

Definition of Done:
- project runs locally
- Supabase client connected
- clean base structure exists

---

## Stage 2 — Data & Auth
Tasks:
- implement email/password auth
- create database schema
- create access policies
- prepare basic profile handling

Definition of Done:
- user can sign up and sign in
- core tables created
- data access is safe enough for MVP

---

## Stage 3 — Owner Flow
Tasks:
- create dashboard
- create wishlist
- list user wishlists
- add item
- edit item
- delete item

Definition of Done:
- owner can fully manage their wishlist content

---
## Stage 4 — Public Wishlist Flow
Tasks:
- create public wishlist route
- display wishlist by public link
- allow anonymous viewing
- show item cards and statuses

Definition of Done:
- public wishlist is accessible and usable without login

---

## Stage 5 — Reservation & Contribution Logic
Tasks:
- implement single gift reservation
- implement group gift contributions
- calculate totals
- display progress bar
- prevent duplicate reservation conflicts

Definition of Done:
- core business logic works correctly

---

## Stage 6 — Realtime
Tasks:
- sync reservation changes in real time
- sync contribution changes in real time
- update statuses and totals without reload

Definition of Done:
- at least two open clients see instant updates

---

## Stage 7 — Product Polish
Tasks:
- improve mobile responsiveness
- add empty states
- add fallback image logic
- improve error handling
- improve UI consistency

Definition of Done:
- app feels stable and presentable
- no obvious broken states in common flows

---

## Stage 8 — Delivery
Tasks:
- deploy to Vercel
- prepare README
- verify GitHub repository structure
- prepare 3–5 minute demo flow

Definition of Done:
- live link works
- repository is clean
- submission package is ready

---

## Final Deliverables

Required:
- deployed application
- GitHub repository
- short video walkthrough

Must demonstrate:
- wishlist creation
- public link sharing
- gift reservation
- group contribution
- real-time updates
- surprise protection logic
- product decisions and edge-case handling