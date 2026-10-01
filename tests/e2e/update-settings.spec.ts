import type { Browser, BrowserContext, Page } from '@playwright/test';
import { AuthApi } from '../../api/auth.api';
import type { AccountInput } from '../../data/generators';
import { newAccount, settingsUpdate } from '../../data/generators';
import { expect, test } from '../../fixtures/test';
import { SettingsPage } from '../../pages/settings.page';

const appOrigin = (process.env.BASE_URL ?? 'https://conduit.bondaracademy.com').replace(/\/$/, '');

test.describe('update user settings', () => {
  test.describe.configure({ mode: 'serial' });

  let account: AccountInput = newAccount();
  let token = '';
  let takenUsername = '';

  test.beforeAll(async ({ request }) => {
    const auth = new AuthApi(request);
    account = newAccount();
    const registered = await auth.register(account);
    token = registered.token;
    account = { ...account, email: registered.email, username: registered.username };

    const other = await auth.register(newAccount());
    takenUsername = other.username;
  });

  async function openAsUser(browser: Browser): Promise<{ context: BrowserContext; page: Page; settingsPage: SettingsPage }> {
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: appOrigin,
            localStorage: [{ name: 'jwtToken', value: token }],
          },
        ],
      },
    });
    const page = await context.newPage();
    return { context, page, settingsPage: new SettingsPage(page) };
  }

  test('saves a new username and bio', async ({ browser, request }) => {
    const update = settingsUpdate();
    const auth = new AuthApi(request);
    const session = await openAsUser(browser);

    try {
      await session.settingsPage.open();
      await expect(session.page.getByRole('navigation').getByRole('link', { name: account.username, exact: true })).toBeVisible();

      await session.settingsPage.email.fill(account.email);
      await session.settingsPage.username.fill(update.username);
      await session.settingsPage.bio.fill(update.bio);
      await session.settingsPage.password.fill(account.password);

      const [response] = await Promise.all([
        session.page.waitForResponse((result) => result.request().method() === 'PUT' && result.url().endsWith('/api/user')),
        session.settingsPage.save(),
      ]);
      expect(response.status()).toBe(200);

      await expect(session.page).toHaveURL(new RegExp(`/profile/${update.username}$`));
      await expect(session.page.getByRole('heading', { level: 4, name: update.username })).toBeVisible();
      await expect(session.page.getByText(update.bio)).toBeVisible();

      await session.page.reload();
      await expect(session.page.getByRole('heading', { level: 4, name: update.username })).toBeVisible();
      await expect(session.page.getByText(update.bio)).toBeVisible();

      const current = await auth.currentUser(token);
      expect(current.username).toBe(update.username);
      expect(current.bio).toBe(update.bio);
      expect(current.email).toBe(account.email);

      account = { ...account, username: update.username };
    } finally {
      await session.context.close();
    }
  });

  test('does not save a username that is already taken', async ({ browser, request }) => {
    const auth = new AuthApi(request);
    const before = await auth.currentUser(token);
    const session = await openAsUser(browser);

    try {
      await session.settingsPage.open();
      await session.settingsPage.username.fill(takenUsername);
      await session.settingsPage.password.fill(account.password);

      const [response] = await Promise.all([
        session.page.waitForResponse((result) => result.request().method() === 'PUT' && result.url().endsWith('/api/user')),
        session.settingsPage.save(),
      ]);
      expect(response.status()).toBeGreaterThanOrEqual(400);

      await expect(session.page).toHaveURL(/\/settings/);
      await expect(session.page).not.toHaveURL(new RegExp(`/profile/${takenUsername}$`));
      await expect(session.page.getByRole('navigation').getByRole('link', { name: before.username, exact: true })).toBeVisible();

      const current = await auth.currentUser(token);
      expect(current.username).toBe(before.username);
      expect(current.email).toBe(before.email);
    } finally {
      await session.context.close();
    }
  });
});
