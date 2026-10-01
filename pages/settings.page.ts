import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SettingsPage extends BasePage {
  readonly username: Locator;
  readonly bio: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly update: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByPlaceholder('Username');
    this.bio = page.getByPlaceholder('Short bio about you');
    this.email = page.getByPlaceholder('Email');
    this.password = page.getByPlaceholder('New Password');
    this.update = page.getByRole('button', { name: 'Update Settings' });
  }

  async open(): Promise<void> {
    await this.goto('/settings');
    await this.expectLoggedIn();
  }

  async save(): Promise<void> {
    await this.update.click();
  }
}
