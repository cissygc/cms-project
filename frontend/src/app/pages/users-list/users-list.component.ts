import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';
import { BadgeComponent } from '../../components/badge/badge.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BadgeComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-text-primary">Kullanıcı Yönetimi</h1>
        <p class="text-text-muted text-sm mt-1">Sistemdeki editör ve yönetici hesaplarını yönet</p>
      </div>
      <!-- Artık ayrı bir sayfaya gitmiyor, sadece modalı açıyor -->
      <button (click)="openAddUserModal()"
              class="px-5 py-2.5 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors">
        + Yeni Kullanıcı Ekle
      </button>
    </div>

    <!-- Arama solda, "silinmişleri göster" toggle'ı sağda (justify-between ile) -->
    <div class="flex items-center justify-between mb-4">
      <input
        type="text"
        [(ngModel)]="searchTerm"
        placeholder="İsim veya kullanıcı adına göre ara..."
        class="flex-1 max-w-sm px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />

      <!-- TOGGLE SWİTCH (oval, sağa sola kayan) - checkbox'ı görünmez yapıp
           (sr-only), yerine kendi çizdiğimiz oval+yuvarlak şekli koyuyoruz.
           "peer" Tailwind'in bir tekniği: checkbox işaretlenince, ondan
           SONRA gelen kardeş elemente (peer-checked: ile) stil uygulamamızı sağlıyor. -->
      <label class="flex items-center gap-3 cursor-pointer select-none">
        <span class="text-sm text-text-muted whitespace-nowrap">Silinmiş kullanıcıları da göster</span>
        <span class="relative inline-flex items-center">
          <input type="checkbox" [(ngModel)]="showDeleted" (change)="loadUsers()" class="sr-only peer" />
          <span class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors"></span>
          <span class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></span>
        </span>
      </label>
    </div>

    <div class="bg-surface border border-border rounded-2xl overflow-hidden">
      <div *ngIf="isLoading" class="text-center py-16 text-text-muted">Yükleniyor...</div>

      <div *ngIf="!isLoading && filteredUsers.length === 0" class="text-center py-16 text-text-muted">
        {{ searchTerm ? 'Aramanla eşleşen kullanıcı yok.' : 'Henüz kayıtlı kullanıcı yok.' }}
      </div>

      <table *ngIf="!isLoading && filteredUsers.length > 0" class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-border text-left text-text-muted">
            <th class="px-5 py-3 font-semibold">Kullanıcı</th>
            <th class="px-5 py-3 font-semibold">Rol</th>
            <th class="px-5 py-3 font-semibold">Yazı Sayısı</th>
            <th class="px-5 py-3 font-semibold text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of filteredUsers" class="border-b border-border last:border-0 hover:bg-bg transition-colors">
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-primary !text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {{ (user.fullName || user.username || 'U').substring(0, 1).toUpperCase() }}
                </div>
                <div>
                  <div class="font-bold text-text-primary flex items-center gap-2">
                    {{ user.fullName || user.username }}
                    <span *ngIf="isSelf(user)" class="text-xs font-normal text-primary">(Sen)</span>
                  </div>
                  <div class="text-xs text-text-muted">&#64;{{ user.username }}</div>
                </div>
              </div>
            </td>
            <td class="px-5 py-3">
              <app-badge [text]="user.role" [tone]="user.role === 'ADMIN' ? 'danger' : 'neutral'"></app-badge>
            </td>
            <td class="px-5 py-3 text-text-muted">{{ user.postCount ?? 0 }} yazı</td>
            <td class="px-5 py-3 text-right">
              <app-badge *ngIf="user.deleted" text="Silinmiş" tone="warning"></app-badge>
              <button
                *ngIf="!user.deleted"
                class="px-3 py-1.5 rounded-lg border border-danger !text-danger text-xs font-bold hover:bg-danger hover:!text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
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

    <!-- YENİ KULLANICI EKLE MODALI -->
    <div *ngIf="showAddUserModal"
         class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
         (click)="closeAddUserModal()">
      <div class="bg-surface rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold text-text-primary mb-5">Yeni Kullanıcı Ekle</h3>

        <form (ngSubmit)="onCreateUser()" #userForm="ngForm" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-text-primary mb-1.5" for="newUsername">Kullanıcı Adı</label>
            <input
              type="text" id="newUsername" name="username"
              class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              [(ngModel)]="username" required minlength="3"
              placeholder="ör. ali_yilmaz"
              autocomplete="off"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-text-primary mb-1.5" for="newFullName">Ad Soyad</label>
            <input
              type="text" id="newFullName" name="fullName"
              class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              [(ngModel)]="fullName" required minlength="2"
              placeholder="ör. Ali Yılmaz"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-text-primary mb-1.5" for="newPassword">Şifre</label>
            <input
              type="password" id="newPassword" name="password"
              class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              [(ngModel)]="password" required minlength="4"
              placeholder="En az 6 karakter"
              autocomplete="new-password"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-text-primary mb-1.5" for="newBio">Kısa Biyografi <span class="font-normal text-text-muted">(opsiyonel)</span></label>
            <textarea
              id="newBio" name="bio"
              class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm min-h-20 resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              [(ngModel)]="bio"
              placeholder="Yazar sayfasında görünecek kısa açıklama"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-bold text-text-primary mb-1.5" for="newRole">Kullanıcı Rolü</label>
            <select
              id="newRole" name="role"
              class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              [(ngModel)]="role" required
            >
              <option value="EDITOR">Editör (içerik oluşturur/düzenler)</option>
              <option value="ADMIN">Yönetici (tüm sisteme erişir)</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="closeAddUserModal()"
                    class="px-4 py-2 rounded-xl border border-border text-sm font-bold text-text-primary hover:bg-bg transition-colors">
              Vazgeç
            </button>
            <button type="submit"
                    [disabled]="isSubmitting || !userForm.valid"
                    class="px-4 py-2 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50">
              {{ isSubmitting ? 'Oluşturuluyor...' : 'Kullanıcıyı Oluştur' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- SİLME ONAY MODALI -->
    <div *ngIf="userPendingDelete"
         class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
         (click)="cancelDelete()">
      <div class="bg-surface rounded-2xl p-6 max-w-md w-full" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold text-text-primary mb-2">Hesabı Sil</h3>
        <p class="text-sm text-text-muted mb-4">
          <strong class="text-text-primary">{{ userPendingDelete.fullName || userPendingDelete.username }}</strong>
          kullanıcısını silmek üzeresin.
        </p>

        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p class="text-sm text-amber-800">
            Bu hesabı silseniz de yazdığı postlar kalacaktır. Postların silinmesi için lütfen hepsini manuel olarak silin.
          </p>
        </div>

        <label class="flex items-start gap-2.5 mb-6 cursor-pointer">
          <input type="checkbox" [(ngModel)]="deleteConfirmChecked" [ngModelOptions]="{standalone: true}"
                 class="mt-0.5 rounded border-border accent-danger" />
          <span class="text-sm text-text-primary">
            Yukarıdaki uyarıyı okudum, bu hesabı silmek istediğimi onaylıyorum.
          </span>
        </label>

        <div class="flex justify-end gap-3">
          <button (click)="cancelDelete()"
                  class="px-4 py-2 rounded-xl border border-border text-sm font-bold text-text-primary hover:bg-bg transition-colors">
            Vazgeç
          </button>
          <button (click)="confirmDelete()"
                  [disabled]="!deleteConfirmChecked || deletingId === userPendingDelete.id"
                  class="px-4 py-2 rounded-xl bg-danger !text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none">
            {{ deletingId === userPendingDelete.id ? 'Siliniyor...' : 'Hesabı Sil' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  users: User[] = [];
  isLoading = true;
  deletingId: number | string | null = null;
  showDeleted = false;
  searchTerm = '';

  // Silme modalı
  userPendingDelete: User | null = null;
  deleteConfirmChecked = false;

  // Yeni kullanıcı ekleme modalı
  showAddUserModal = false;
  username = '';
  fullName = '';
  password = '';
  bio = '';
  role: 'EDITOR' | 'ADMIN' = 'EDITOR';
  isSubmitting = false;

  get filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(
      (u) =>
        u.username.toLowerCase().includes(term) ||
        (u.fullName || '').toLowerCase().includes(term)
    );
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers(this.showDeleted).subscribe({
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

  // ---- Yeni kullanıcı ekleme modalı ----
  openAddUserModal(): void {
    this.username = '';
    this.fullName = '';
    this.password = '';
    this.bio = '';
    this.role = 'EDITOR';
    this.showAddUserModal = true;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
  }

  onCreateUser(): void {
    if (!this.username || !this.fullName || !this.password) return;

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
          this.toastService.success(`"${this.fullName}" kullanıcısı (${this.role}) başarıyla oluşturuldu.`);
          this.showAddUserModal = false;
          this.loadUsers();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error(err.message || 'Kullanıcı oluşturulamadı.');
        },
      });
  }

  // ---- Silme modalı ----
  onDelete(user: User): void {
    this.userPendingDelete = user;
    this.deleteConfirmChecked = false;
  }

  cancelDelete(): void {
    this.userPendingDelete = null;
    this.deleteConfirmChecked = false;
  }

  confirmDelete(): void {
    const user = this.userPendingDelete;
    if (!user || !this.deleteConfirmChecked) return;

    this.deletingId = user.id;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.toastService.success(`"${user.fullName || user.username}" kullanıcısı silindi.`);
        this.userPendingDelete = null;
        this.deleteConfirmChecked = false;
        this.loadUsers();
        this.deletingId = null;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Kullanıcı silinemedi.');
        this.deletingId = null;
      },
    });
  }
}