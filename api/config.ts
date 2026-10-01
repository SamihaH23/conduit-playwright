import path from 'path';

export const apiUrl = (process.env.API_URL ?? 'https://conduit-api.bondaracademy.com/api').replace(/\/$/, '');

export const authDir = path.join('playwright', '.auth');
export const storageStatePath = path.join(authDir, 'user.json');
export const credentialsPath = path.join(authDir, 'credentials.json');
