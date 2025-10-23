import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserCreatePayload, UserQueryParams } from '../models/user';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/paginated-response';

const API = `${environment.baseUrl}/users`;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  list(paramsModel: UserQueryParams): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', paramsModel.page.toString())
      .set('size', paramsModel.size.toString());

    if (paramsModel.text) {
      params = params.set('text', paramsModel.text);
    }
    if (paramsModel.role) {
      params = params.set('role', paramsModel.role);
    }
    if (paramsModel.sort && !paramsModel.sort.startsWith('undefined')) {
      const [field, dir] = paramsModel.sort.split(',');
      params = params.set('sort', field);
      const direction = paramsModel.direction || dir;
      if (direction) {
        params = params.set('direction', direction);
      }
    } else if (paramsModel.direction) {
      params = params.set('direction', paramsModel.direction);
    }

    return this.http.get<PaginatedResponse<User>>(API, { params });
  }

  findById(id: string): Observable<User> {
    return this.http.get<User>(`${API}/${id}`);
  }

  findByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${API}/email/${email}`);
  }

  create(user: UserCreatePayload): Observable<User> {
    return this.http.post<User>(API, user);
  }

  update(user: User): Observable<User> {
    return this.http.put<User>(`${API}/${user.id}`, user);
  }

  updateRole(id: string, role: string): Observable<User> {
    return this.http.patch<User>(`${API}/${id}/role`, { role });
  }

  updatePassword(id: string, password: string): Observable<User> {
    return this.http.patch<User>(`${API}/${id}/password`, { password });
  }

  delete(id: string): Observable<User> {
    return this.http.delete<User>(`${API}/${id}`);
  }
}
