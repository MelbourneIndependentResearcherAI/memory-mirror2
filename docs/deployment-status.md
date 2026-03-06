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

Both standalone apps (`apps/carer-hire-ai` and `apps/little-ones-ai`) are deployed separately as **Azure App Service** applications.  The CI/CD workflows live at:

- `.github/workflows/deploy-carer-hire-ai.yml`
- `.github/workflows/deploy-little-ones-ai.yml`

### Build pipeline status

| App | Build | Deploy |
|---|---|---|
| `apps/carer-hire-ai` | ✅ Succeeds (Vite, 1 729 modules, ~3.5 s) | ⚠️ Awaiting secrets |
| `apps/little-ones-ai` | ✅ Succeeds (Vite, 1 728 modules, ~3.3 s) | ⚠️ Awaiting secrets |

The build step for both apps has been confirmed working (verified in CI run IDs `66016636071` and `66016635893` on 2026-03-06).  The deployment step is skipped gracefully until the required GitHub repository secrets are configured.

### Secrets required to activate deployment

Add these four secrets at **Settings → Secrets and variables → Actions**:

| Secret name | Where to get the value |
|---|---|
| `CARER_HIRE_AI_APP_NAME` | Azure App Service name (e.g. `carer-hire-ai`) from `terraform.tfvars` |
| `CARER_HIRE_AI_PUBLISH_PROFILE` | Azure Portal → App Service → *Get publish profile* (download XML) |
| `LITTLE_ONES_AI_APP_NAME` | Azure App Service name (e.g. `little-ones-ai`) from `terraform.tfvars` |
| `LITTLE_ONES_AI_PUBLISH_PROFILE` | Azure Portal → App Service → *Get publish profile* (download XML) |

See `docs/azure-deployment.md → Deploying Carer Hire AI and Little Ones AI` for the full CLI commands to retrieve the publish profiles.

### What the workflows do (end-to-end)

1. **Checkout** the repository.
2. **Install** npm dependencies inside the relevant `apps/<name>/` directory.
3. **Build** the Vite production bundle (output: `apps/<name>/dist/`).
4. **Guard step** – checks whether the publish-profile and app-name secrets are set.  If either is empty, the deploy step is skipped with a `::warning::` annotation rather than failing the run.
5. **Deploy** to Azure App Service via `azure/webapps-deploy@v3` using the publish-profile credential (zip push deployment).

Once the secrets are configured and a deployment completes, this table should be updated with the live URL and successful run ID.
