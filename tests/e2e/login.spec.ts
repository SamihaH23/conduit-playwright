import { AuthApi } from '../../api/auth.api';
import { newAccount } from '../../data/generators';
import { expect, test } from '../../fixtures/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login', () => {
  test('signs in with valid credentials and opens the home feed', async ({ page, loginPage, request }) => {
    const account = newAccount();
    const auth = new AuthApi(request);
    const user = await auth.register(account);

    await loginPage.open();
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/tags') && response.ok()),
      loginPage.login(user.email, account.password),
    ]);

    await expect(page).toHaveURL((url) => new URL(url).pathname === '/');
    await loginPage.expectLoggedIn();
    await expect(page.getByRole('navigation').getByRole('link', { name: user.username, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toHaveCount(0);
  });

  test('shows an error for an invalid password and stays on the login page', async ({ page, loginPage, request }) => {
    const account = newAccount();
    const auth = new AuthApi(request);
    const user = await auth.register(account);

    await loginPage.open();
    const [response] = await Promise.all([
      page.waitForResponse((result) => result.request().method() === 'POST' && result.url().includes('/api/users/login')),
      loginPage.login(user.email, `${account.password}wrong`),
    ]);
    expect(response.status()).toBe(403);

    await expect(page).toHaveURL(/\/login\/?$/);
    await loginPage.expectErrorMessage('email or password is invalid');
    await expect(page.getByRole('link', { name: 'New Article' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });
});
