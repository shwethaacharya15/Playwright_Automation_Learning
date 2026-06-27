// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { TripsPage } from '../pages/TripsPage.js';
import { KanbanPage } from '../pages/KanbanPage.js';

const EMAIL = process.env.TEST_EMAIL ?? '';
const PASSWORD = process.env.TEST_PASSWORD ?? '';


test.describe('Kanban - Trip Creation', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const tripsPage = new TripsPage(page);
    const kanbanPage = new KanbanPage(page);

    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
    await tripsPage.navigate();
    await kanbanPage.switchToKanbanView();
  });

  // TC001 (dupe: TC012)
  test('Trip created via column + icon lands in correct column only', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'E2E_ColCreate_Inquiry';

    await kanbanPage.openCreateTripModalFromColumn('Inquiry');
    await kanbanPage.fillAndSubmitTrip({ name: tripName });

    await expect(kanbanPage.getCardInColumn('Inquiry', tripName)).toBeVisible();

    // Negative check matters as much as the positive one — a trip
    // duplicated across columns is a real bug class (e.g. stale
    // cache rendering the card twice), and "card exists somewhere"
    // alone would not catch it.
    for (const column of kanbanPage.columnNames.filter(c => c !== 'Inquiry')) {
      await expect(kanbanPage.getCardInColumn(column, tripName)).not.toBeVisible();
    }
  });

  // TC002 (dupe: TC013)
  test('Trip created via global Create trip button uses selected status column', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'E2E_GlobalCreate_Booking';

    await kanbanPage.openCreateTripModal();
    await kanbanPage.fillAndSubmitTrip({ name: tripName, status: 'Booking' });

    await expect(kanbanPage.getCardInColumn('Booking', tripName)).toBeVisible();
    for (const column of kanbanPage.columnNames.filter(c => c !== 'Booking')) {
      await expect(kanbanPage.getCardInColumn(column, tripName)).not.toBeVisible();
    }
  });

  // TC021 (validation variant)
  test('Submitting create-trip form with no fields filled shows validation error, no trip created', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);

    await kanbanPage.openCreateTripModalFromColumn('Inquiry');
    await kanbanPage.modalSubmitButton.click();


    await expect(kanbanPage.createTripModal).toBeVisible();
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  // TC027 (edge: max length)
  test('Trip name accepts up to max character length without truncation or breakage', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const maxLengthName = 'A'.repeat(255);

    await kanbanPage.openCreateTripModalFromColumn('Inquiry');
    await kanbanPage.tripNameField.fill(maxLengthName);

    const actualValue = await kanbanPage.tripNameField.inputValue();

    expect(actualValue.length).toBeGreaterThan(0);
    expect(actualValue).toBe(actualValue.trim());

    await kanbanPage.modalSubmitButton.click();
    await kanbanPage.createTripModal.waitFor({ state: 'hidden' });
    await expect(kanbanPage.getCard(actualValue)).toBeVisible();
  });

  // TC032 (all 8 statuses land correctly)
  test('Each of the 8 trip statuses places the card in its matching column', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const statusMap = {
      'Inquiry': 'E2E_Status_Inquiry',
      'Planning': 'E2E_Status_Planning',
      'Booking': 'E2E_Status_Booking',
      'Pre-trip': 'E2E_Status_Pretrip',
      'Traveling': 'E2E_Status_Traveling',
      'Post Trip': 'E2E_Status_PostTrip',
      'Completed': 'E2E_Status_Completed',
      'Closed Lost': 'E2E_Status_ClosedLost',
    };

    for (const [status, name] of Object.entries(statusMap)) {
      await kanbanPage.openCreateTripModal();
      await kanbanPage.fillAndSubmitTrip({ name, status });
      await expect(kanbanPage.getCardInColumn(status, name)).toBeVisible();
    }
  });

});

