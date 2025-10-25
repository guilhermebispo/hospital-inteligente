export interface Doctor {
  id?: string;
  name: string;
  email: string;
  crm: string;
  specialty: string;
  createdAt?: string;
}

export interface DoctorQueryParams {
  page: number;
  size: number;
  sort?: string;
  direction?: string;
  text?: string;
  specialty?: string;
}

export interface DoctorPayload {
  name: string;
  email: string;
  crm: string;
  specialty: string;
}
