import { Domain } from './domain';

export interface Patient {
  id?: string;
  name: string;
  email: string;
  document: string;
  birthDate: string;
  gender?: Domain;
  phone?: string;
  notes?: string;
  createdAt?: string;
  userId?: string | null;
}

export interface PatientQueryParams {
  page: number;
  size: number;
  sort?: string;
  direction?: string;
  text?: string;
  gender?: string;
}

export interface PatientPayload {
  name: string;
  email: string;
  document: string;
  birthDate: string;
  gender: string;
  phone?: string | null;
  notes?: string | null;
}
