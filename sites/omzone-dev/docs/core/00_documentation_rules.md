# 00_DOCUMENTATION_RULES

## Canon ownership

La verdad canónica vive en `docs/core/`:

- `00_ai_project_context.md`
- `00_project_brief.md`
- `01_frontend_requirements.md`
- `02_backend_appwrite_requirements.md`
- `03_appwrite_db_schema.md`
- `04_design_system_mobile_first.md`
- `05_permissions_and_roles.md`
- `06_appwrite_functions_catalog.md`
- `07_frontend_routes_and_flows.md`
- `08_env_reference.md`
- `09_appwrite_platform_limits.md`
- `10_master_plan_checklist.md`
- `11_i18n_strategy.md`
- `12_mock_data_strategy.md`

## Rules

1. Si no está en `docs/core/`, no es fuente de verdad.
2. Los prompts no son canon; deben vivir en `docs/_archive/prompts/`.
3. No duplicar reglas si ya existe un documento dueño del tema.
4. Ningún documento puede contradecir `00_ai_project_context.md`.
5. Ninguna colección, función o índice puede violar `09_appwrite_platform_limits.md`.
