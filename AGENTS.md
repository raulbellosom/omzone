# AGENTS

Quick operating guide for AI coding agents working in this repo.

## Scope and Working Areas

- Frontend canonical app: [sites/omzone-dev](sites/omzone-dev)
- Appwrite config and resources: [appwrite.json](appwrite.json), [appwrite/functions](appwrite/functions)
- Canonical product/backend docs: [sites/omzone-dev/docs/core](sites/omzone-dev/docs/core)
- Auth architecture details: [docs/auth/AUTH_ARCHITECTURE.md](docs/auth/AUTH_ARCHITECTURE.md)
- Reusable project skills: [.github/skills](.github/skills)

## Current Project Phase (Important)

This project is in late-stage delivery: prioritize bug fixes and completion of pending MVP features over broad refactors.

Use a minimal-change strategy:

1. Reproduce issue.
2. Apply smallest safe fix in the right feature/service layer.
3. Verify affected flows.
4. Update docs only when behavior or contracts changed.

## Start Here Before Coding

Read these first and do not contradict them:

1. Product truth: [sites/omzone-dev/docs/core/00_ai_project_context.md](sites/omzone-dev/docs/core/00_ai_project_context.md)
2. Backend constraints: [sites/omzone-dev/docs/core/02_backend_appwrite_requirements.md](sites/omzone-dev/docs/core/02_backend_appwrite_requirements.md)
3. DB schema canon: [sites/omzone-dev/docs/core/03_appwrite_db_schema.md](sites/omzone-dev/docs/core/03_appwrite_db_schema.md)
4. Roles and permissions: [sites/omzone-dev/docs/core/05_permissions_and_roles.md](sites/omzone-dev/docs/core/05_permissions_and_roles.md)
5. Functions catalog: [sites/omzone-dev/docs/core/06_appwrite_functions_catalog.md](sites/omzone-dev/docs/core/06_appwrite_functions_catalog.md)
6. Routes and flows: [sites/omzone-dev/docs/core/07_frontend_routes_and_flows.md](sites/omzone-dev/docs/core/07_frontend_routes_and_flows.md)
7. Env reference: [sites/omzone-dev/docs/core/08_env_reference.md](sites/omzone-dev/docs/core/08_env_reference.md)
8. Platform limits: [sites/omzone-dev/docs/core/09_appwrite_platform_limits.md](sites/omzone-dev/docs/core/09_appwrite_platform_limits.md)
9. Pending work checklist: [sites/omzone-dev/docs/core/10_master_plan_checklist.md](sites/omzone-dev/docs/core/10_master_plan_checklist.md)
10. i18n strategy: [sites/omzone-dev/docs/core/11_i18n_strategy.md](sites/omzone-dev/docs/core/11_i18n_strategy.md)
11. Mock data strategy: [sites/omzone-dev/docs/core/12_mock_data_strategy.md](sites/omzone-dev/docs/core/12_mock_data_strategy.md)
12. Appwrite sync strategy: [sites/omzone-dev/docs/core/13_appwrite_sync_strategy.md](sites/omzone-dev/docs/core/13_appwrite_sync_strategy.md)

## Non-Negotiable Business Rules

1. Payments are one-time only. No subscriptions, no recurring billing, no auto-renew logic.
2. Canonical roles are root, admin, client. Do not introduce customer as a role key.
3. Instructors are content entities in MVP, not authenticated dashboard users.
4. Frontend must not directly write sensitive commerce records (orders, bookings, client packages, payments, audit logs). Route through Appwrite Functions.
5. Do not hardcode mock arrays inside UI components. Use centralized mocks/services.

## Commands

Run commands from [sites/omzone-dev](sites/omzone-dev):

- npm run dev
- npm run build
- npm run preview

Functions are defined in [appwrite.json](appwrite.json) and use Node 20 runtime. Deploy with Appwrite CLI from repo root when needed.

## Implementation Guardrails

- Put UI/flow changes under feature domains in [sites/omzone-dev/src/features](sites/omzone-dev/src/features).
- Keep route authorization aligned with [sites/omzone-dev/src/routes/guards.jsx](sites/omzone-dev/src/routes/guards.jsx).
- Keep environment access centralized through [sites/omzone-dev/src/env.js](sites/omzone-dev/src/env.js).
- Keep admin-sensitive writes in Functions under [appwrite/functions](appwrite/functions).
- If schema changes are required, update schema docs first, then update [appwrite.json](appwrite.json), then sync with CLI.

## Use Existing Skills (Do Not Reinvent Patterns)

- Admin CRUD pages: [.github/skills/admin-crud/SKILL.md](.github/skills/admin-crud/SKILL.md)
- Feature pages and routing: [.github/skills/feature-page/SKILL.md](.github/skills/feature-page/SKILL.md)
- Appwrite Functions: [.github/skills/appwrite-function/SKILL.md](.github/skills/appwrite-function/SKILL.md)
- Appwrite schema updates: [.github/skills/appwrite-schema/SKILL.md](.github/skills/appwrite-schema/SKILL.md)
- Service adapters/hooks: [.github/skills/service-hook/SKILL.md](.github/skills/service-hook/SKILL.md)
- i18n updates: [.github/skills/i18n-content/SKILL.md](.github/skills/i18n-content/SKILL.md)
- Mock data updates: [.github/skills/mock-data/SKILL.md](.github/skills/mock-data/SKILL.md)
- Shared UI components: [.github/skills/react-component/SKILL.md](.github/skills/react-component/SKILL.md)

## Done Criteria for This Phase

A task is done only when:

1. The bug or feature works in target flow(s).
2. No contradiction with the core docs above.
3. Frontend build passes when frontend files changed.
4. i18n, mocks, and docs are updated when affected.
5. Changes remain minimal, focused, and reversible.
