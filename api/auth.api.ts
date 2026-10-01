import type { APIRequestContext } from '@playwright/test';
import type { AccountInput } from '../data/generators';
import { apiUrl } from './config';
import { authHeader, readBody } from './http';

export type AuthUser = {
  email: string;
  username: string;
  bio: string | null;
  token: string;
  image: string | null;
};

export class AuthApi {
  constructor(private readonly request: APIRequestContext) {}

  async register(account: AccountInput): Promise<AuthUser> {
    const response = await this.request.post(`${apiUrl}/users`, {
      data: { user: account },
    });
    const body = await readBody(response);
    if (response.status() !== 201) {
      throw new Error(`Register failed (${response.status()}): ${JSON.stringify(body)}`);
    }
    return (body.user ?? body) as AuthUser;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await this.request.post(`${apiUrl}/users/login`, {
      data: { user: { email, password } },
    });
    const body = await readBody(response);
    if (response.status() !== 200) {
      throw new Error(`Login failed (${response.status()}): ${JSON.stringify(body)}`);
    }
    return body.user as AuthUser;
  }

  async currentUser(token: string): Promise<AuthUser> {
    const response = await this.request.get(`${apiUrl}/user`, {
      headers: authHeader(token),
    });
    const body = await readBody(response);
    if (response.status() !== 200) {
      throw new Error(`Current user failed (${response.status()}): ${JSON.stringify(body)}`);
    }
    return body.user as AuthUser;
  }

  async updateUser(token: string, user: Record<string, string>): Promise<{ status: number; user?: AuthUser; body: Record<string, unknown> }> {
    const response = await this.request.put(`${apiUrl}/user`, {
      headers: authHeader(token),
      data: { user },
    });
    const body = await readBody(response);
    return {
      status: response.status(),
      user: body.user as AuthUser | undefined,
      body,
    };
  }
}