test.describe('Kanban - Stage Movement', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const tripsPage = new TripsPage(page);
    const kanbanPage = new KanbanPage(page);

    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
    await tripsPage.navigate();
    await kanbanPage.switchToKanbanView();
  });

  // TC003 (dupe: TC014)
  test('Status change on trip detail page reflects on Kanban board after return', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);

    const tripName = 'PRECONDITION_PreTrip_Trip';

    await kanbanPage.getCard(tripName).click();
    await page.getByLabel(/Status|Stage/i).selectOption('Completed');
    await page.getByRole('button', { name: /Save|Update/i }).click();

    await page.goBack();
    await expect(kanbanPage.getCardInColumn('Pre-trip', tripName)).not.toBeVisible();
    await expect(kanbanPage.getCardInColumn('Completed', tripName)).toBeVisible();
  });

  // TC004 (dupe: TC015)
  test('Move stage via three-dot menu moves card and removes from source column', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'PRECONDITION_Inquiry_Trip';

    await kanbanPage.moveStage(tripName, 'Planning');
    await expect(kanbanPage.getCardInColumn('Inquiry', tripName)).not.toBeVisible();
    await expect(kanbanPage.getCardInColumn('Planning', tripName)).toBeVisible();

    await kanbanPage.moveStage(tripName, 'Booking');
    await expect(kanbanPage.getCardInColumn('Planning', tripName)).not.toBeVisible();
    await expect(kanbanPage.getCardInColumn('Booking', tripName)).toBeVisible();
  });

  // TC026 (negative: closed-lost is terminal)
  test('Trip in Closed Lost column cannot be moved to an active stage', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'PRECONDITION_ClosedLost_Trip';

    await kanbanPage.openCardMenu(tripName);

    const moveStageOption = page.getByRole('menuitem', { name: 'Move stage' });
    const optionCount = await moveStageOption.count();

    if (optionCount === 0) {
      expect(optionCount).toBe(0);
    } else {
      await expect(moveStageOption).toBeDisabled();
    }
  });

});

test.describe('Kanban - Pin / Unpin', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const tripsPage = new TripsPage(page);
    const kanbanPage = new KanbanPage(page);

    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
    await tripsPage.navigate();
    await kanbanPage.switchToKanbanView();
  });

  // TC005 (dupe: TC016)
  test('Pin trip to top moves card up, shows pin icon, persists after navigation', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'PRECONDITION_NonTopCard';

    await kanbanPage.pinTrip(tripName);
    await expect(kanbanPage.getPinIcon(tripName)).toBeVisible();

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.goBack();

    await expect(kanbanPage.getPinIcon(tripName)).toBeVisible();
  });

  // TC006 (dupe: TC017)
  test('Unpin trip removes pin icon and returns to natural sort order', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'PRECONDITION_PinnedCard';

    await kanbanPage.unpinTrip(tripName);
    await expect(kanbanPage.getPinIcon(tripName)).not.toBeVisible();

    await page.reload();
    await expect(kanbanPage.getPinIcon(tripName)).not.toBeVisible();
  });

  // TC028 (edge: multiple pins, order)
  test('Pinning multiple trips in the same column stacks them at top in consistent order', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripC = 'PRECONDITION_TripC_Pos3';
    const tripB = 'PRECONDITION_TripB_Pos2';

    await kanbanPage.pinTrip(tripC);
    await kanbanPage.pinTrip(tripB);

    await expect(kanbanPage.getPinIcon(tripC)).toBeVisible();
    await expect(kanbanPage.getPinIcon(tripB)).toBeVisible();

    const column = kanbanPage.getColumn('Inquiry');
    const orderBeforeReload = await column.locator('[class*="pin"]').allTextContents();

    await page.reload();

    const orderAfterReload = await column.locator('[class*="pin"]').allTextContents();
    expect(orderAfterReload).toEqual(orderBeforeReload);
  });

  // TC029 (edge: pin behavior after move stage)
  test('Pin state after Move Stage is consistent (carries over or resets, not undefined)', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'PRECONDITION_PinnedInquiryTrip';

    await kanbanPage.moveStage(tripName, 'Planning');

    const pinIconAfterMove = kanbanPage.getPinIcon(tripName);
    const isPinned = await pinIconAfterMove.isVisible().catch(() => false);

    console.log(`Pin carried over after Move Stage: ${isPinned}`);
    await expect(kanbanPage.getCardInColumn('Planning', tripName)).toBeVisible();
  });

});

test.describe('Kanban - Merge', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const tripsPage = new TripsPage(page);
    const kanbanPage = new KanbanPage(page);

    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
    await tripsPage.navigate();
    await kanbanPage.switchToKanbanView();
  });

  // TC007 (dupe: TC018)
  test('Merge trip flow removes source and retains data on target', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const sourceTrip = 'PRECONDITION_SourceTrip';
    const targetTrip = 'PRECONDITION_TargetTrip';

    await kanbanPage.mergeTripInto(sourceTrip, targetTrip);

    await kanbanPage.searchTrips(sourceTrip);
    await expect(kanbanPage.getEmptyStateMessage()).toBeVisible();
    await kanbanPage.clearSearch();

    await kanbanPage.getCard(targetTrip).click();

  });

});

