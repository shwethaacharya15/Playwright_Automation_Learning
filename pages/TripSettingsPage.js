export class TripSettingsPage {
  constructor(page) {
    this.page = page;

    
    this.actionsButton = page.getByRole('button', { name: 'Actions' });
    this.tripSettingsMenuItem = page.getByText('Trip settings', { exact: true });

    this.modal = page.getByRole('dialog', { name: 'Trip settings' });


    this.defaultViewDropdownButton = this.modal.getByRole('button', { name: /Calendar|List/i });
    this.listOption = page.getByRole('option', { name: 'List', exact: true });
    this.calendarOption = page.getByRole('option', { name: 'Calendar', exact: true });

    this.applyButton = this.modal.getByRole('button', { name: 'Apply' });
    this.cancelButton = this.modal.getByRole('button', { name: 'Cancel' });
  }

  async open() {
    await this.actionsButton.click();
    await this.tripSettingsMenuItem.waitFor({ state: 'visible' });
    await this.tripSettingsMenuItem.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async getCurrentDefaultView() {
    return this.defaultViewDropdownButton.innerText();
  }

  async setDefaultView(viewName) {
    await this.defaultViewDropdownButton.click();

    const option = viewName === 'List' ? this.listOption : this.calendarOption;
    await option.waitFor({ state: 'visible' });
    await option.click();
  }

  async apply() {
    await this.applyButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  async cancel() {
    await this.cancelButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }
}
