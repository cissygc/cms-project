import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { DashboardService } from "../../services/dashboard.service";
import { AuthService } from "../../services/auth.service";
import { Post } from "../../models/post.model";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-wrapper">
      <div class="container">
        <!-- Hero Welcome Banner -->
        <div class="hero-card">
          <div class="hero-header">
            <div>
              <span class="hero-chip"
                >✨ REVLO AI İÇERİK YÖNETİM PLATFORMU</span
              >
              <h1 class="hero-title">
                Hoş Geldiniz,
                <span class="gradient-text">{{ authService.username() }}</span>
                👋
              </h1>
              <p class="hero-sub">
                Yeni içerikler ekleyin, yayınlanan tüm yazılarınızı ana sayfada
                anında sergileyin ve yönetin.
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
        <div class="feed-card">
          <div class="feed-header">
            <div>
              <span class="section-chip">YAYIN AKIŞI</span>
              <h2 class="section-title">Ana Sayfa Yayın Akışı</h2>
              <p class="section-desc">
                Sistemde yayınlanan güncel blog ve içerik yazıları
              </p>
            </div>
            <a routerLink="/posts" class="btn btn-secondary btn-sm"
              >Tümünü Yönet →</a
            >
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
            <p>
              Hemen ilk yazınızı oluşturarak ana sayfada görüntüleyebilirsiniz.
            </p>
            <a routerLink="/posts/new" class="btn btn-primary"
              >+ İlk Yazıyı Oluştur</a
            >
          </div>

          <!-- Main Page Posts Grid -->
          <div *ngIf="!isLoading && posts.length > 0" class="posts-grid">
            <div *ngFor="let post of posts" class="post-card">
              <div class="post-image-box">
                <img
                  *ngIf="post.image"
                  [src]="post.image"
                  [alt]="post.title"
                  class="post-img"
                />
                <div *ngIf="!post.image" class="post-img-fallback">
                  <span>REVLO AI</span>
                </div>
                <span class="category-chip">BLOG</span>
              </div>

              <div class="post-content">
                <div class="post-meta">
                  <span class="author-badge"
                    >✍️ {{ post.authorName || "Revlo Ekibi" }}</span
                  >
                  <span class="date-text"
                    >📅 {{ formatDate(post.createdAt) }}</span
                  >
                </div>

                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>

                <div class="post-footer">
                  <span class="slug-tag">/posts/{{ post.slug }}</span>
                  <a
                    [routerLink]="['/posts/edit', post.slug]"
                    class="btn btn-purple-sm"
                  >
                    ✏️ Düzenle
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Bembeyaz Arka Plan (Tüm Sayfayı Kapsar) */
      .container-wrapper {
        background-color: #ffffff;
        min-height: 100vh;
        padding-top: 20px;
        padding-bottom: 40px;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }

      /* Hero Banner - Beyaz Zemin, Mor Kenarlık ve Yazılar */
      .hero-card {
        padding: 38px 40px;
        margin-bottom: 32px;
        background: linear-gradient(135deg, #efe6ff 0%, #ffffff 50%, #efe6ff 100%);
        border: 2px solid #f4f0fa; /* Mor Kenarlık */
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(124, 58, 237, 0.08); /* Hafif mor gölge */
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
        color: #7c3aed; /* Mor Yazı */
        background: #f4f0fa; /* Açık Mor Zemin */
        padding: 4px 12px;
        border-radius: 20px;
        margin-bottom: 8px;
      }
      .hero-title {
        font-size: 34px;
        font-weight: 800;
        margin-bottom: 8px;
        color: #333333; /* Koyu Gri Ana Başlık */
      }
      .gradient-text {
        color: #7c3aed; /* İsim mor */
      }
      .hero-sub {
        font-size: 16px;
        color: #6b7280; /* Gri Alt Başlık */
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
        border-top: 1px solid #eae5f2; /* Açık mor çizgi */
      }
      .stat-pill {
        display: flex;
        align-items: center;
        gap: 14px;
        background: #ffffff;
        padding: 12px 22px;
        border-radius: 16px;
        border: 1px solid #eae5f2;
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
      .stat-icon-box.purple {
        background: #f4f0fa;
        border: 1px solid #d8c8f5;
      }
      .stat-icon-box.magenta {
        background: #fdf4ff;
        border: 1px solid #fac8ff;
      }
      .stat-icon-box.rose {
        background: #fff1f2;
        border: 1px solid #fecdd3;
      }

      .stat-num {
        font-family: "Outfit", sans-serif;
        font-size: 22px;
        font-weight: 800;
        color: #5a32a8; /* Mor Rakam */
        display: block;
        line-height: 1;
      }
      .stat-label {
        font-size: 12px;
        color: #6b7280;
        font-weight: 600;
      }

      /* Beyaz Kısım - Yayın Akışı */
      .feed-card {
        padding: 36px;
        background: linear-gradient(135deg, #efe6ff 0%, #ffffff 50%, #efe6ff 100%);
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        border: 1px solid #f4f0fa;
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
        color: #5a32a8;
        margin-bottom: 4px;
        display: block;
      }
      .section-title {
        font-size: 24px;
        font-weight: 800;
        color: #333333;
      }
      .section-desc {
        font-size: 14px;
        color: #6b7280;
      }

      .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 28px;
      }
      .post-card {
        background: #ffffff;
        border: 1px solid #eae5f2;
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      }
      .post-card:hover {
        transform: translateY(-4px);
        border-color: #7c3aed;
        box-shadow: 0 10px 25px rgba(124, 58, 237, 0.08);
      }
      .post-image-box {
        position: relative;
        height: 190px;
        background: #f8f6fb;
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
        background: #f4f0fa; /* Açık mor zemin */
        color: #7c3aed; /* Mor yazı */
        font-size: 22px;
        font-weight: 900;
        font-family: "Outfit", sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .category-chip {
        position: absolute;
        top: 12px;
        left: 12px;
        background: #f4f0fa;
        color: #5a32a8;
        font-size: 10px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid #eae5f2;
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
        color: #7c3aed;
      }
      .date-text {
        color: #6b7280;
      }
      .post-title {
        font-size: 19px;
        font-weight: 800;
        color: #333333;
        margin-bottom: 10px;
        line-height: 1.4;
      }
      .post-excerpt {
        font-size: 14px;
        color: #4b5563;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .post-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid #f8f6fb;
      }
      .slug-tag {
        font-family: "JetBrains Mono", monospace;
        font-size: 11px;
        color: #5a32a8;
        background-color: #f4f0fa;
        padding: 4px 8px;
        border-radius: 4px;
      }
      .btn-purple-sm {
        background: #7c3aed !important;
        color: #ffffff !important;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 700;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
        display: inline-flex;
        align-items: center;
        gap: 4px;
        text-decoration: none;
        transition: all 0.3s;
      }
      .btn-purple-sm:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #6b7280;
      }
      .empty-icon {
        font-size: 44px;
        margin-bottom: 12px;
      }
      .spinner {
        width: 38px;
        height: 38px;
        border: 3px solid #f4f0fa;
        border-top-color: #7c3aed;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 12px;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .btn-sm {
        padding: 6px 14px;
        font-size: 12px;
      }
      .btn-primary {
        background: #7c3aed;
        color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
      }
      .btn-secondary {
        background: #f4f0fa;
        color: #5a32a8;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        text-decoration: none;
        font-weight: bold;
        display: inline-block;
      }
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
    if (!content) return "İçerik özeti bulunmuyor.";
    const clean = content.replace(/#|\*|`|>|\[|\]|\(/g, "").trim();
    return clean.length > 100 ? clean.substring(0, 100) + "..." : clean;
  }

  formatDate(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}
