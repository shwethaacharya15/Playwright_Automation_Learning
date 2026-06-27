// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { TripsPage } from '../pages/TripsPage.js';
import { TripSettingsPage } from '../pages/TripSettingsPage.js';

const EMAIL = process.env.TEST_EMAIL ?? '';
const PASSWORD = process.env.TEST_PASSWORD ?? '';

test.describe('Trip Settings', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
  });

  test('Change default view from Calendar to List and verify it applies', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const tripSettingsPage = new TripSettingsPage(page);

    await tripsPage.navigate();
    await tripSettingsPage.open();

 
    await expect(tripSettingsPage.defaultViewDropdownButton).toHaveText(/Calendar/i);

    await tripSettingsPage.setDefaultView('List');
    await tripSettingsPage.apply();

  
    await tripSettingsPage.open();
    await expect(tripSettingsPage.defaultViewDropdownButton).toHaveText(/List/i);
    await tripSettingsPage.cancel();
  });

  test('Cancel does not persist a changed default view', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const tripSettingsPage = new TripSettingsPage(page);

    await tripsPage.navigate();
    await tripSettingsPage.open();

    await tripSettingsPage.setDefaultView('List');
    await tripSettingsPage.cancel();

    await tripSettingsPage.open();
    await expect(tripSettingsPage.defaultViewDropdownButton).toHaveText(/Calendar/i);
    await tripSettingsPage.cancel();
  });

});

test.describe('Trip List E2E', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
  });

  test('Change default view to List, then search and open a trip', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    const tripSettingsPage = new TripSettingsPage(page);

    await tripsPage.navigate();

    await tripSettingsPage.open();
    await tripSettingsPage.setDefaultView('List');
    await tripSettingsPage.apply();

    await tripsPage.searchTrip('Goa Trip');
    await expect(tripsPage.getTripByName('Goa Trip')).toBeVisible();

    await tripsPage.getTripByName('Goa Trip').click();
    await expect(page).toHaveURL(/trip/i);
  });

});
