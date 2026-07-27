import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container user-form-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Yeni Kullanıcı Ekle</h1>
          <p class="subtitle">Sisteme yeni bir Editör veya Yönetici hesabı tanımlayın</p>
        </div>
        <a routerLink="/users" class="btn btn-secondary">← Kullanıcılara Dön</a>
      </div>

      <div class="glass-card form-card">
        <form (ngSubmit)="onSubmit()" #userForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              class="form-input"
              [(ngModel)]="username"
              required
              minlength="3"
              placeholder="kullaniciadi"
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              [(ngModel)]="password"
              required
              minlength="6"
              placeholder="En az 6 karakter"
              autocomplete="new-password"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="role">Kullanıcı Rolü</label>
            <select id="role" name="role" class="form-select" [(ngModel)]="role" required>
              <option value="EDITOR">EDITOR (İçerik Yöneticisi)</option>
              <option value="ADMIN">ADMIN (Sistem Yöneticisi)</option>
            </select>
          </div>

          <div class="form-actions">
            <a routerLink="/users" class="btn btn-secondary">İptal</a>
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting || !userForm.valid">
              <span *ngIf="!isSubmitting">Kullanıcıyı Oluştur</span>
              <span *ngIf="isSubmitting">Oluşturuluyor...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .user-form-container {
        max-width: 600px;
      }
      .subtitle {
        color: var(--text-muted);
        font-size: 14px;
        margin-top: 4px;
      }
      .form-card {
        padding: 32px;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--bg-card-border);
      }
    `,
  ],
})
export class UserFormComponent {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  username = '';
  password = '';
  role: 'EDITOR' | 'ADMIN' = 'EDITOR';
  isSubmitting = false;

  onSubmit(): void {
    if (!this.username || !this.password || !this.role) return;

    this.isSubmitting = true;
    this.userService
      .createUser({
        username: this.username.trim(),
        password: this.password,
        role: this.role,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.success(
            `"${this.username}" kullanıcısı (${this.role}) başarıyla oluşturuldu.`
          );
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error(err.message || 'Kullanıcı oluşturulamadı.');
        },
      });
  }
}
