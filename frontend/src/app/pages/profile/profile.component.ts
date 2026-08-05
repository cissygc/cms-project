import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { MediaPickerModalComponent } from '../../components/media-picker-modal/media-picker-modal.component';
import { MediaItem } from '../../models/media.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaPickerModalComponent],
  template: `
    <div class="w-full">
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-text-primary">Profilim</h1>
        <p class="text-text-muted text-sm mt-1">Ad, biyografi, profil fotoğrafı ve hesap bilgilerini düzenle</p>
      </div>

      <div *ngIf="isLoading" class="text-center py-16 text-text-muted">Yükleniyor...</div>

      <form *ngIf="!isLoading" (ngSubmit)="onSave()" #profileForm="ngForm" class="space-y-6">
        <!-- Avatar + Kişisel bilgiler -->
        <div class="bg-surface border border-border rounded-2xl p-6">
          <label class="block text-sm font-bold text-text-primary mb-4">Profil Fotoğrafı</label>
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-primary !text-white flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden">
              <img *ngIf="avatarUrl" [src]="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
              <span *ngIf="!avatarUrl">{{ (fullName || username).substring(0, 1).toUpperCase() }}</span>
            </div>
            <button
              type="button"
              (click)="isAvatarPickerOpen = true"
              class="px-4 py-2 rounded-xl border border-border text-sm font-bold text-text-primary hover:bg-bg transition-colors"
            >
              Değiştir
            </button>
            <button
              *ngIf="avatarUrl"
              type="button"
              (click)="clearAvatar()"
              class="px-4 py-2 rounded-xl border border-danger !text-danger text-sm font-bold hover:bg-danger hover:!text-white transition-colors"
            >
              Kaldır
            </button>
          </div>

          <label class="block text-sm font-bold text-text-primary mb-4">Kişisel Bilgiler</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-text-muted mb-1.5" for="fullName">Ad Soyad</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                [(ngModel)]="fullName"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-text-muted mb-1.5" for="slug">URL Adresi (yazar sayfası)</label>
              <input
                type="text"
                id="slug"
                name="slug"
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                [(ngModel)]="slug"
                placeholder="ör. ceren-gurcan"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-text-muted mb-1.5" for="bio">Biyografi</label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                [(ngModel)]="bio"
                placeholder="Yazar sayfasında görünecek kısa açıklama"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Hesap Bilgileri ve Şifre Değiştir yan yana -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <label class="block text-sm font-bold text-text-primary">Hesap Bilgileri</label>

            <div>
              <label class="block text-xs font-semibold text-text-muted mb-1.5" for="username">Kullanıcı Adı</label>
              <input
                type="text"
                id="username"
                name="username"
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                [(ngModel)]="username"
              />
              <p class="text-xs text-text-muted mt-1.5">
                Kullanıcı adını değiştirirsen mevcut oturumun geçersiz olur, yeniden giriş yapman gerekir.
              </p>
            </div>
          </div>

          <div class="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <label class="block text-sm font-bold text-text-primary">Şifre Değiştir</label>
            <p class="text-xs text-text-muted -mt-2">Şifreni değiştirmek istemiyorsan bu alanları boş bırakabilirsin.</p>

            <div>
              <label class="block text-xs font-semibold text-text-muted mb-1.5" for="currentPassword">Mevcut Şifre</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                [(ngModel)]="currentPassword"
                autocomplete="current-password"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-text-muted mb-1.5" for="newPassword">Yeni Şifre</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                [(ngModel)]="newPassword"
                autocomplete="new-password"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            [disabled]="isSaving"
            class="px-6 py-2.5 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {{ isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
          </button>
        </div>
      </form>
    </div>

    <app-media-picker-modal
      [isOpen]="isAvatarPickerOpen"
      [multiple]="false"
      (picked)="onAvatarPicked($event)"
      (closed)="isAvatarPickerOpen = false"
    ></app-media-picker-modal>
  `,
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isLoading = true;
  isSaving = false;
  isAvatarPickerOpen = false;

  fullName = '';
  bio = '';
  slug = '';
  username = '';
  avatarUrl = '';
  avatarMediaId: number | null = null;

  currentPassword = '';
  newPassword = '';

  ngOnInit(): void {
    this.userService.getMyProfile().subscribe({
      next: (user) => {
        this.fullName = user.fullName || '';
        this.bio = user.bio || '';
        this.slug = user.slug || '';
        this.username = user.username;
        this.avatarUrl = user.avatarUrl || '';
        this.authService.setAvatarUrl(this.avatarUrl);
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Profil yüklenemedi.');
        this.isLoading = false;
      },
    });
  }

  onAvatarPicked(items: MediaItem[]): void {
    const item = items[0];
    if (!item) return;
    this.avatarMediaId = Number(item.id);
    this.avatarUrl = item.url;
    this.isAvatarPickerOpen = false;
  }

  clearAvatar(): void {
    this.avatarUrl = '';
    this.avatarMediaId = null;
  }

  onSave(): void {
    if (this.newPassword && !this.currentPassword) {
      this.toastService.error('Şifre değiştirmek için mevcut şifreni girmen gerekiyor.');
      return;
    }

    this.isSaving = true;
    const usernameChanged = this.username !== this.authService.username();

    this.userService
      .updateMyProfile({
        fullName: this.fullName || undefined,
        bio: this.bio || undefined,
        slug: this.slug || undefined,
        username: this.username || undefined,
        avatarMediaId: this.avatarMediaId ?? undefined,
        newPassword: this.newPassword || undefined,
        currentPassword: this.currentPassword || undefined,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          const passwordChanged = !!this.newPassword;
          this.currentPassword = '';
          this.newPassword = '';
          if (usernameChanged || passwordChanged) {
            this.toastService.success('Profil güncellendi. Lütfen yeniden giriş yap.');
            this.authService.logout();
          } else {
            // Sidebar aynı anda güncel kalsın diye paylaşılan signal'i de yazıyoruz.
            this.authService.setAvatarUrl(this.avatarUrl);
            this.toastService.success('Profil güncellendi.');
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.message || 'Profil güncellenemedi.');
        },
      });
  }
}