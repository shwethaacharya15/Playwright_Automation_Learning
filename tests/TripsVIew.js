import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TripsPage } from '../pages/TripsPage';
import { TripsViewPage } from '../pages/TripsViewPage';

test.describe('Trips', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
  });

  test('Create and search trip in kanban view', async ({ page }) => {

    const tripsPage = new TripsPage(page);
    const tripsViewPage = new TripsViewPage(page);

    await tripsPage.navigate();

    // Switch to kanban view
    await tripsViewPage.switchToKanbanView();

    // Create trip
    await tripsPage.openCreateTripModal();

    await tripsPage.createTrip('MCP Test Trip');

    // Search created trip
    await tripsPage.searchTrip('MCP Test Trip');

    // Validation
    await expect(
      tripsPage.getTripByName('MCP Test Trip')
    ).toBeVisible();
  });
});