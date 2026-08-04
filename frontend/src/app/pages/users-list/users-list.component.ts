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
      <a routerLink="/users/new" class="px-5 py-2.5 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors">
        + Yeni Kullanıcı Ekle
      </a>
    </div>

    <!-- Arama kutusu + "Silinmişleri göster" checkbox'ı aynı satırda -->
    <div class="flex items-center gap-4 mb-4">
      <input
        type="text"
        [(ngModel)]="searchTerm"
        placeholder="İsim veya kullanıcı adına göre ara..."
        class="flex-1 max-w-sm px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
      <label class="flex items-center gap-2 text-sm text-text-muted cursor-pointer whitespace-nowrap">
        <input type="checkbox" [(ngModel)]="showDeleted" (change)="loadUsers()" class="rounded border-border accent-primary" />
        Silinmiş kullanıcıları da göster
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
              <!-- Silinmiş kullanıcı için rozet gösteriyoruz, silme butonu göstermiyoruz (zaten silinmiş) -->
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

  // "getter" ne demek? Bunu normal bir değişken değil, HER OKUNDUĞUNDA
  // yeniden hesaplanan bir değer gibi düşün. searchTerm her değiştiğinde
  // Angular şablonu tekrar çizerken bunu otomatik tekrar çalıştırır -
  // ayrı bir "filtrele" fonksiyonu çağırmamıza gerek kalmıyor.
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

  onDelete(user: User): void {
    if (!user.id) return;
    if (!confirm(`"${user.fullName || user.username}" kullanıcısını silmek istediğinize emin misiniz?`)) return;

    this.deletingId = user.id;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.toastService.success(`"${user.fullName || user.username}" kullanıcısı silindi.`);
        // Backend soft-delete yaptığı için kullanıcı listeden hemen kaybolmaz,
        // "Silinmiş" rozetiyle görünür - listeyi yeniden çekiyoruz.
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