import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const tokenType = authService.getTokenType();

  let headers = req.headers.set('ngrok-skip-browser-warning', 'true');

  if (token) {
    headers = headers.set('Authorization', `${tokenType} ${token}`);
  }

  const clonedReq = req.clone({ headers });
  return next(clonedReq);
};
