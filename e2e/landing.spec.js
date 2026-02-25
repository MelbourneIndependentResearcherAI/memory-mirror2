import { test, expect } from '@playwright/test';

/**
 * E2E smoke tests for Landing page feature card navigation.
 * Each card should route to its expected path when clicked.
 */

const FEATURE_CARDS = [
  { label: 'Phone Mode',           expectedPath: '/PhoneMode' },
  { label: 'Security Scanner',     expectedPath: '/Security' },
  { label: 'Night Watch',          expectedPath: '/NightWatch' },
  { label: 'Always-On Voice',      expectedPath: '/VoiceSetup' },
  { label: 'Fake Banking',         expectedPath: '/MyBank' },
  { label: 'Family Portal',        expectedPath: '/FamilyConnect' },
  { label: 'Caregiver Dashboard',  expectedPath: '/CaregiverDashboard' },
  { label: 'Smart TV Mode',        expectedPath: '/TVMode' },
];

test.describe('Landing page feature card navigation', () => {
  for (const { label, expectedPath } of FEATURE_CARDS) {
    test(`"${label}" card navigates to ${expectedPath}`, async ({ page }) => {
      // Start at the Landing page
      await page.goto('/');

      // Wait for the Landing page content to appear
      await page.waitForLoadState('domcontentloaded');

      // Click the feature card button by its visible text
      await page.getByRole('button', { name: label, exact: false }).first().click();

      // Assert the URL now contains the expected path (hash-based routing)
      await expect(page).toHaveURL(new RegExp(expectedPath.replace('/', '\\/')));

      // Assert the page did not show a generic "not found" message
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.toLowerCase()).not.toContain('page not found');
      expect(bodyText.toLowerCase()).not.toContain('404');
    });
  }
});
