export class KanbanPage {
  constructor(page) {
    this.page = page;

    this.kanbanViewButton = page.getByTestId('segmented-control-option-kanban');
    this.listViewButton = page.getByTestId('segmented-control-option-list');

  
    this.columnNames = [
      'Inquiry', 'Planning', 'Booking', 'Pre-trip',
      'Traveling', 'Post Trip', 'Completed', 'Closed Lost',
    ];

    this.searchTripsField = page.getByPlaceholder('Search trips');
    this.filtersButton = page.getByRole('button', { name: 'Filters' });

    // Filter panel — date range
    this.filterStartDate = page.getByLabel('Start date');
    this.filterEndDate = page.getByLabel('End date');
    this.filterApplyButton = page.getByRole('button', { name: 'Apply' });
    this.filterClearButton = page.getByRole('button', { name: /Clear|Reset/i });

    // Create trip
    this.createTripButton = page.getByRole('button', { name: 'Create trip' });
    this.createTripModal = page.getByRole('dialog');
    this.tripNameField = this.createTripModal.getByRole('textbox', { name: /Trip name/i });
    this.statusDropdown = this.createTripModal.getByLabel(/Status|Stage/i);
    this.modalSubmitButton = this.createTripModal.getByRole('button', { name: 'Create trip' });

    // Closed-lost reason modal
    this.closedLostModal = page.getByRole('dialog', { name: /Why was this trip lost/i });
    this.confirmClosedLostButton = this.closedLostModal.getByRole('button', { name: 'Confirm Closed-lost' });
    this.closedLostCloseIcon = this.closedLostModal.getByRole('button', { name: /close/i });

    // Move stage modal
    this.moveStageList = page.getByRole('dialog', { name: /Move trip to a new stage|Move stage/i });

    // Merge modal
    this.mergeModal = page.getByRole('dialog', { name: /Merge/i });
  }

  // --- Navigation / view ---

  async switchToKanbanView() {
    await this.kanbanViewButton.waitFor({ state: 'visible' });
    await this.kanbanViewButton.click();
  }

  // --- Column scoping ---
  getColumn(columnName) {
    return this.page.locator('[class*="column"], [data-column]', { hasText: columnName }).first();
  }

  getCardInColumn(columnName, tripName) {
    return this.getColumn(columnName).getByText(tripName, { exact: false });
  }

  getCard(tripName) {
    return this.page.getByText(tripName, { exact: false }).first();
  }

  // --- Card-level actions (three-dot menu) ---

  getCardMenuButton(tripName) {
    return this.page
      .locator('div', { hasText: tripName })
      .getByRole('button', { name: /more|options|···/i })
      .last();
  }

  async openCardMenu(tripName) {
    const menuButton = this.getCardMenuButton(tripName);
    await menuButton.click();
  }

  async clickMenuOption(optionText) {
    await this.page.getByRole('menuitem', { name: optionText }).click();
  }

  // --- Create trip ---

  async openCreateTripModal() {
    await this.createTripButton.click();
    await this.createTripModal.waitFor({ state: 'visible' });
  }

  async openCreateTripModalFromColumn(columnName) {
    const plusIcon = this.getColumn(columnName).getByRole('button', { name: '+' });
    await plusIcon.click();
    await this.createTripModal.waitFor({ state: 'visible' });
  }

  async fillAndSubmitTrip({ name, status }) {
    await this.tripNameField.fill(name);
    if (status) {
      await this.statusDropdown.selectOption(status);
    }
    await this.modalSubmitButton.click();
    await this.createTripModal.waitFor({ state: 'hidden' });
  }

  // --- Move stage ---

  async moveStage(tripName, targetStage) {
    await this.openCardMenu(tripName);
    await this.clickMenuOption('Move stage');
    await this.moveStageList.getByText(targetStage, { exact: true }).click();
  }

  // --- Pin / unpin ---

  async pinTrip(tripName) {
    await this.openCardMenu(tripName);
    await this.clickMenuOption('Pin trip to top');
  }

  async unpinTrip(tripName) {
    await this.openCardMenu(tripName);
    await this.clickMenuOption('Unpin trip');
  }

  getPinIcon(tripName) {
    return this.page
      .locator('div', { hasText: tripName })
      .locator('[class*="pin"], [data-icon="pin"]')
      .first();
  }

  // --- Merge ---

  async mergeTripInto(sourceTripName, targetTripName) {
    await this.openCardMenu(sourceTripName);
    await this.clickMenuOption('Merge into another trip');
    await this.mergeModal.getByText(targetTripName, { exact: true }).click();
    await this.mergeModal.getByRole('button', { name: /Confirm|Merge/i }).click();
  }

  // --- Closed-lost ---

  async openClosedLostModal(tripName) {
    await this.openCardMenu(tripName);
    await this.clickMenuOption('Mark as Closed-lost');
    await this.closedLostModal.waitFor({ state: 'visible' });
  }

  async selectClosedLostReason(reasonText) {
    await this.closedLostModal.getByRole('radio', { name: reasonText }).check();
  }

  async confirmClosedLost() {
    await this.confirmClosedLostButton.click();
    await this.closedLostModal.waitFor({ state: 'hidden' });
  }

  // --- Search ---

  async searchTrips(query) {
    await this.searchTripsField.fill(query);
  }

  async clearSearch() {
    await this.searchTripsField.fill('');
  }

  getEmptyStateMessage() {
    return this.page.getByText(/No trips found/i);
  }

  // --- Filters ---

  async openFilters() {
    await this.filtersButton.click();
  }

  async applyDateRangeFilter(startDate, endDate) {
    await this.filterStartDate.fill(startDate);
    await this.filterEndDate.fill(endDate);
    await this.filterApplyButton.click();
  }

  async clearFilters() {
    await this.filterClearButton.click();
  }
}
