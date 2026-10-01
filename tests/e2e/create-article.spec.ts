import { articleSlugFromUrl } from '../../api/articles.api';
import { articlePayload, invalidArticle } from '../../data/generators';
import { expect, test } from '../../fixtures/test';

test.describe('create article', () => {
  test('publishes a new article and persists it', async ({ page, editorPage, articlePage, articlesApi }) => {
    const article = articlePayload();
    let slug = '';

    try {
      await editorPage.openNew();
      await editorPage.fillArticle(article);

      const [response] = await Promise.all([
        page.waitForResponse((result) => result.request().method() === 'POST' && result.url().includes('/api/articles')),
        editorPage.publishArticle(),
      ]);
      expect(response.status()).toBe(201);

      await expect(page).toHaveURL(/\/article\/.+/);
      slug = articleSlugFromUrl(page.url());
      await expect(articlePage.heading()).toHaveText(article.title);
      await expect(articlePage.content).toContainText(article.body);
      await expect(articlePage.tag(article.tag).first()).toBeVisible();

      const saved = await articlesApi.get(slug);
      expect(saved.status).toBe(200);
      expect(saved.article?.title).toBe(article.title);
      expect(saved.article?.description).toBe(article.description);
      expect(saved.article?.body).toBe(article.body);
      expect(saved.article?.tagList).toContain(article.tag);
    } finally {
      if (slug) {
        await articlesApi.delete(slug);
      }
    }
  });

  test('shows a validation error when the title is blank', async ({ page, editorPage }) => {
    const article = invalidArticle();

    await editorPage.openNew();
    await editorPage.fillArticle(article);

    const [response] = await Promise.all([
      page.waitForResponse((result) => result.request().method() === 'POST' && result.url().includes('/api/articles')),
      editorPage.publishArticle(),
    ]);
    expect(response.status()).toBe(422);

    await expect(page).toHaveURL(/\/editor\/?$/);
    await expect(page).not.toHaveURL(/\/article\//);
    await editorPage.expectErrorMessage("title can't be blank");
    await expect(page.getByRole('heading', { level: 1, name: article.description })).toHaveCount(0);
  });
});
