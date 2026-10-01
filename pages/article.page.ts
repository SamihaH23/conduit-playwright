import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ArticlePage extends BasePage {
  readonly content: Locator;
  readonly edit: Locator;
  readonly deleteArticle: Locator;

  constructor(page: Page) {
    super(page);
    this.content = page.locator('.article-content');
    this.edit = page.getByRole('link', { name: 'Edit Article' });
    this.deleteArticle = page.getByRole('button', { name: 'Delete Article' });
  }

  heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  tag(name: string): Locator {
    return this.page.locator('.tag-pill').getByText(name, { exact: true });
  }

  async open(slug: string): Promise<void> {
    await this.goto(`/article/${slug}`);
  }

  async editArticle(): Promise<void> {
    await this.edit.first().click();
  }

  async removeArticle(): Promise<void> {
    await this.deleteArticle.first().click();
  }
}
