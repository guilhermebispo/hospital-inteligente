import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/paginated-response';
import { Patient, PatientPayload, PatientQueryParams } from '../models/patient';

const API = `${environment.baseUrl}/patients`;

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private readonly http: HttpClient) {}

  list(paramsModel: PatientQueryParams): Observable<PaginatedResponse<Patient>> {
    let params = new HttpParams()
      .set('page', paramsModel.page.toString())
      .set('size', paramsModel.size.toString());

    if (paramsModel.text) {
      params = params.set('text', paramsModel.text);
    }
    if (paramsModel.gender) {
      params = params.set('gender', paramsModel.gender);
    }
    if (paramsModel.sort) {
      params = params.set('sort', paramsModel.sort);
    }
    if (paramsModel.direction) {
      params = params.set('direction', paramsModel.direction);
    }

    return this.http.get<PaginatedResponse<Patient>>(API, { params });
  }

  create(payload: PatientPayload): Observable<Patient> {
    return this.http.post<Patient>(API, this.toApiPayload(payload));
  }

  update(id: string, payload: Partial<PatientPayload>): Observable<Patient> {
    return this.http.put<Patient>(`${API}/${id}`, this.toApiPayload(payload));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }

  createUser(id: string): Observable<any> {
    return this.http.post(`${API}/${id}/create-user`, {});
  }

  private toApiPayload(payload: Partial<PatientPayload>): any {
    if (!payload) {
      return payload;
    }
    const data: any = { ...payload };
    if (payload.birthDate !== undefined) {
      data.birth_date = payload.birthDate;
      delete data.birthDate;
    }
    if (payload.gender !== undefined) {
      data.gender = payload.gender;
    }
    return data;
  }
}
