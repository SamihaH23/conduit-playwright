import fs from 'fs';
import { credentialsPath } from './config';

export type Credentials = {
  email: string;
  password: string;
  username: string;
};

export function readCredentials(): Credentials {
  if (process.env.USER_EMAIL && process.env.USER_PASSWORD) {
    return {
      email: process.env.USER_EMAIL,
      password: process.env.USER_PASSWORD,
      username: process.env.USER_NAME ?? '',
    };
  }

  const raw = fs.readFileSync(credentialsPath, 'utf-8');
  return JSON.parse(raw) as Credentials;
}

export function writeCredentials(credentials: Credentials): void {
  fs.mkdirSync('playwright/.auth', { recursive: true });
  fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
}
