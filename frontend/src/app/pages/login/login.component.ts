import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- min-h-[80vh]: ekranın yaklaşık %80'i kadar yükseklik, kartı dikeyde ortalamak için -->
    <div class="min-h-[80vh] flex items-center justify-center">
      <div class="w-full max-w-md bg-surface border border-border rounded-2xl shadow-sm p-10">

        <!-- Logo + başlık -->
        <div class="text-center mb-8">
          <img src="assets/branding/revlo-logo.png" alt="Revlo" class="h-10 w-auto mx-auto mb-3" />
          <p class="text-sm text-text-muted font-medium">İçerik Yönetim Sistemi</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-text-primary mb-1.5" for="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              class="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              [(ngModel)]="username"
              required
              placeholder="Kullanıcı adınız"
              autocomplete="username"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-text-primary mb-1.5" for="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              class="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              [(ngModel)]="password"
              required
              placeholder="Şifreniz"
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="w-full py-3 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
            [disabled]="isLoading || !loginForm.valid"
          >
            {{ isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
          </button>
        </form>

        <p class="text-center text-xs text-text-muted mt-8 pt-6 border-t border-border">
          Revlo AI İçerik Yönetim Sistemi
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  authService = inject(AuthService);

  username = '';
  password = '';
  isLoading = false;

  onSubmit(): void {
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}