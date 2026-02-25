**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

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

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
