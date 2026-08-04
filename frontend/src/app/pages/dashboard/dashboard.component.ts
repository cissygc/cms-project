import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { BadgeComponent, BadgeTone } from '../../components/badge/badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, BadgeComponent],
  template: `
    <!-- Üst başlık satırı: solda "Hoş geldin", sağda "Yeni Yazı" butonu -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-text-primary">
          Hoş geldin, {{ authService.username() }}!
        </h1>
        <p class="text-text-muted mt-1">
          Yazılarını ve medyalarını buradan yönetebilirsin.
        </p>
      </div>
      <a routerLink="/posts/new"
         class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors shrink-0">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Yeni Yazı
      </a>
    </div>

    <!-- Sayı kartları - StatCardComponent'i 2 (admin ise 3) kere kullanıyoruz -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      <app-stat-card [value]="totalPosts" label="Toplam Yazı">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </app-stat-card>

      <app-stat-card [value]="totalMedia" label="Medya Dosyası">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 12V4.5A2.25 2.25 0 015.25 2.25h15A2.25 2.25 0 0122.5 4.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15.75z" />
        </svg>
      </app-stat-card>

      <app-stat-card *ngIf="authService.isAdmin()" [value]="totalUsers" label="Yetkili Kullanıcı">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      </app-stat-card>
    </div>

    <!-- Son yazılar bölümü -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-text-primary">Son Yazılar</h2>
      <a routerLink="/posts" class="text-sm font-semibold text-primary hover:underline">Tümünü gör →</a>
    </div>

    <!-- Yükleniyor durumu -->
    <div *ngIf="isLoading" class="text-center py-16 text-text-muted">
      Yazılar yükleniyor...
    </div>

    <!-- Hiç yazı yoksa gösterilen durum -->
    <div *ngIf="!isLoading && posts.length === 0"
         class="text-center py-16 bg-surface border border-border rounded-2xl">
      <p class="text-lg font-bold text-text-primary mb-1">Henüz hiç yazı yok</p>
      <p class="text-text-muted mb-4">İlk yazını oluşturarak başlayabilirsin.</p>
      <a routerLink="/posts/new" class="inline-block px-5 py-2.5 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors">
        + İlk Yazıyı Oluştur
      </a>
    </div>

    <!-- Yazı kartları listesi -->
    <div *ngIf="!isLoading && posts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div *ngFor="let post of posts"
           class="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <div class="h-36 bg-bg">
          <img *ngIf="post.image" [src]="post.image" [alt]="post.title" class="w-full h-full object-cover" />
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <app-badge [text]="statusText(post.status)" [tone]="statusTone(post.status)"></app-badge>
            <span class="text-xs text-text-muted">{{ formatDate(post.createdAt) }}</span>
          </div>
          <h3 class="font-bold text-text-primary mb-1 line-clamp-2">{{ post.title }}</h3>
          <p class="text-sm text-text-muted mb-3">{{ post.authorFullName || post.authorName }}</p>
          <a [routerLink]="['/posts/edit', post.slug]"
             class="text-sm font-semibold text-primary hover:underline">
            Düzenle →
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  authService = inject(AuthService);

  posts: Post[] = [];
  totalPosts = 0;
  totalMedia = 0;
  totalUsers = 0;
  isLoading = true;

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.posts = data.recentPosts || [];
        this.totalPosts = data.totalPosts || 0;
        this.totalMedia = data.totalMedia || 0;
        this.totalUsers = data.totalUsers || 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  // Backend "DRAFT"/"PUBLISHED" diye gönderiyor, biz burada Türkçe okunabilir hale çeviriyoruz
  statusText(status: string): string {
    return status === 'PUBLISHED' ? 'Yayında' : 'Taslak';
  }

  // BadgeComponent'e hangi renk grubunu (tone) kullanacağını söylüyoruz
  statusTone(status: string): BadgeTone {
    return status === 'PUBLISHED' ? 'success' : 'warning';
  }

  formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}