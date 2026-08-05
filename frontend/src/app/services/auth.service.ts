import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthResponse, LoginPayload } from '../models/user.model';
import { API_CONFIG } from '../config';
import { ToastService } from './toast.service';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private userService = inject(UserService);

  private currentUserSignal = signal<AuthResponse | null>(this.getStoredUser());

  // Profil fotoğrafı AuthResponse'un (login yanıtının) bir parçası değil -
  // ayrı bir /api/users/me çağrısıyla geliyor. Sidebar'ın ve profilin aynı
  // anda güncel kalması için burada tek bir paylaşılan signal tutuyoruz.
  private avatarUrlSignal = signal<string>('');
  readonly avatarUrl = this.avatarUrlSignal.asReadonly();

  setAvatarUrl(url: string): void {
    this.avatarUrlSignal.set(url);
  }

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal()?.token);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  readonly username = computed(() => this.currentUserSignal()?.username || '');

  constructor() {
    // Sayfa yenilendiğinde (oturum localStorage'dan geri yükleniyor) sidebar
    // component'i YENİDEN OLUŞTURULMUYOR olabilir (SPA navigasyonunda aynı
    // instance kalabilir), bu yüzden avatarı burada - servis oluşturulur
    // oluşturulmaz - bir kez çekiyoruz. Giriş anında da login() içinde ayrıca
    // çekiliyor (bkz. aşağı).
    if (this.isLoggedIn()) {
      this.fetchAndSetAvatar();
    }
  }

  private fetchAndSetAvatar(): void {
    this.userService.getMyProfile().subscribe({
      next: (user) => this.avatarUrlSignal.set(user.avatarUrl || ''),
      error: () => {},
    });
  }

  getStoredUser(): AuthResponse | null {
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
          const session: AuthResponse = {
            username: res.username,
            role: res.role,
            token: res.token,
            type: res.type || 'Bearer',
          };
          this.currentUserSignal.set(session);
          localStorage.setItem(API_CONFIG.storageKey, JSON.stringify(session));
          this.fetchAndSetAvatar();
          this.toastService.success(`Hoş geldin, ${session.username}!`);
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
    this.avatarUrlSignal.set('');
    localStorage.removeItem(API_CONFIG.storageKey);
    this.toastService.info('Oturum kapatıldı.');
    this.router.navigate(['/login']);
  }
}