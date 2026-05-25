export class TripsPage {
  constructor(page) {
    this.page = page;

    // TestId locators — most reliable, confirmed by codegen
    this.manageButton = page.getByTestId('nav_bar_manage');
    this.tripsLink = page.getByTestId('nav_bar_trips');

    // Create trip button on trips list page
    this.createTripButton = page.getByRole('button', { name: 'Create trip' });

    // Modal dialog
    this.modal = page.getByRole('dialog');

    // Trip name field — label is "Trip name Required"
    this.tripNameField = page.getByRole('textbox', { name: 'Trip name Required' });

    // Submit inside modal — scoped to dialog to avoid conflicts
    this.submitButton = this.modal.getByRole('button', { name: 'Create trip' });

    // Cancel button
    this.cancelButton = this.modal.getByRole('button', { name: 'Cancel' });
  }

  async navigate() {
    // TestId — no hover needed, direct click works
    await this.manageButton.click();
    await this.tripsLink.waitFor({ state: 'visible' });
    await this.tripsLink.click();
  }

  async openCreateTripModal() {
    await this.createTripButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async createTrip(tripName) {
    await this.tripNameField.fill(tripName);
    await this.submitButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  async cancelTrip() {
    await this.cancelButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  getTripByName(tripName) {
    return this.page.getByText(tripName);
  }

  async searchTrip(tripName) {
  await this.searchTripsField.waitFor({
    state: 'visible'
  });

  await this.searchTripsField.fill(tripName);
}
}