import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="v2-header-wrapper" *ngIf="authService.isLoggedIn()">
      <div class="v2-header-container">
        <!-- Brand Logo & Badge -->
        <div class="brand-left">
          <a routerLink="/dashboard" class="brand-link">
            <div class="logo-box">
              <span class="logo-char">R</span>
            </div>
            <span class="brand-name">revlo<span class="brand-ai">.ai</span></span>
          </a>

          <span class="divider"></span>

          <div class="status-chip">
            <span class="emerald-pulse"></span>
            <span class="status-label">DECAP & SPRING ENGINE</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            Ana Sayfa
          </a>
          <a routerLink="/posts" routerLinkActive="active" class="nav-link">
            Yazılar
          </a>
          <a routerLink="/media" routerLinkActive="active" class="nav-link">
            Medya Kütüphanesi
          </a>
          <a
            *ngIf="authService.isAdmin()"
            routerLink="/users"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link"
          >
            Kullanıcılar
          </a>
        </nav>

        <!-- Right Side User Menu -->
        <div class="brand-right">
          <a routerLink="/posts/new" class="btn btn-primary btn-sm add-post-btn">
            + Yeni Yazı
          </a>

          <div class="user-pill">
            <div class="avatar">
              {{ authService.username().substring(0, 1).toUpperCase() }}
            </div>
            <span class="username">{{ authService.username() }}</span>
            <span
              class="badge"
              [ngClass]="authService.isAdmin() ? 'badge-admin' : 'badge-editor'"
            >
              {{ authService.currentUser()?.role }}
            </span>
          </div>

          <button class="btn btn-secondary btn-sm logout-btn" (click)="authService.logout()">
            Çıkış Yap
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .v2-header-wrapper {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: rgba(28, 22, 46, 0.95);
        border-bottom: 1px solid var(--border-subtle);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: 0 4px 25px rgba(0, 0, 0, 0.3);
      }
      .v2-header-container {
        max-width: 1280px;
        margin: 0 auto;
        height: 70px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .brand-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .brand-link {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .logo-box {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--revlo-purple-deep), var(--revlo-purple-bright));
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Outfit', sans-serif;
        font-weight: 900;
        font-size: 18px;
        color: #ffffff;
        box-shadow: 0 0 16px rgba(235, 109, 247, 0.4);
      }
      .brand-name {
        font-family: 'Outfit', sans-serif;
        font-weight: 900;
        font-size: 20px;
        color: #ffffff;
        letter-spacing: -0.03em;
      }
      .brand-ai {
        color: var(--revlo-magenta);
      }
      .divider {
        width: 1px;
        height: 20px;
        background: var(--border-subtle);
      }
      .status-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--revlo-emerald-bg);
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 4px 10px;
        border-radius: 8px;
      }
      .emerald-pulse {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--revlo-emerald);
      }
      .status-label {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.05em;
        color: var(--revlo-emerald);
      }
      .nav-links {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .nav-link {
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-muted);
        transition: var(--transition-smooth);
      }
      .nav-link:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.06);
      }
      .nav-link.active {
        color: #ffffff;
        background: rgba(126, 34, 206, 0.35);
        border: 1px solid rgba(235, 109, 247, 0.4);
        font-weight: 700;
      }
      .brand-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .user-pill {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(255, 255, 255, 0.05);
        padding: 4px 12px 4px 4px;
        border-radius: var(--radius-pill);
        border: 1px solid var(--border-subtle);
      }
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--revlo-purple-deep), var(--revlo-purple-bright));
        color: #ffffff;
        font-weight: 800;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .username {
        font-weight: 700;
        font-size: 13px;
        color: #ffffff;
      }
      .add-post-btn {
        padding: 7px 16px;
        font-size: 13px;
      }
      .logout-btn {
        padding: 7px 16px;
        font-size: 13px;
      }
    `,
  ],
})
export class NavbarComponent {
  authService = inject(AuthService);
}
