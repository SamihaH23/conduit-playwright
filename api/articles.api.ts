import type { APIRequestContext } from '@playwright/test';
import type { ArticleInput } from '../data/generators';
import { AuthApi } from './auth.api';
import { apiUrl } from './config';
import { authHeader, readBody } from './http';
import { readCredentials } from './session';

export type Article = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
};

export type ArticleList = {
  status: number;
  articles: Article[];
  articlesCount: number;
};

export function articleSlugFromUrl(url: string): string {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] ?? '');
}

export class ArticlesApi {
  private token: string | undefined;

  constructor(
    private readonly request: APIRequestContext,
    private readonly auth = new AuthApi(request),
  ) {}

  private async bearer(): Promise<string> {
    if (!this.token) {
      const credentials = readCredentials();
      const user = await this.auth.login(credentials.email, credentials.password);
      this.token = user.token;
    }
    return this.token;
  }

  async create(input: ArticleInput): Promise<Article> {
    const token = await this.bearer();
    const response = await this.request.post(`${apiUrl}/articles`, {
      headers: authHeader(token),
      data: {
        article: {
          title: input.title,
          description: input.description,
          body: input.body,
          tagList: input.tag ? [input.tag] : [],
        },
      },
    });
    const body = await readBody(response);
    if (response.status() !== 201) {
      throw new Error(`Create article failed (${response.status()}): ${JSON.stringify(body)}`);
    }
    return body.article as Article;
  }

  async get(slug: string): Promise<{ status: number; article?: Article }> {
    const response = await this.request.get(`${apiUrl}/articles/${encodeURIComponent(slug)}`);
    const body = await readBody(response);
    return { status: response.status(), article: body.article as Article | undefined };
  }

  async delete(slug: string): Promise<number> {
    const token = await this.bearer();
    const response = await this.request.delete(`${apiUrl}/articles/${encodeURIComponent(slug)}`, {
      headers: authHeader(token),
    });
    return response.status();
  }

  async tags(): Promise<string[]> {
    const response = await this.request.get(`${apiUrl}/tags`);
    const body = await readBody(response);
    return (body.tags as string[]) ?? [];
  }

  async listByTag(tag: string): Promise<ArticleList> {
    const response = await this.request.get(`${apiUrl}/articles`, {
      params: { tag, limit: 10, offset: 0 },
    });
    const body = await readBody(response);
    return {
      status: response.status(),
      articles: (body.articles as Article[]) ?? [],
      articlesCount: (body.articlesCount as number) ?? 0,
    };
  }

  async tagWithArticles(): Promise<string> {
    const tags = await this.tags();
    for (const tag of tags) {
      const list = await this.listByTag(tag);
      if (list.articlesCount > 0 && list.articles.length > 0) {
        return tag;
      }
    }
    throw new Error('No popular tag currently has articles');
  }
}
