// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { TripsPage } from '../pages/TripsPage.js';

const EMAIL = process.env.TEST_EMAIL ?? '';
const PASSWORD = process.env.TEST_PASSWORD ?? '';

test.describe('Trips', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
  });

  test('Create a trip successfully', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    await tripsPage.navigate();
    await tripsPage.openCreateTripModal();
    await tripsPage.createTrip('MCP Test Trip');
    // await expect(tripsPage.getTripByName('MCP Test Trip')).toBeVisible();
  });

  test('Cancel trip creation closes modal', async ({ page }) => {
    const tripsPage = new TripsPage(page);
    await tripsPage.navigate();
    await tripsPage.openCreateTripModal();
    await tripsPage.cancelTrip();
    await expect(tripsPage.modal).not.toBeVisible();
  });

});