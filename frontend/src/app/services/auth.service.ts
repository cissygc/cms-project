import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, AuthResponse, LoginPayload } from '../models/user.model';
import { API_CONFIG } from '../config';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private currentUserSignal = signal<User | null>(this.getStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal()?.token);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  readonly username = computed(() => this.currentUserSignal()?.username || '');

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(API_CONFIG.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.currentUserSignal()?.token || null;
  }

  getTokenType(): string {
    return this.currentUserSignal()?.type || 'Bearer';
  }

  login(credentials: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_CONFIG.baseUrl}/api/auth/signin`, credentials)
      .pipe(
        tap((res) => {
          const user: User = {
            username: res.username,
            role: res.role,
            token: res.token,
            type: res.type || 'Bearer',
          };
          this.currentUserSignal.set(user);
          localStorage.setItem(API_CONFIG.storageKey, JSON.stringify(user));
          this.toastService.success(`Hoş geldin, ${user.username}!`);
          this.router.navigate(['/dashboard']);
        }),
        catchError((err) => {
          const message =
            err?.error?.exception?.message ||
            err?.error?.message ||
            'Giriş yapılamadı. Kullanıcı adı veya şifre hatalı.';
          this.toastService.error(message);
          return throwError(() => new Error(message));
        })
      );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(API_CONFIG.storageKey);
    this.toastService.info('Oturum kapatıldı.');
    this.router.navigate(['/login']);
  }
}
