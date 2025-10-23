import { Domain } from './domain';

export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: Domain;
  createdAt: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UserQueryParams {
  page: number;
  size: number;
  sort?: string;
  direction?: string;
  text?: string;
  role?: string;
}
