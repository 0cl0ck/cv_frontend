import axios from 'axios';

const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const cleanBase = rawBase.replace(/\/+$/, '');

export const httpClient = axios.create({
  baseURL: `${cleanBase}/api`,
  withCredentials: true,
  timeout: 50000,
});
