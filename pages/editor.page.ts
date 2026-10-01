import type { Locator, Page } from '@playwright/test';
import type { ArticleInput } from '../data/generators';
import { BasePage } from './base.page';

export class EditorPage extends BasePage {
  readonly title: Locator;
  readonly description: Locator;
  readonly body: Locator;
  readonly tags: Locator;
  readonly publish: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByPlaceholder('Article Title');
    this.description = page.getByPlaceholder("What's this article about?");
    this.body = page.getByPlaceholder('Write your article (in markdown)');
    this.tags = page.getByPlaceholder('Enter tags');
    this.publish = page.getByRole('button', { name: 'Publish Article' });
  }

  async openNew(): Promise<void> {
    await this.goto('/editor');
    await this.expectLoggedIn();
  }

  async openExisting(slug: string): Promise<void> {
    await this.goto(`/editor/${slug}`);
  }

  async fillArticle(article: ArticleInput): Promise<void> {
    await this.title.fill(article.title);
    await this.description.fill(article.description);
    await this.body.fill(article.body);
    if (article.tag) {
      await this.tags.fill(article.tag);
      await this.tags.press('Enter');
    }
  }

  async publishArticle(): Promise<void> {
    await this.publish.click();
  }
}
