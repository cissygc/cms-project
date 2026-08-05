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
    <div class="max-w-xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-extrabold text-text-primary">Yeni Kullanıcı Ekle</h1>
          <p class="text-text-muted text-sm mt-1">Sisteme yeni bir Editör veya Yönetici hesabı tanımlayın</p>
        </div>
        <a routerLink="/users" class="text-sm font-semibold text-text-muted hover:text-primary">← Geri</a>
      </div>

      <form (ngSubmit)="onSubmit()" #userForm="ngForm" class="bg-surface border border-border rounded-2xl p-6 space-y-5">

        <!-- Kullanıcı adı -->
        <div>
          <label class="block text-sm font-bold text-text-primary mb-1.5" for="username">Kullanıcı Adı</label>
          <input
            type="text"
            id="username"
            name="username"
            class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            [(ngModel)]="username"
            required
            minlength="3"
            placeholder="kullaniciadi"
            autocomplete="off"
          />
        </div>

        <!-- İSİM - bu alan ÖNCEDEN HİÇ YOKTU ama backend artık zorunlu istiyor.
             Eklemezsek kullanıcı oluşturma isteği backend'den 400 hatası döner. -->
        <div>
          <label class="block text-sm font-bold text-text-primary mb-1.5" for="fullName">Ad Soyad</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            [(ngModel)]="fullName"
            required
            minlength="2"
            placeholder="Örn: Ceren Nur Gürcan"
          />
        </div>

        <!-- Şifre -->
        <div>
          <label class="block text-sm font-bold text-text-primary mb-1.5" for="password">Şifre</label>
          <input
            type="password"
            id="password"
            name="password"
            class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            [(ngModel)]="password"
            required
            minlength="4"
            placeholder="En az 4 karakter"
            autocomplete="new-password"
          />
        </div>

        <!-- Bio - opsiyonel -->
        <div>
          <label class="block text-sm font-bold text-text-primary mb-1.5" for="bio">Kısa Biyografi (opsiyonel)</label>
          <textarea
            id="bio"
            name="bio"
            class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm min-h-24 resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            [(ngModel)]="bio"
            placeholder="Yazar sayfasında görünecek kısa açıklama"
          ></textarea>
        </div>

        <!-- Rol -->
        <div>
          <label class="block text-sm font-bold text-text-primary mb-1.5" for="role">Kullanıcı Rolü</label>
          <select
            id="role"
            name="role"
            class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            [(ngModel)]="role"
            required
          >
            <option value="EDITOR">EDITOR (İçerik Yöneticisi)</option>
            <option value="ADMIN">ADMIN (Sistem Yöneticisi)</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-border">
          <a routerLink="/users" class="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-text-primary hover:bg-bg transition-colors">İptal</a>
          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
            [disabled]="isSubmitting || !userForm.valid"
          >
            {{ isSubmitting ? 'Oluşturuluyor...' : 'Kullanıcıyı Oluştur' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class UserFormComponent {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  username = '';
  fullName = '';
  password = '';
  bio = '';
  role: 'EDITOR' | 'ADMIN' = 'EDITOR';
  isSubmitting = false;

  onSubmit(): void {
    if (!this.username || !this.fullName || !this.password || !this.role) return;

    this.isSubmitting = true;
    this.userService
      .createUser({
        username: this.username.trim(),
        fullName: this.fullName.trim(),
        password: this.password,
        role: this.role,
        bio: this.bio.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.success(
            `"${this.fullName}" kullanıcısı (${this.role}) başarıyla oluşturuldu.`
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