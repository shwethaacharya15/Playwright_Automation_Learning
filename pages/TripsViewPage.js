export class TripsViewPage {
  constructor(page) {
    this.page = page;

    // View buttons
    this.kanbanViewButton = page.getByTestId(
      'segmented-control-option-kanban'
    );

    this.listViewButton = page.getByTestId(
      'segmented-control-option-list'
    );
  }

  async switchToKanbanView() {
    await this.kanbanViewButton.waitFor({ state: 'visible' });
    await this.kanbanViewButton.click();
  }

  async switchToListView() {
    await this.listViewButton.waitFor({ state: 'visible' });
    await this.listViewButton.click();
  }
}