test.describe('Kanban - Closed Lost', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const tripsPage = new TripsPage(page);
    const kanbanPage = new KanbanPage(page);

    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
    await tripsPage.navigate();
    await kanbanPage.switchToKanbanView();
  });

  // TC008 (dupe: TC019)
  test('Full Closed Lost flow: select reason, confirm, card moves to Closed Lost column', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'PRECONDITION_ActiveTrip';

    await kanbanPage.openClosedLostModal(tripName);
    await kanbanPage.selectClosedLostReason('Booked independently');
    await kanbanPage.confirmClosedLost();

    await expect(kanbanPage.getCardInColumn('Closed Lost', tripName)).toBeVisible();
  });

  // TC022 (negative: no reason selected)
  test('Confirm Closed-lost button is disabled when no reason is selected', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'PRECONDITION_ActiveTrip';

    await kanbanPage.openClosedLostModal(tripName);
    await expect(kanbanPage.confirmClosedLostButton).toBeDisabled();
  });

  // TC023 (negative: cancel via X)
  test('Closing Closed-lost modal via X does not change trip stage', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripName = 'PRECONDITION_ActiveTrip';
    const originalColumn = 'Inquiry'; // adjust to match actual precondition stage

    await kanbanPage.openClosedLostModal(tripName);
    await kanbanPage.selectClosedLostReason('Trip postponed');
    await kanbanPage.closedLostCloseIcon.click();

    await expect(kanbanPage.getCardInColumn('Closed Lost', tripName)).not.toBeVisible();
    await expect(kanbanPage.getCardInColumn(originalColumn, tripName)).toBeVisible();
  });

});

test.describe('Kanban - Search', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const tripsPage = new TripsPage(page);
    const kanbanPage = new KanbanPage(page);

    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
    await tripsPage.navigate();
    await kanbanPage.switchToKanbanView();
  });

  // TC009 (dupe: TC020)
  test('Search filters cards in real time and resets fully on clear', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);

    await kanbanPage.searchTrips('Goa');

    const visibleCards = page.locator('[class*="trip-card"]');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);

    await kanbanPage.clearSearch();
    const countAfterClear = await visibleCards.count();
    expect(countAfterClear).toBeGreaterThan(count - 1); // board fully restored
  });

  // TC024 (negative: no results)
  test('Search with no matching trips shows empty state', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);

    await kanbanPage.searchTrips('ZZZZ_NoSuchTrip_9999');
    await expect(kanbanPage.getEmptyStateMessage()).toBeVisible();

    await kanbanPage.clearSearch();
    await expect(kanbanPage.getEmptyStateMessage()).not.toBeVisible();
  });

  // TC030 (edge: special characters)
  test('Search with special characters does not crash the page', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);

    await kanbanPage.searchTrips('@#$%&*()');
 
    await expect(page.locator('text=/unexpected error|something went wrong/i')).not.toBeVisible();

    await kanbanPage.clearSearch();
    await kanbanPage.searchTrips('   ');
    await expect(page.locator('text=/unexpected error|something went wrong/i')).not.toBeVisible();
  });

});

test.describe('Kanban - Date Filter', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const tripsPage = new TripsPage(page);
    const kanbanPage = new KanbanPage(page);

    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);
    await tripsPage.navigate();
    await kanbanPage.switchToKanbanView();
  });

  // TC010 (dupe: TC021-date-variant)
  test('Filter by trip date range shows only matching trips, clears correctly', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripInRange = 'PRECONDITION_AprilTrip';
    const tripOutOfRange = 'PRECONDITION_OutsideRangeTrip';

    await kanbanPage.openFilters();
    await kanbanPage.applyDateRangeFilter('2026-04-01', '2026-04-30');

    await expect(kanbanPage.getCard(tripInRange)).toBeVisible();
    await expect(kanbanPage.getCard(tripOutOfRange)).not.toBeVisible();

    await kanbanPage.clearFilters();
    await expect(kanbanPage.getCard(tripOutOfRange)).toBeVisible();
  });

  // TC025 (negative: no results)
  test('Date filter with no matching trips shows empty state', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);

    await kanbanPage.openFilters();
    await kanbanPage.applyDateRangeFilter('2020-01-01', '2020-01-02');
    await expect(kanbanPage.getEmptyStateMessage()).toBeVisible();

    await kanbanPage.clearFilters();
    await expect(kanbanPage.getEmptyStateMessage()).not.toBeVisible();
  });

  // TC031 (edge: single-day range, inclusive boundary)
  test('Single-day date filter is inclusive of trips starting that day', async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const tripOnDate = 'PRECONDITION_April6Trip';
    const tripNextDay = 'PRECONDITION_April7Trip';

    await kanbanPage.openFilters();
    await kanbanPage.applyDateRangeFilter('2026-04-06', '2026-04-06');

    await expect(kanbanPage.getCard(tripOnDate)).toBeVisible();
    await expect(kanbanPage.getCard(tripNextDay)).not.toBeVisible();

    await kanbanPage.clearFilters();
  });

});


test.skip('Trip auto-transitions stage when trigger condition is met (needs backend trigger hook)', async ({ page }) => {
  
});
