import { articlePayload } from '../../data/generators';
import { expect, test } from '../../fixtures/test';

test.describe('delete article', () => {
  test('deletes an article that was created through the API', async ({ page, articlePage, articlesApi }) => {
    const original = articlePayload();
    const created = await articlesApi.create(original);

    try {
      await articlePage.open(created.slug);
      await articlePage.expectLoggedIn();
      await expect(articlePage.heading()).toHaveText(original.title);

      const [response] = await Promise.all([
        page.waitForResponse(
          (result) => result.request().method() === 'DELETE' && result.url().includes('/api/articles/') && !result.url().includes('/favorite'),
        ),
        articlePage.removeArticle(),
      ]);
      expect(response.status()).toBe(204);

      await expect(page).toHaveURL((url) => new URL(url).pathname === '/');
      await expect(page.getByRole('heading', { level: 1, name: original.title })).toHaveCount(0);

      const saved = await articlesApi.get(created.slug);
      expect(saved.status).toBe(404);
    } finally {
      await articlesApi.delete(created.slug);
    }
  });

  test('hides delete from a guest and rejects a second delete', async ({ page, browser, articlesApi }) => {
    const original = articlePayload();
    const created = await articlesApi.create(original);
    const guest = await browser.newContext({ storageState: { cookies: [], origins: [] } });

    try {
      const guestPage = await guest.newPage();
      await guestPage.goto(`/article/${created.slug}`);
      await expect(guestPage.getByRole('heading', { level: 1 })).toHaveText(original.title);
      await expect(guestPage.getByRole('button', { name: 'Delete Article' })).toHaveCount(0);
      await expect(guestPage.getByRole('link', { name: 'Edit Article' })).toHaveCount(0);

      expect(await articlesApi.delete(created.slug)).toBe(204);
      expect(await articlesApi.delete(created.slug)).toBe(404);

      await page.goto(`/article/${created.slug}`);
      await expect(page).toHaveURL((url) => new URL(url).pathname === '/');
      await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible();
    } finally {
      await guest.close();
      await articlesApi.delete(created.slug);
    }
  });
});
