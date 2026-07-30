import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../services/toast.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <span class="collection-badge">📁 YAZI KOLEKSİYONU</span>
          <h1 class="page-title">Yazı Koleksiyonu</h1>
          <p class="section-sub">Sistemdeki tüm blog ve içerik kayıtlarını yönetin</p>
        </div>
        <a routerLink="/posts/new" class="btn btn-primary">+ Yeni Yazı Ekle</a>
      </div>

      <!-- Search & View Mode Bar -->
      <div class="glass-card filter-card">
        <div class="filter-row">
          <!-- Search Bar -->
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="form-input search-input"
              placeholder="Başlık veya URL adresi ile ara..."
              [(ngModel)]="searchQuery"
            />
          </div>

          <!-- View Mode Toggle -->
          <div class="view-mode-toggle">
            <button
              type="button"
              class="mode-btn"
              [class.active]="viewMode === 'grid'"
              (click)="viewMode = 'grid'"
              title="Kart Görünümü"
            >
              🎴 Kart
            </button>
            <button
              type="button"
              class="mode-btn"
              [class.active]="viewMode === 'table'"
              (click)="viewMode = 'table'"
              title="Tablo Görünümü"
            >
              📊 Tablo
            </button>
          </div>
        </div>
      </div>

      <!-- Main Collection Container -->
      <div class="glass-card main-card">
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>Kayıtlar taranıyor...</span>
        </div>

        <div *ngIf="!isLoading && filteredPosts.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>Aranan Kriterde Kayıt Bulunamadı</h3>
          <p>Arama kelimesini değiştirmeyi veya yeni bir kayıt eklemeyi deneyin.</p>
        </div>

        <!-- Grid View -->
        <div *ngIf="!isLoading && filteredPosts.length > 0 && viewMode === 'grid'" class="posts-grid">
          <div *ngFor="let post of filteredPosts" class="post-card">
            <div class="post-thumb">
              <img *ngIf="post.image" [src]="post.image" [alt]="post.title" />
              <div *ngIf="!post.image" class="thumb-fallback">
                <span>REVLO AI</span>
              </div>
              <span class="file-path-badge">/posts/{{ post.slug }}</span>
            </div>

            <div class="post-body">
              <div class="post-meta">
                <span>✍️ {{ post.authorName || 'Revlo Ekibi' }}</span>
                <span>•</span>
                <span>📅 {{ formatDate(post.createdAt) }}</span>
              </div>

              <h3 class="post-title">{{ post.title }}</h3>

              <div class="post-actions">
                <a [routerLink]="['/posts/edit', post.slug]" class="btn btn-purple-sm">
                  ✏️ Düzenle
                </a>
                <button
                  class="btn btn-danger btn-sm"
                  (click)="onDelete(post)"
                  [disabled]="deletingSlug === post.slug"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <table *ngIf="!isLoading && filteredPosts.length > 0 && viewMode === 'table'" class="data-table">
          <thead>
            <tr>
              <th>URL Adresi</th>
              <th>Başlık</th>
              <th>Yazar</th>
              <th>Tarih</th>
              <th style="text-align: right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let post of filteredPosts">
              <td>
                <div class="file-code-cell">
                  <span>📄 /posts/{{ post.slug }}</span>
                </div>
              </td>
              <td>
                <span class="table-post-title">{{ post.title }}</span>
              </td>
              <td>
                <span class="author-tag">{{ post.authorName || 'Revlo Ekibi' }}</span>
              </td>
              <td>
                <span class="date-tag">{{ formatDate(post.createdAt) }}</span>
              </td>
              <td style="text-align: right">
                <div class="table-actions">
                  <a [routerLink]="['/posts/edit', post.slug]" class="btn btn-purple-sm">
                    ✏️ Düzenle
                  </a>
                  <button
                    class="btn btn-danger btn-sm"
                    (click)="onDelete(post)"
                    [disabled]="deletingSlug === post.slug"
                  >
                    Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .collection-badge {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--revlo-purple-main);
        background: #f0ebf8;
        border: 1px solid rgba(124, 58, 237, 0.2);
        padding: 4px 12px;
        border-radius: var(--radius-pill);
        margin-bottom: 8px;
        display: inline-block;
      }
      .page-title {
        color: #111827 !important;
        font-weight: 800;
      }
      .section-sub {
        color: #4b5563 !important;
        font-size: 14px;
        font-weight: 500;
        margin-top: 4px;
      }
      .filter-card {
        padding: 16px 24px;
        margin-bottom: 24px;
        background: #ffffff;
      }
      .filter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .search-box {
        position: relative;
        flex: 1;
        max-width: 440px;
      }
      .search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
      }
      .search-input {
        padding-left: 40px;
        color: #111827 !important;
        background: #f8f6fc !important;
        font-weight: 600 !important;
        border: 1px solid #e8e3f2;
      }
      .search-input:focus {
        background: #ffffff !important;
        border-color: #7c3aed;
      }
      .search-input::placeholder {
        color: #9ca3af !important;
        font-weight: 400;
      }
      .view-mode-toggle {
        display: flex;
        gap: 4px;
        background: #f0ebf8;
        padding: 4px;
        border-radius: 12px;
        border: 1px solid rgba(124, 58, 237, 0.15);
      }
      .mode-btn {
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 700;
        color: #4b5563 !important;
        border-radius: 8px;
        background: transparent;
      }
      .mode-btn.active {
        color: #ffffff !important;
        background: var(--revlo-purple-main);
      }
      .main-card {
        padding: 24px;
        background: #ffffff;
      }
      .loading-state, .empty-state {
        padding: 60px;
        text-align: center;
        color: #6b7280 !important;
      }
      .empty-icon { font-size: 40px; margin-bottom: 12px; }
      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #e8e3f2;
        border-top-color: var(--revlo-purple-main);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 12px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
      }
      .post-card {
        background: #ffffff;
        border: 1px solid #e8e3f2;
        border-radius: var(--radius-card);
        overflow: hidden;
        transition: var(--transition-smooth);
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      }
      .post-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(124, 58, 237, 0.1);
        border-color: rgba(124, 58, 237, 0.3);
      }
      .post-thumb {
        position: relative;
        height: 160px;
        background: #f1f5f9;
        overflow: hidden;
      }
      .post-thumb img { width: 100%; height: 100%; object-fit: cover; }
      .thumb-fallback {
        width: 100%; height: 100%;
        background: linear-gradient(135deg, #2a1b4e, #7c3aed);
        display: flex; align-items: center; justify-content: center;
        color: #ffffff; font-weight: 800; font-family: 'Outfit', sans-serif;
      }
      .file-path-badge {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(17, 24, 39, 0.85);
        color: #ffffff;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        padding: 3px 8px;
        border-radius: 6px;
      }
      .post-body {
        padding: 18px;
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: space-between;
      }
      .post-meta {
        font-size: 12px;
        color: #6b7280 !important;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
      }
      .post-title {
        font-size: 17px;
        font-weight: 800;
        color: #111827 !important;
        margin-bottom: 16px;
        line-height: 1.4;
      }
      .post-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid #f1f5f9;
      }
      .btn-purple-sm {
        background: linear-gradient(135deg, var(--revlo-purple-main), var(--revlo-purple-light)) !important;
        color: #ffffff !important;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 700;
        border-radius: var(--radius-pill);
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .btn-purple-sm:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
      }
      .file-code-cell {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        color: var(--revlo-purple-main);
        font-weight: 700;
      }
      .data-table th {
        color: #111827 !important;
        font-weight: 800;
        background: #f8f6fc;
      }
      .table-post-title { font-weight: 800; color: #111827 !important; }
      .author-tag { font-size: 13px; color: #4b5563 !important; font-weight: 600; }
      .date-tag { font-size: 12px; color: #6b7280 !important; font-weight: 600; }
      .table-actions { display: flex; justify-content: flex-end; gap: 8px; }
      .btn-sm { padding: 6px 12px; font-size: 12px; }
    `,
  ],
})
export class PostsListComponent implements OnInit {
  private postService = inject(PostService);
  private toastService = inject(ToastService);

  posts: Post[] = [];
  isLoading = true;
  searchQuery = '';
  viewMode: 'grid' | 'table' = 'grid';
  deletingSlug: string | null = null;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.postService.getPosts().subscribe({
      next: (list) => {
        this.posts = list;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Yazılar yüklenemedi.');
        this.isLoading = false;
      },
    });
  }

  get filteredPosts(): Post[] {
    return this.posts.filter((p) => {
      const q = this.searchQuery.toLowerCase().trim();
      return !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    });
  }

  onDelete(post: Post): void {
    if (!confirm(`"${post.title}" yazısını silmek istediğinize emin misiniz?`)) return;

    this.deletingSlug = post.slug;
    this.postService.deletePost(post.slug).subscribe({
      next: () => {
        this.toastService.success(`"${post.title}" silindi.`);
        this.posts = this.posts.filter((p) => p.slug !== post.slug);
        this.deletingSlug = null;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Silme başarısız.');
        this.deletingSlug = null;
      },
    });
  }

  formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}