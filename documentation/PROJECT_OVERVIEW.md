# Project Overview

## What the System Does
The application is a web-based training planning and exercise management platform. It enables authenticated users to organize exercises, methods, and grouped configurations; build structured workout sheets; assemble multi‑day training schedules; and track activity and progress. A modular dialog‑driven UI supports efficient creation, filtering, and updating of training resources, while persisted data is managed through Prisma and a relational database.

## Main Purpose & Goals
- Provide a streamlined, configurable workflow for planning structured training programs.
- Centralize exercise, method, and grouping metadata to reduce duplication and inconsistency.
- Enable rapid creation and reuse of workout sheets across training schedules.
- Support progressive refinement (edit sheets, adjust schedules) without friction.
- Offer a responsive, accessible UI with clear feedback (toasts, confirmations) to enhance user confidence.
- Facilitate eventual extensibility (additional activity metrics, analytics, or coaching features) via a clean service and schema layer.

## Primary Audience
- Individual trainees seeking organized training plans.
- Coaches or instructors managing small cohorts, needing reusable exercise catalogs and schedules.
- Fitness enthusiasts iterating on personalized strength or conditioning programs.
(If role differentiation is expanded later, the current architecture allows extension for coach vs. athlete permissions.)

## Main Features
- Authentication & Session Management (NextAuth) with support for credential-based login and password recovery flows.
- Exercise Catalog: Manage exercises, categories, groups, and configurable parameters (e.g., variations, groupings).
- Methods Management: Define and edit training methods to standardize protocol descriptions.
- Workout Sheets: Create, autocomplete, filter, and manage structured templates for workouts.
- Training Schedule Wizard: Guided multi-step creation of a schedule referencing workout sheets and planned workout sequencing.
- Activity Tracking: Lightweight tracking utilities for logging or triggering domain events (foundation for future analytics).
- Profile Management: User profile endpoints and UI components.
- Dialog & Form Components: Reusable modal dialogs (exercise, method, schedule, confirmation) enhancing consistency.
- Filtering & Pagination Hooks: Custom hooks to handle dataset navigation and query refinement (e.g., workout sheet filters).
- Responsive Layout & Mobile Adaptation: Hooks and layout components for adaptive navigation (drawer, mobile detection).
- Feedback & UX Utilities: Toast notifications, motion variants for animated transitions, and confirmation dialogs.
- Data Layer: Prisma schema-based persistence, migrations for evolving domain model, and seeding logic for initial data bootstrap.

## High-Level User Interaction Flow
1. Access & Authentication: User lands on the site; unauthenticated users are directed to login (with a forgot password option). Successful authentication establishes a session via NextAuth.
2. Landing & Navigation: After login, the Home page gives an overview and navigation entry points (Exercises, Methods, Workout Sheets, Training Schedule).
3. Catalog Exploration: User browses Exercises and Methods, optionally filtering via category/group dialogs; may add or modify entries through dialog components.
4. Workout Sheet Construction: User creates or edits a workout sheet (using autocomplete and dialogs), defining structured sets of exercises and method references.
5. Schedule Assembly: Using the Training Schedule Wizard, the user selects or sequences workout sheets into a multi-day or multi-week schedule.
6. Tracking & Iteration: Activity tracker utilities record interactions (foundation for future metrics). User adjusts sheets or schedule as training evolves.
7. Profile Updates: User updates profile details (where supported) via profile components.
8. Persistence & Feedback: Each create/update flows through API routes to Prisma-backed services; successful operations return standardized API responses and trigger toast feedback.
9. Continuous Refinement: User repeatedly iterates—adding new exercises, refining methods, adjusting schedules—without rebuilding prior structures.

## Architectural Highlights (High-Level)
- Frontend: Next.js (App + Pages), TypeScript, Tailwind CSS for styling, component-driven dialogs/layout.
- State & Interaction: Custom React hooks (loading state, pagination, mobile detection, toast notifications, filtering) for cohesive UX patterns.
- Backend/API: Next.js API routes orchestrate CRUD operations for exercises, methods, groups, sheets, schedules, and user profile.
- Data Persistence: Prisma schema defines relational entities (e.g., exercises, categories, workout sheets, schedules). Migrations ensure controlled evolution.
- Extensibility: Service modules (e.g., training-sheet-service) encapsulate domain logic, enabling future additions (analytics, versioning, coaching roles) with minimal disruption.

## Assumptions & Scope Notes
- Current evidence of registration UI is limited; user provisioning may be handled externally or planned for later.
- Role-based authorization appears minimal now; expansion (coach vs. trainee) would slot into auth-config and API guard layers.
- Activity tracking is foundational rather than fully analytical at this stage.

---
This overview is derived from the code structure, domain artifacts (Prisma schema & migrations), and available UI/service modules. It is intended as a baseline for extended architectural or requirements documentation.
