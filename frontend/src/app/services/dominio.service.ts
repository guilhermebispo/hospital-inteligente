import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Dominio } from '../models/dominio';

const API = `${environment.baseUrl}/dominios`;

@Injectable({
  providedIn: 'root'
})
export class DominioService {

  constructor(private http: HttpClient) { }

  buscarPerfis(): Observable<Dominio[]> {
    return this.http.get<Dominio[]>(`${API}/perfis`);
  }
}
