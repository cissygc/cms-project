import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page-wrapper">
      <div class="glass-card login-card">
        <div class="login-brand-header">
          <div class="logo-box">
            <span class="logo-char">R</span>
          </div>
          <h1 class="brand-title">revlo<span class="brand-sub">.ai</span></h1>
          <p class="login-desc">Enterprise Headless CMS Platformu</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              class="form-input login-input"
              [(ngModel)]="username"
              required
              placeholder="kullaniciadi"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input login-input"
              [(ngModel)]="password"
              required
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="isLoading || !loginForm.valid"
          >
            <span *ngIf="!isLoading">Giriş Yap</span>
            <span *ngIf="isLoading">Giriş yapılıyor...</span>
          </button>
        </form>

        <div class="login-footer">
          <span>Revlo AI Content Management Engine</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page-wrapper {
        min-height: calc(100vh - 72px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .login-card {
        width: 100%;
        max-width: 440px;
        padding: 44px;
        background: #ffffff !important;
        border-radius: 24px;
        box-shadow: 0px 24px 64px rgba(124, 58, 237, 0.12);
        border: 1px solid rgba(124, 58, 237, 0.25);
      }
      .login-brand-header {
        text-align: center;
        margin-bottom: 32px;
      }
      .logo-box {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: linear-gradient(135deg, var(--revlo-purple-deep), var(--revlo-purple-main));
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Outfit', sans-serif;
        font-weight: 900;
        font-size: 28px;
        color: #ffffff;
        margin: 0 auto 16px;
        box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
      }
      .brand-title {
        font-size: 30px;
        font-weight: 900;
        color: #000000 !important;
        margin-bottom: 4px;
      }
      .brand-sub {
        color: var(--revlo-purple-main);
      }
      .login-desc {
        font-size: 14px;
        color: #475569 !important;
        font-weight: 600;
      }
      .form-group {
        margin-bottom: 20px;
      }
      .form-label {
        font-size: 14px;
        font-weight: 800;
        color: #000000 !important;
        margin-bottom: 8px;
        display: block;
      }
      .login-input {
        width: 100%;
        padding: 14px 18px;
        background: #ffffff !important;
        border: 1px solid rgba(124, 58, 237, 0.25) !important;
        color: #000000 !important;
        font-weight: 600 !important;
        font-size: 15px;
        border-radius: 12px;
      }
      .login-input::placeholder {
        color: #64748b !important;
        font-weight: 400;
      }
      .login-input:focus {
        border-color: var(--revlo-purple-main) !important;
        box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.15) !important;
        outline: none;
      }
      .btn-block {
        width: 100%;
        padding: 14px;
        font-size: 15px;
        margin-top: 12px;
      }
      .login-footer {
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid rgba(124, 58, 237, 0.15);
        text-align: center;
        font-size: 12px;
        color: #64748b !important;
        font-weight: 600;
      }
    `,
  ],
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
