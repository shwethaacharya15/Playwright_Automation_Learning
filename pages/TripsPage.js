export class TripsPage {
  constructor(page) {
    this.page = page;


    this.manageButton = page.getByTestId('nav_bar_manage');
    this.tripsLink = page.getByTestId('nav_bar_trips');

    this.createTripButton = page.getByRole('button', { name: 'Create trip' });
    this.modal = page.getByRole('dialog');

    this.tripNameField = page.getByRole('textbox', { name: 'Trip name Required' });
    this.submitButton = this.modal.getByRole('button', { name: 'Create trip' });

    // Cancel button
    this.cancelButton = this.modal.getByRole('button', { name: 'Cancel' });


    this.searchTripsField = page.getByPlaceholder('Search trips');
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