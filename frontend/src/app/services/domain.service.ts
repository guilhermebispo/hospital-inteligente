import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Domain } from '../models/domain';

const API = `${environment.baseUrl}/domains`;

@Injectable({
  providedIn: 'root'
})
export class DomainService {

  constructor(private http: HttpClient) { }

  fetchRoles(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${API}/roles`);
  }
}
