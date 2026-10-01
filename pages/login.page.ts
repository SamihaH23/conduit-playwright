import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly signIn: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByPlaceholder('Email');
    this.password = page.getByPlaceholder('Password');
    this.signIn = page.getByRole('button', { name: 'Sign in' });
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signIn.click();
  }
}
