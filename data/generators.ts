import { faker } from '@faker-js/faker';

export type ArticleInput = {
  title: string;
  description: string;
  body: string;
  tag: string;
};

export type AccountInput = {
  username: string;
  email: string;
  password: string;
};

export type SettingsInput = {
  username: string;
  bio: string;
  password: string;
};

function suffix(): string {
  return `${Date.now().toString(36)}${faker.string.alphanumeric(4)}`.toLowerCase();
}

function plainWord(value: string): string {
  const letters = value.replace(/[^a-zA-Z]/g, '');
  return letters || 'sample';
}

export function articlePayload(): ArticleInput {
  const id = suffix();
  return {
    title: `Playwright ${plainWord(faker.word.adjective())} ${plainWord(faker.word.noun())} ${id}`,
    description: faker.lorem.sentence(),
    body: `${faker.lorem.sentence()} ${faker.lorem.sentence()}`,
    tag: `pw${id}`,
  };
}

export function articleUpdate(): ArticleInput {
  const id = suffix();
  return {
    title: `Updated ${plainWord(faker.word.adjective())} ${plainWord(faker.word.noun())} ${id}`,
    description: faker.lorem.sentence(),
    body: `${faker.lorem.sentence()} ${faker.lorem.sentence()}`,
    tag: `pw${id}`,
  };
}

export function invalidArticle(): ArticleInput {
  return { ...articlePayload(), title: '' };
}

export function newAccount(): AccountInput {
  const id = suffix();
  return {
    username: `pw${id}`,
    email: `pw${id}@example.com`,
    password: `Pw1!${faker.string.alphanumeric(8)}`,
  };
}

export function settingsUpdate(): SettingsInput {
  return {
    username: `pw${suffix()}`,
    bio: faker.lorem.sentence(),
    password: `Pw1!${faker.string.alphanumeric(8)}`,
  };
}

export function invalidSettings(): { username: string; email: string } {
  return { username: '', email: 'not-an-email' };
}

export function missingTag(): string {
  return `pwmissing${suffix()}`;
}
