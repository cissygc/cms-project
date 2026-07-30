import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <div class="security-badge">🔐 GÜVENLİ YÖNETİCİ ALANI</div>
          <h1 class="page-title">Kullanıcı Yönetimi</h1>
          <p class="section-sub">Sistemdeki editör ve yönetici hesaplarını kontrol edin</p>
        </div>
        <a routerLink="/users/new" class="btn btn-primary">+ Yeni Kullanıcı Ekle</a>
      </div>

      <div class="glass-card main-card">
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>Kullanıcı hesapları taranıyor...</span>
        </div>

        <div *ngIf="!isLoading && users.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>Henüz Kayıtlı Kullanıcı Yok</h3>
        </div>

        <table *ngIf="!isLoading && users.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Yetki Rolü</th>
              <th>İçerik Katkısı</th>
              <th style="text-align: right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>
                <div class="user-profile">
                  <div class="user-avatar-circle">
                    {{ (user.username || 'U').substring(0, 1).toUpperCase() }}
                  </div>
                  <div class="user-details">
                    <span class="user-name">{{ user.username }}</span>
                    <span *ngIf="isSelf(user)" class="self-tag">(Aktif Oturum)</span>
                  </div>
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  [ngClass]="user.role === 'ADMIN' ? 'badge-admin' : 'badge-editor'"
                >
                  {{ user.role }}
                </span>
              </td>
              <td>
                <div class="posts-count-badge">
                  <span>📝 <strong>{{ user.postCount ?? 0 }}</strong> Yazı</span>
                </div>
              </td>
              <td style="text-align: right">
                <button
                  class="btn btn-danger btn-sm"
                  (click)="onDelete(user)"
                  [disabled]="isSelf(user) || deletingId === user.id"
                >
                  Hesabı Sil
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .security-badge {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--danger);
        margin-bottom: 6px;
      }
      .section-sub {
        color: var(--text-muted);
        font-size: 14px;
        margin-top: 4px;
      }
      .main-card {
        padding: 0;
        overflow: hidden;
      }
      .user-profile {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .user-avatar-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent-cyan), var(--primary));
        color: #ffffff;
        font-weight: 800;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
      }
      .user-details {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .user-name {
        font-weight: 700;
        color: #ffffff;
        font-size: 15px;
      }
      .self-tag {
        font-size: 12px;
        color: var(--accent-cyan);
        font-weight: 700;
      }
      .posts-count-badge {
        font-size: 13px;
        color: var(--text-muted);
      }
      .posts-count-badge strong {
        color: #ffffff;
      }
      .loading-state,
      .empty-state {
        padding: 60px;
        text-align: center;
        color: var(--text-muted);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .empty-icon { font-size: 40px; }
      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .btn-sm { padding: 7px 14px; font-size: 12px; }
    `,
  ],
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  users: User[] = [];
  isLoading = true;
  deletingId: number | string | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (list) => {
        this.users = list;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Kullanıcılar alınamadı.');
        this.isLoading = false;
      },
    });
  }

  isSelf(user: User): boolean {
    return user.username === this.authService.username();
  }

  onDelete(user: User): void {
    if (!user.id) return;
    if (!confirm(`"${user.username}" kullanıcısını silmek istediğinize emin misiniz?`)) return;

    this.deletingId = user.id;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.toastService.success(`"${user.username}" kullanıcısı silindi.`);
        this.users = this.users.filter((u) => u.id !== user.id);
        this.deletingId = null;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Kullanıcı silinemedi.');
        this.deletingId = null;
      },
    });
  }
}
