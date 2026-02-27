# Memory Mirror

**AI Companion for Dementia Care**

Memory Mirror is a compassionate AI companion app for people living with dementia, supporting Aboriginal and Torres Strait Islander families with culturally safe, hands-free care.

**About**

This project contains everything you need to run the Memory Mirror app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will be deployed automatically.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
```

Run the app: `npm run dev`

**Running E2E Tests**

Automated end-to-end smoke tests use [Playwright](https://playwright.dev/) to verify that the Landing page feature cards navigate to the correct routes.

Prerequisites: ensure your `.env.local` is configured (see above) and dependencies are installed.

```
# Install Playwright browsers (first time only)
npx playwright install chromium

# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with the Playwright UI
npm run test:e2e:ui
```

**API Reference**

The serverless functions in the `functions/` directory are documented in [docs/api.md](docs/api.md).  Each entry covers the HTTP request body, response shape, and authentication requirements.

**Docs & Support**

Documentation: [docs/api.md](docs/api.md)

Support: [support@memorymirror.com.au](mailto:support@memorymirror.com.au)
