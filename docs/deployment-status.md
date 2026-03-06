# Deployment Status

## Memory Mirror – Azure Static Web App

Both new companion-app pages were merged to `main` via **PR #99** ("Add LittleOnesAI and CarerHireAI pages") on **2026-03-06** and are confirmed live on the Azure Static Web App.

### LittleOnesAI (Static Web App page)

| Property | Value |
|---|---|
| Route | `/#/LittleOnesAI` |
| Source | `src/pages/LittleOnesAI.jsx` |
| Merge commit | `39c06c7f1f7ff988e938a759f135acb8f91b3fc0` |
| Azure CI/CD run | [Run #606 – success](https://github.com/MelbourneIndependentResearcherAI/memory-mirror2/actions/runs/22752143786) |
| Deployed at | 2026-03-06 06:35 UTC |

### CarerHireAI (Static Web App page)

| Property | Value |
|---|---|
| Route | `/#/CarerHireAI` |
| Source | `src/pages/CarerHireAI.jsx` |
| Merge commit | `39c06c7f1f7ff988e938a759f135acb8f91b3fc0` |
| Azure CI/CD run | [Run #606 – success](https://github.com/MelbourneIndependentResearcherAI/memory-mirror2/actions/runs/22752143786) |
| Deployed at | 2026-03-06 06:35 UTC |

### Verification steps completed

- [x] Both pages registered in `src/pages.config.js` (`LittleOnesAI` and `CarerHireAI` keys)
- [x] `staticwebapp.config.json` `navigationFallback` routes all hash-router paths to `index.html`
- [x] Azure Static Web Apps CI/CD workflow (`azure-static-web-apps-victorious-dune-0fe8d3d0f.yml`) ran to **success** on `main` after the merge (job ID `65988743505`, duration ~1 min 27 s)
- [x] Deployment workflow subsequently replaced with the corrected `azure-static-web-apps.yml` (PR #100), which is ready for all future deployments

---

## Standalone Apps – Azure App Service

Both standalone apps (`apps/carer-hire-ai` and `apps/little-ones-ai`) are configured to deploy separately as **Azure App Service** applications.  The CI/CD workflows live at:

- `.github/workflows/deploy-carer-hire-ai.yml`
- `.github/workflows/deploy-little-ones-ai.yml`

### Deployment confirmation

> **Neither app has been deployed to Azure App Service yet.**

All previous workflow runs on `main` that reported "success" had the **Deploy** step silently **skipped**.  This happened because the required `AZURE_CREDENTIALS` and app-name secrets were not configured, so `has_credentials=false` was set and the deploy step's conditional never fired.  A subsequent commit then introduced a bash syntax error in the guard step (an unclosed `if` block), causing the most recent runs to fail outright before even reaching the deploy step.  Both issues have been fixed in this PR.

### Build pipeline status

| App | Build | Deploy |
|---|---|---|
| `apps/carer-hire-ai` | ✅ Succeeds (Vite, 1 729 modules, ~3.5 s) | ❌ Not yet deployed — secrets not configured |
| `apps/little-ones-ai` | ✅ Succeeds (Vite, 1 728 modules, ~3.3 s) | ❌ Not yet deployed — secrets not configured |

Both workflows also:
- Trigger on **every push to `main`** (no path filter), not only when app files change.
- Use `cancel-in-progress: false` so an in-flight deployment is never cancelled by a subsequent push.

### Secrets required to activate deployment

Add these three secrets at **Settings → Secrets and variables → Actions** (or run the one-command helper script below):

| Secret name | Where to get the value |
|---|---|
| `AZURE_CREDENTIALS` | Service principal JSON for Memory Mirror's subscription — see `docs/azure-deployment.md → Required GitHub Secrets` |
| `CARER_HIRE_AI_APP_NAME` | `carer_hire_ai_app_name` value from `infrastructure/terraform.tfvars` (default: `carer-hire-ai`) |
| `LITTLE_ONES_AI_APP_NAME` | `little_ones_ai_app_name` value from `infrastructure/terraform.tfvars` (default: `little-ones-ai`) |

#### One-command setup

With `az login` and `gh auth login` already completed, run from the repository root:

```bash
# Uses the currently active subscription (will show the subscription name and ask to confirm):
bash scripts/setup-github-secrets.sh

# Pass the subscription ID directly to skip `az account set`:
bash scripts/setup-github-secrets.sh --subscription "<subscription-id-or-name>"
```

Not sure which subscription to use?
```bash
az account list --query "[].{name:name, id:id, isDefault:isDefault}" -o table
```

This script creates the service principal, reads the app names from `terraform.tfvars`, and sets all three secrets automatically.

Both apps share the **same `AZURE_CREDENTIALS`** service principal — the subscription Memory Mirror is already deployed under — so no per-app publish profile is needed.

### What the workflows do (end-to-end)

1. **Checkout** the repository.
2. **Install** npm dependencies inside the relevant `apps/<name>/` directory.
3. **Build** the Vite production bundle (output: `apps/<name>/dist/`).
4. **Guard step** – checks whether `AZURE_CREDENTIALS` and the app-name secret are set.  If either is empty, the job **fails** with a `::error::` annotation so the pipeline stays red until deployment is properly configured.
5. **Azure login** – authenticates to Memory Mirror's Azure subscription using `AZURE_CREDENTIALS` via `azure/login@v2`.
6. **Deploy** to Azure App Service via `azure/webapps-deploy@v3` using the subscription service principal.
7. **Azure logout** – always runs to clean up the login context.

Both workflows trigger on **every push to `main`** (no path filter) and set `cancel-in-progress: false` so a running deployment is never cancelled by a subsequent commit.
