import { test as base } from '@playwright/test';
import { ArticlesApi } from '../api/articles.api';
import { ArticlePage } from '../pages/article.page';
import { EditorPage } from '../pages/editor.page';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { SettingsPage } from '../pages/settings.page';

type FrameworkFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  editorPage: EditorPage;
  articlePage: ArticlePage;
  settingsPage: SettingsPage;
  articlesApi: ArticlesApi;
};

export const test = base.extend<FrameworkFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  editorPage: async ({ page }, use) => {
    await use(new EditorPage(page));
  },
  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  articlesApi: async ({ request }, use) => {
    await use(new ArticlesApi(request));
  },
});

export { expect } from '@playwright/test';
