import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <!-- Hero Welcome Banner -->
      <div class="glass-card hero-card">
        <div class="hero-header">
          <div>
            <span class="hero-chip">✨ REVLO AI & DECAP CMS PLATFORMU</span>
            <h1 class="hero-title">
              Hoş Geldiniz, <span class="gradient-text">{{ authService.username() }}</span> 👋
            </h1>
            <p class="hero-sub">
              Yeni içerikler ekleyin, yayınlanan tüm yazılarınızı ana sayfada anında sergileyin ve yönetin.
            </p>
          </div>

          <a routerLink="/posts/new" class="btn btn-primary btn-lg">
            <span>+ Yeni Yazı Oluştur</span>
          </a>
        </div>

        <!-- Metrics Row -->
        <div class="stats-row">
          <div class="stat-pill">
            <div class="stat-icon-box purple">📝</div>
            <div>
              <span class="stat-num">{{ totalPosts }}</span>
              <span class="stat-label">Yayınlanan Yazı</span>
            </div>
          </div>

          <div class="stat-pill">
            <div class="stat-icon-box magenta">🖼️</div>
            <div>
              <span class="stat-num">{{ totalMedia }}</span>
              <span class="stat-label">Medya Dosyası</span>
            </div>
          </div>

          <div *ngIf="authService.isAdmin()" class="stat-pill">
            <div class="stat-icon-box rose">👥</div>
            <div>
              <span class="stat-num">{{ totalUsers }}</span>
              <span class="stat-label">Yetkili Kullanıcı</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Page Posts Feed -->
      <div class="glass-card feed-card">
        <div class="feed-header">
          <div>
            <span class="section-chip">POSTS FEED</span>
            <h2 class="section-title">Ana Sayfa Yayın Akışı</h2>
            <p class="section-desc">Sistemde yayınlanan güncel blog ve içerik yazıları</p>
          </div>
          <a routerLink="/posts" class="btn btn-secondary btn-sm">Tümünü Yönet →</a>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>Yazılar taranıyor...</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && posts.length === 0" class="empty-state">
          <div class="empty-icon">✍️</div>
          <h3>Henüz Hiç Yazı Yok</h3>
          <p>Hemen ilk yazınızı oluşturarak ana sayfada görüntüleyebilirsiniz.</p>
          <a routerLink="/posts/new" class="btn btn-primary">+ İlk Yazıyı Oluştur</a>
        </div>

        <!-- Main Page Posts Grid -->
        <div *ngIf="!isLoading && posts.length > 0" class="posts-grid">
          <div *ngFor="let post of posts" class="post-card">
            <div class="post-image-box">
              <img *ngIf="post.image" [src]="post.image" [alt]="post.title" class="post-img" />
              <div *ngIf="!post.image" class="post-img-fallback">
                <span>REVLO AI</span>
              </div>
              <span class="category-chip">BLOG</span>
            </div>

            <div class="post-content">
              <div class="post-meta">
                <span class="author-badge">✍️ {{ post.authorName || 'Revlo Ekibi' }}</span>
                <span class="date-text">📅 {{ formatDate(post.createdAt) }}</span>
              </div>

              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>

              <div class="post-footer">
                <span class="slug-tag">/posts/{{ post.slug }}</span>
                <a [routerLink]="['/posts/edit', post.slug]" class="btn btn-secondary btn-sm">
                  Düzenle
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .hero-card {
        padding: 38px 40px;
        margin-bottom: 32px;
        background: linear-gradient(135deg, rgba(48, 38, 78, 0.95), rgba(30, 22, 54, 0.95));
        border: 1px solid var(--border-glow);
      }
      .hero-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        margin-bottom: 32px;
      }
      .hero-chip {
        display: inline-block;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--revlo-magenta);
        background: rgba(235, 109, 247, 0.15);
        border: 1px solid rgba(235, 109, 247, 0.3);
        padding: 4px 12px;
        border-radius: var(--radius-pill);
        margin-bottom: 8px;
      }
      .hero-title {
        font-size: 34px;
        font-weight: 800;
        margin-bottom: 8px;
        color: #ffffff;
      }
      .hero-sub {
        font-size: 16px;
        color: var(--text-muted);
        max-width: 620px;
      }
      .btn-lg {
        padding: 14px 28px;
        font-size: 15px;
      }
      .stats-row {
        display: flex;
        gap: 20px;
        padding-top: 24px;
        border-top: 1px solid var(--border-subtle);
      }
      .stat-pill {
        display: flex;
        align-items: center;
        gap: 14px;
        background: rgba(255, 255, 255, 0.05);
        padding: 12px 22px;
        border-radius: 16px;
        border: 1px solid var(--border-subtle);
      }
      .stat-icon-box {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      .stat-icon-box.purple { background: rgba(126, 34, 206, 0.25); border: 1px solid rgba(126, 34, 206, 0.4); }
      .stat-icon-box.magenta { background: rgba(235, 109, 247, 0.25); border: 1px solid rgba(235, 109, 247, 0.4); }
      .stat-icon-box.rose { background: rgba(244, 63, 94, 0.25); border: 1px solid rgba(244, 63, 94, 0.4); }

      .stat-num {
        font-family: 'Outfit', sans-serif;
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        display: block;
        line-height: 1;
      }
      .stat-label {
        font-size: 12px;
        color: var(--text-muted);
        font-weight: 600;
      }

      .feed-card {
        padding: 36px;
      }
      .feed-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 32px;
      }
      .section-chip {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--revlo-magenta);
        margin-bottom: 4px;
        display: block;
      }
      .section-title {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
      }
      .section-desc {
        font-size: 14px;
        color: var(--text-muted);
      }

      .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 28px;
      }
      .post-card {
        background: rgba(32, 25, 52, 0.85);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-card);
        overflow: hidden;
        transition: var(--transition-smooth);
        display: flex;
        flex-direction: column;
      }
      .post-card:hover {
        transform: translateY(-4px);
        border-color: var(--border-glow);
        box-shadow: var(--shadow-revlo-hover);
      }
      .post-image-box {
        position: relative;
        height: 190px;
        background: #150f24;
        overflow: hidden;
      }
      .post-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .post-img-fallback {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--revlo-purple-deep), var(--revlo-purple-bright));
        color: #ffffff;
        font-size: 22px;
        font-weight: 900;
        font-family: 'Outfit', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .category-chip {
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(15, 10, 28, 0.9);
        color: var(--revlo-magenta);
        font-size: 10px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid rgba(235, 109, 247, 0.3);
      }
      .post-content {
        padding: 22px;
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: space-between;
      }
      .post-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .author-badge {
        font-weight: 700;
        color: var(--revlo-magenta);
      }
      .date-text {
        color: var(--text-sub);
      }
      .post-title {
        font-size: 19px;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 10px;
        line-height: 1.4;
      }
      .post-excerpt {
        font-size: 14px;
        color: var(--text-main);
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .post-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid var(--border-subtle);
      }
      .slug-tag {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: var(--revlo-purple-light);
      }

      .loading-state, .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-muted);
      }
      .empty-icon { font-size: 44px; margin-bottom: 12px; }
      .spinner {
        width: 38px;
        height: 38px;
        border: 3px solid var(--border-subtle);
        border-top-color: var(--revlo-magenta);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 12px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .btn-sm { padding: 6px 14px; font-size: 12px; }
    `,
  ],
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

  getExcerpt(content?: string): string {
    if (!content) return 'İçerik özeti bulunmuyor.';
    const clean = content.replace(/#|\*|`|>|\[|\]|\(/g, '').trim();
    return clean.length > 100 ? clean.substring(0, 100) + '...' : clean;
  }

  formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
