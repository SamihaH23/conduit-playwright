import type { APIResponse } from '@playwright/test';

export async function readBody(response: APIResponse): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) {
    return {};
  }
  return JSON.parse(text) as Record<string, unknown>;
}

export function authHeader(token: string): { Authorization: string } {
  // This API follows the RealWorld contract and expects "Token", not "Bearer".
  return { Authorization: `Token ${token}` };
}
