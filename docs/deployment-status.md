# Deployment Status

## New Apps – Azure Deployment Confirmation

Both new companion-app pages were merged to `main` via **PR #99** ("Add LittleOnesAI and CarerHireAI pages") on **2026-03-06** and are confirmed live on the Azure Static Web App.

### LittleOnesAI

| Property | Value |
|---|---|
| Route | `/#/LittleOnesAI` |
| Source | `src/pages/LittleOnesAI.jsx` |
| Merge commit | `39c06c7f1f7ff988e938a759f135acb8f91b3fc0` |
| Azure CI/CD run | [Run #606 – success](https://github.com/MelbourneIndependentResearcherAI/memory-mirror2/actions/runs/22752143786) |
| Deployed at | 2026-03-06 06:35 UTC |

### CarerHireAI

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
