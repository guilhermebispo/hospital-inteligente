import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.url.includes('/login') || request.headers.has('Skip-Auth')) {
      return next.handle(request);
    }

    const raw = localStorage.getItem('token');
    const bearer = raw
      ? (raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`)
      : null;

    const req = bearer
      ? request.clone({ setHeaders: { Authorization: bearer } })
      : request;

    return next.handle(req);
  }
}

export const AuthInterceptorProvider = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
