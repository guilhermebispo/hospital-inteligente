import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Credencial } from '../models/credencial';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario';
import { ToastrService } from 'ngx-toastr';

const API = environment.baseUrl;

export interface UserToken {
  sub: string;
  name?: string;
  email?: string;
  roles?: string[];
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtService: JwtHelperService = new JwtHelperService();

  loggedIn$ = new BehaviorSubject<boolean>(this.isAuthenticated());
  currentUser$ = new BehaviorSubject<Usuario | null>(null);

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService,
    private toastrService: ToastrService
  ) {
  }

  authenticate(creds: Credencial) {
    return this.http.post(`${API}/login`, creds, {
      observe: 'response'
    });
  }

  successfulLogin(authToken: string) {
    localStorage.setItem('token', authToken.replace(/^Bearer\s+/i, ''));
    this.loggedIn$.next(true);

    this.usuarioService.buscarPorEmail(this.getUserName()).subscribe({
      next: (res: Usuario) => {
        this.currentUser$.next(res);
      },
      error: () => {
        this.toastrService.error('Erro ao buscar usuário');
      }
    });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token ? !this.jwtService.isTokenExpired(token) : false;
  }

  logout() {
    localStorage.clear();
    this.loggedIn$.next(false);
    this.currentUser$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): UserToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return this.jwtService.decodeToken(token) as UserToken;
    } catch {
      return null;
    }
  }

  getUserName(): string {
    const user = this.getUser();
    return user?.name || user?.sub || 'Usuário';
  }

  getUserRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }
}
