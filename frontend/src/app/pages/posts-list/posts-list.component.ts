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
          <div class="collection-badge">📁 DECAP COLLECTION: POSTS</div>
          <h1 class="page-title">Yazı Koleksiyonu</h1>
          <p class="section-sub">Koleksiyondaki tüm kayıtları yönetin, filtreleyin ve düzenleyin</p>
        </div>
        <a routerLink="/posts/new" class="btn btn-primary">+ Yeni Kayıt Ekle</a>
      </div>

      <!-- Filters & Workflow Bar -->
      <div class="glass-card filter-card">
        <div class="filter-row">
          <!-- Search Bar -->
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="form-input search-input"
              placeholder="Başlık veya slug ile ara..."
              [(ngModel)]="searchQuery"
            />
          </div>

          <!-- Workflow Filter Tabs -->
          <div class="workflow-filter-tabs">
            <button
              type="button"
              class="wf-tab-btn"
              [class.active]="selectedStatusFilter === 'all'"
              (click)="selectedStatusFilter = 'all'"
            >
              Tüm Kayıtlar ({{ posts.length }})
            </button>
            <button
              type="button"
              class="wf-tab-btn"
              [class.active]="selectedStatusFilter === 'published'"
              (click)="selectedStatusFilter = 'published'"
            >
              ✅ Yayınlananlar
            </button>
            <button
              type="button"
              class="wf-tab-btn"
              [class.active]="selectedStatusFilter === 'draft'"
              (click)="selectedStatusFilter = 'draft'"
            >
              📝 Taslaklar
            </button>
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
          <span>Decap koleksiyon kayıtları taranıyor...</span>
        </div>

        <div *ngIf="!isLoading && filteredPosts.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>Aranan Kriterde Kayıt Bulunamadı</h3>
          <p>Filtreyi temizlemeyi veya yeni bir kayıt eklemeyi deneyin.</p>
        </div>

        <!-- Grid View -->
        <div *ngIf="!isLoading && filteredPosts.length > 0 && viewMode === 'grid'" class="posts-grid">
          <div *ngFor="let post of filteredPosts" class="post-card">
            <div class="post-thumb">
              <img *ngIf="post.image" [src]="post.image" [alt]="post.title" />
              <div *ngIf="!post.image" class="thumb-fallback">
                <span>Decap Entry</span>
              </div>
              <span class="file-path-badge">posts/{{ post.slug }}.json</span>
            </div>

            <div class="post-body">
              <div class="post-meta font-sans">
                <span>✍️ {{ post.authorName || 'Decap Editor' }}</span>
                <span>•</span>
                <span>📅 {{ formatDate(post.createdAt) }}</span>
              </div>

              <h3 class="post-title">{{ post.title }}</h3>

              <div class="post-actions">
                <a [routerLink]="['/posts/edit', post.slug]" class="btn btn-secondary btn-sm">
                  Düzenle
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
              <th>Dosya Kaydı</th>
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
                  <span>📄 posts/{{ post.slug }}.json</span>
                </div>
              </td>
              <td>
                <span class="table-post-title">{{ post.title }}</span>
              </td>
              <td>
                <span class="author-tag">{{ post.authorName || 'Decap Editor' }}</span>
              </td>
              <td>
                <span class="date-tag">{{ formatDate(post.createdAt) }}</span>
              </td>
              <td style="text-align: right">
                <div class="table-actions">
                  <a [routerLink]="['/posts/edit', post.slug]" class="btn btn-secondary btn-sm">
                    Düzenle
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
        margin-bottom: 6px;
      }
      .section-sub {
        color: var(--revlo-text-muted);
        font-size: 14px;
        margin-top: 4px;
      }
      .filter-card {
        padding: 16px 24px;
        margin-bottom: 24px;
      }
      .filter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .search-box {
        position: relative;
        flex: 1;
        min-width: 260px;
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
      }
      .workflow-filter-tabs {
        display: flex;
        gap: 4px;
        background: var(--revlo-input-bg);
        padding: 3px;
        border-radius: 10px;
        border: 1px solid var(--revlo-card-border);
      }
      .wf-tab-btn {
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 700;
        color: var(--revlo-text-muted);
        border-radius: 8px;
        background: transparent;
      }
      .wf-tab-btn.active {
        color: #ffffff;
        background: var(--revlo-purple-main);
      }
      .view-mode-toggle {
        display: flex;
        gap: 4px;
        background: var(--revlo-input-bg);
        padding: 3px;
        border-radius: 10px;
        border: 1px solid var(--revlo-card-border);
      }
      .mode-btn {
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 700;
        color: var(--revlo-text-muted);
        border-radius: 8px;
        background: transparent;
      }
      .mode-btn.active {
        color: #ffffff;
        background: var(--revlo-purple-main);
      }
      .main-card {
        padding: 24px;
      }
      .loading-state, .empty-state {
        padding: 60px;
        text-align: center;
        color: var(--revlo-text-muted);
      }
      .empty-icon { font-size: 40px; margin-bottom: 12px; }
      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid var(--revlo-card-border);
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
        border: 1px solid var(--revlo-card-border);
        border-radius: var(--radius-card);
        overflow: hidden;
        transition: var(--transition-revlo);
        display: flex;
        flex-direction: column;
      }
      .post-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-revlo-hover);
        border-color: rgba(106, 27, 154, 0.3);
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
        background: linear-gradient(135deg, var(--revlo-purple-dark), var(--revlo-purple-main));
        display: flex; align-items: center; justify-content: center;
        color: #ffffff; font-weight: 800; font-family: 'Outfit', sans-serif;
      }
      .file-path-badge {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(15, 23, 42, 0.8);
        color: #ffffff;
        font-family: 'Fira Code', monospace;
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
        color: var(--revlo-text-muted);
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
      }
      .post-title {
        font-size: 16px;
        font-weight: 800;
        color: var(--revlo-text-title);
        margin-bottom: 16px;
      }
      .post-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--revlo-card-border);
      }
      .file-code-cell {
        font-family: 'Fira Code', monospace;
        font-size: 12px;
        color: var(--revlo-purple-main);
        font-weight: 600;
      }
      .table-post-title { font-weight: 700; color: var(--revlo-text-title); }
      .author-tag { font-size: 13px; color: var(--revlo-text-body); }
      .date-tag { font-size: 12px; color: var(--revlo-text-muted); }
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
  selectedStatusFilter = 'all';
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
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      const matchesStatus =
        this.selectedStatusFilter === 'all' ||
        (this.selectedStatusFilter === 'published' && (p.status === 'published' || !p.status)) ||
        p.status === this.selectedStatusFilter;
      return matchesSearch && matchesStatus;
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
