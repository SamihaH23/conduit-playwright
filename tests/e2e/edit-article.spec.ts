import { articleSlugFromUrl } from '../../api/articles.api';
import { articlePayload, articleUpdate } from '../../data/generators';
import { expect, test } from '../../fixtures/test';

test.describe('edit article', () => {
  test('updates an article that was created through the API', async ({ page, editorPage, articlePage, articlesApi }) => {
    const original = articlePayload();
    const updated = articleUpdate();
    const created = await articlesApi.create(original);
    const slugs = new Set<string>([created.slug]);

    try {
      await articlePage.open(created.slug);
      await articlePage.expectLoggedIn();
      await expect(articlePage.heading()).toHaveText(original.title);

      await articlePage.editArticle();
      await expect(page).toHaveURL(new RegExp(`/editor/${created.slug}$`));
      await expect(editorPage.title).toHaveValue(original.title);

      await editorPage.title.fill(updated.title);
      await editorPage.description.fill(updated.description);
      await editorPage.body.fill(updated.body);

      const [response] = await Promise.all([
        page.waitForResponse((result) => result.request().method() === 'PUT' && result.url().includes('/api/articles/')),
        editorPage.publishArticle(),
      ]);
      expect(response.status()).toBe(200);

      await expect(page).toHaveURL(/\/article\/.+/);
      const newSlug = articleSlugFromUrl(page.url());
      slugs.add(newSlug);
      await expect(articlePage.heading()).toHaveText(updated.title);
      await expect(articlePage.heading()).not.toHaveText(original.title);
      await expect(articlePage.content).toContainText(updated.body);

      const saved = await articlesApi.get(newSlug);
      expect(saved.status).toBe(200);
      expect(saved.article?.title).toBe(updated.title);
      expect(saved.article?.description).toBe(updated.description);
      expect(saved.article?.body).toBe(updated.body);
    } finally {
      for (const slug of slugs) {
        await articlesApi.delete(slug);
      }
    }
  });

  test('does not save a blank title', async ({ page, editorPage, articlePage, articlesApi }) => {
    const original = articlePayload();
    const created = await articlesApi.create(original);

    try {
      await articlePage.open(created.slug);
      await articlePage.editArticle();
      await expect(editorPage.title).toHaveValue(original.title);
      await editorPage.title.fill('');

      const [response] = await Promise.all([
        page.waitForResponse((result) => result.request().method() === 'PUT' && result.url().includes('/api/articles/')),
        editorPage.publishArticle(),
      ]);
      expect(response.ok()).toBeTruthy();

      await expect(page).toHaveURL(/\/article\/.+/);
      await expect(articlePage.heading()).toHaveText(original.title);

      const saved = await articlesApi.get(created.slug);
      expect(saved.status).toBe(200);
      expect(saved.article?.title).toBe(original.title);
      expect(saved.article?.description).toBe(original.description);
      expect(saved.article?.body).toBe(original.body);
    } finally {
      await articlesApi.delete(created.slug);
    }
  });
});
