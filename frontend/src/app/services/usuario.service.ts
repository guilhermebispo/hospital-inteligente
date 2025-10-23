import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCreatePayload } from '../models/usuario';
import { environment } from '../../environments/environment';
import { RespostaPaginada } from '../models/resposta-paginada';
import { UsuarioParametro } from '../models/usuario';

const API = `${environment.baseUrl}/users`;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http: HttpClient) { }

  listar(filtro: UsuarioParametro): Observable<RespostaPaginada<Usuario>> {
    let params = new HttpParams()
      .set('page', filtro.page.toString())
      .set('size', filtro.size.toString());

    if (filtro.texto) {
      params = params.set('texto', filtro.texto);
    }
    if (filtro.perfil) {
      params = params.set('perfil', filtro.perfil);
    }
    if (filtro.sort && !filtro.sort.startsWith('undefined')) {
      const [field, dir] = filtro.sort.split(',');
      params = params.set('sort', field);
      const direction = filtro.direction || dir;
      if (direction) {
        params = params.set('direction', direction);
      }
    } else if (filtro.direction) {
      params = params.set('direction', filtro.direction);
    }

    return this.http.get<RespostaPaginada<Usuario>>(API, { params });
  }

  buscarPorId(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${API}/${id}`);
  }

  buscarPorEmail(email: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${API}/email/${email}`);
  }

  criar(usuario: UsuarioCreatePayload): Observable<Usuario> {
    return this.http.post<Usuario>(API, usuario);
  }

  atualizar(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${API}/${usuario.id}`, usuario);
  }

  atualizarPerfil(id: string, perfil: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${API}/${id}/perfil`, { perfil });
  }

  atualizarSenha(id: string, senha: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${API}/${id}/senha`, { senha });
  }

  deletar(id: string): Observable<Usuario> {
    return this.http.delete<Usuario>(`${API}/${id}`);
  }
}
