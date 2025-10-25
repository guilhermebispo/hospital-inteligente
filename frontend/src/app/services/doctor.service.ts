import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/paginated-response';
import { Doctor, DoctorPayload, DoctorQueryParams } from '../models/doctor';

const API = `${environment.baseUrl}/doctors`;

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private readonly http: HttpClient) {}

  list(paramsModel: DoctorQueryParams): Observable<PaginatedResponse<Doctor>> {
    let params = new HttpParams()
      .set('page', paramsModel.page.toString())
      .set('size', paramsModel.size.toString());

    if (paramsModel.text) {
      params = params.set('text', paramsModel.text);
    }
    if (paramsModel.specialty) {
      params = params.set('specialty', paramsModel.specialty);
    }
    if (paramsModel.sort) {
      params = params.set('sort', paramsModel.sort);
    }
    if (paramsModel.direction) {
      params = params.set('direction', paramsModel.direction);
    }

    return this.http.get<PaginatedResponse<Doctor>>(API, { params });
  }

  create(payload: DoctorPayload): Observable<Doctor> {
    return this.http.post<Doctor>(API, payload);
  }

  update(id: string, payload: Partial<DoctorPayload>): Observable<Doctor> {
    return this.http.put<Doctor>(`${API}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
