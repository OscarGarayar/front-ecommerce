import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStore } from '../state/session.store';

export const authBearerInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionStore);
  const token = session.snapshot.token;

  const isPublicAuth =
    req.url.includes('/api/v1/authentication/sign-in') ||
    req.url.includes('/api/v1/authentication/sign-up');

  if (!token || isPublicAuth) return next(req);

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};

export const provideAppHttp = () =>
  provideHttpClient(withInterceptors([authBearerInterceptor]));
