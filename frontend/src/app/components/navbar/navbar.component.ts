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
        <!-- Brand Logo -->
        <div class="brand-left">
          <a routerLink="/dashboard" class="brand-link">
            <div class="logo-box">
              <span class="logo-char">R</span>
            </div>
            <span class="brand-name">revlo<span class="brand-ai">.ai</span></span>
          </a>
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
        background: linear-gradient(135deg, #2a1b4e 0%, #1a0e36 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .v2-header-container {
        max-width: 1280px;
        margin: 0 auto;
        height: 68px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .brand-left {
        display: flex;
        align-items: center;
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
        background: linear-gradient(135deg, #7c3aed, #d946ef);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Outfit', sans-serif;
        font-weight: 900;
        font-size: 18px;
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(217, 70, 239, 0.35);
      }
      .brand-name {
        font-family: 'Outfit', sans-serif;
        font-weight: 900;
        font-size: 20px;
        color: #ffffff;
        letter-spacing: -0.03em;
      }
      .brand-ai {
        color: #d946ef;
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
        color: #cbd5e1;
        transition: var(--transition-smooth);
      }
      .nav-link:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.08);
      }
      .nav-link.active {
        color: #ffffff;
        background: rgba(124, 58, 237, 0.4);
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
        background: rgba(255, 255, 255, 0.08);
        padding: 4px 14px 4px 4px;
        border-radius: var(--radius-pill);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: linear-gradient(135deg, #7c3aed, #d946ef);
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
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff !important;
        border-color: rgba(255, 255, 255, 0.2);
      }
      .logout-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5 !important;
        border-color: rgba(239, 68, 68, 0.4);
      }
    `,
  ],
})
export class NavbarComponent {
  authService = inject(AuthService);
}