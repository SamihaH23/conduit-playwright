import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

function exactText(value: string): RegExp {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*${escaped}\\s*$`);
}

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/');
    await this.expectLoggedIn();
  }

  sidebar(): Locator {
    return this.page.locator('.sidebar');
  }

  tagPill(tag: string): Locator {
    return this.sidebar().locator('.tag-pill').filter({ hasText: exactText(tag) });
  }

  tagTab(tag: string): Locator {
    return this.page.locator('.feed-toggle').getByText(tag, { exact: true });
  }

  previews(): Locator {
    return this.page.locator('.article-preview');
  }

  emptyFeed(): Locator {
    return this.page.getByText('No articles are here... yet.');
  }

  async clickTag(tag: string): Promise<void> {
    await this.tagPill(tag).click();
  }
}
