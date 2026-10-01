import { expect, type Locator, type Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.page.getByRole('link', { name: 'New Article' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Settings' })).toBeVisible();
  }

  errorList(): Locator {
    return this.page.locator('.error-messages');
  }

  async expectErrorMessage(message: string | RegExp): Promise<void> {
    await expect(this.errorList()).toContainText(message);
  }
}
