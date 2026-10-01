import { missingTag } from '../../data/generators';
import { expect, test } from '../../fixtures/test';

test.describe('filter articles by tag', () => {
  test('shows only articles for the selected popular tag', async ({ homePage, articlesApi }) => {
    const tag = await articlesApi.tagWithArticles();
    const listed = await articlesApi.listByTag(tag);
    expect(listed.status).toBe(200);
    expect(listed.articles.length).toBeGreaterThan(0);

    await homePage.open();
    await homePage.clickTag(tag);

    await expect(homePage.tagTab(tag)).toBeVisible();
    await expect(homePage.previews().first().getByRole('heading', { level: 1 })).toHaveText(listed.articles[0].title);

    const count = await homePage.previews().count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(listed.articles.length);

    for (let index = 0; index < count; index += 1) {
      await expect(homePage.previews().nth(index).locator('.tag-pill').getByText(tag, { exact: true })).toBeVisible();
    }
  });

  test('returns no articles for an unknown tag and does not offer it in the sidebar', async ({ page, homePage, articlesApi }) => {
    const tag = missingTag();
    const listed = await articlesApi.listByTag(tag);
    expect(listed.status).toBe(200);
    expect(listed.articles).toEqual([]);
    expect(listed.articlesCount).toBe(0);

    await homePage.open();
    await expect(homePage.sidebar().locator('.tag-pill').first()).toBeVisible();
    await expect(homePage.tagPill(tag)).toHaveCount(0);
    await expect(page.locator('.error-messages li')).toHaveCount(0);
    await expect(page).toHaveTitle(/Conduit/);
  });
});
