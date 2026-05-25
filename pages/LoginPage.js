export class LoginPage {
  constructor(page) {
    this.page = page;

    // Confirmed by codegen
    this.signInLink = page.getByRole('link', { name: 'Sign in here.' }); // period matters
    this.usernameField = page.getByRole('textbox', { name: 'Username' });
    this.passwordField = page.getByTestId('password'); // NOT getByRole
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  async goto() {
    await this.page.goto('https://advisor.forastaging.net/login');
  }

  async login(email, password) {
    await this.signInLink.click();
    await this.usernameField.fill(email);
    await this.passwordField.fill(password);
    await this.signInButton.click();
  }
}