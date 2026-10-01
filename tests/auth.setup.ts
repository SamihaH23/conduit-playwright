import fs from 'fs';
import { test as setup } from '@playwright/test';
import { AuthApi } from '../api/auth.api';
import { storageStatePath } from '../api/config';
import { readCredentials, writeCredentials } from '../api/session';
import { newAccount } from '../data/generators';
import { LoginPage } from '../pages/login.page';

setup('authenticate', async ({ page, request }) => {
  const auth = new AuthApi(request);
  let credentials = process.env.USER_EMAIL && process.env.USER_PASSWORD ? readCredentials() : undefined;

  if (!credentials) {
    const account = newAccount();
    const registered = await auth.register(account);
    credentials = {
      email: registered.email,
      password: account.password,
      username: registered.username,
    };
    writeCredentials(credentials);
    console.log(`Registered session user ${credentials.username} <${credentials.email}>`);
  }

  const loginPage = new LoginPage(page);
  await loginPage.open();
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/tags') && response.ok()),
    loginPage.login(credentials.email, credentials.password),
  ]);
  await loginPage.expectLoggedIn();

  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: storageStatePath });
});
