import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { CollectionService } from '../../services/collection.service';
import { TagService } from '../../services/tag.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { BadgeComponent, BadgeTone } from '../../components/badge/badge.component';
import { Post, PostStatus, Language, CollectionSummary, TagSummary } from '../../models/post.model';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BadgeComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-text-primary">Yazılar</h1>
        <p class="text-text-muted text-sm mt-1">Sistemdeki tüm blog yazılarını yönet</p>
      </div>
      <a
        routerLink="/posts/new"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors shrink-0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Yeni Yazı
      </a>
    </div>

    <!-- Filtre paneli -->
    <div class="bg-surface border border-border rounded-2xl p-5 mb-6">
      <input
        type="text"
        [(ngModel)]="searchQuery"
        placeholder="Başlık, URL adresi veya etiket ile ara..."
        class="w-full mb-4 px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          [(ngModel)]="statusFilter"
          class="px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="PUBLISHED">Yayında</option>
          <option value="DRAFT">Taslak</option>
          <option value="SCHEDULED">Zamanlanmış</option>
        </select>

        <select
          [(ngModel)]="languageFilter"
          class="px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">Tüm Diller</option>
          <option value="TR">Türkçe</option>
          <option value="EN">İngilizce</option>
          <option value="DE">Almanca</option>
          <option value="RU">Rusça</option>
        </select>

        <select
          [(ngModel)]="collectionFilter"
          class="px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">Tüm Koleksiyonlar</option>
          <option *ngFor="let c of collections" [value]="c.name">{{ c.name }}</option>
        </select>

        <select
          [(ngModel)]="tagFilter"
          class="px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">Tüm Etiketler</option>
          <option *ngFor="let t of tags" [value]="t.name">{{ t.name }}</option>
        </select>
      </div>

      <!-- Yazar filtresi sadece admin'e gösteriliyor - editörler zaten sadece
           kendi yazılarını görüyor (backend zaten bu şekilde filtreliyor),
           bu yüzden onlar için anlamsız bir seçim olurdu. -->
      <div *ngIf="authService.isAdmin() && authorOptions.length > 1" class="mt-3">
        <select
          [(ngModel)]="authorFilter"
          class="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">Tüm Yazarlar</option>
          <option *ngFor="let a of authorOptions" [value]="a">{{ a }}</option>
        </select>
      </div>

      <div class="flex justify-end mt-4">
        <div class="inline-flex gap-1 bg-bg p-1 rounded-xl border border-border">
          <button
            type="button"
            (click)="viewMode = 'grid'"
            [class.bg-primary]="viewMode === 'grid'"
            [class.text-white]="viewMode === 'grid'"
            class="px-4 py-1.5 rounded-lg text-xs font-bold text-text-muted transition-colors"
          >
            Kart
          </button>
          <button
            type="button"
            (click)="viewMode = 'table'"
            [class.bg-primary]="viewMode === 'table'"
            [class.text-white]="viewMode === 'table'"
            class="px-4 py-1.5 rounded-lg text-xs font-bold text-text-muted transition-colors"
          >
            Tablo
          </button>
        </div>
      </div>
    </div>

    <!-- İçerik -->
    <div *ngIf="isLoading" class="text-center py-16 text-text-muted">Yükleniyor...</div>

    <div *ngIf="!isLoading && filteredPosts.length === 0" class="text-center py-16 bg-surface border border-border rounded-2xl text-text-muted">
      Aranan kriterde kayıt bulunamadı.
    </div>

    <!-- Kart görünümü -->
    <div *ngIf="!isLoading && filteredPosts.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        *ngFor="let post of filteredPosts"
        class="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
      >
        <div class="h-36 bg-bg">
          <img *ngIf="post.image" [src]="post.image" [alt]="post.title" class="w-full h-full object-cover" />
        </div>

        <div class="p-4 flex flex-col flex-1">
          <div class="flex items-center justify-between mb-2">
            <app-badge [text]="statusLabel(post)" [tone]="statusTone(post)"></app-badge>
            <span class="text-xs text-text-muted">{{ formatDate(post.createdAt) }}</span>
          </div>

          <h3 class="font-bold text-text-primary mb-1 line-clamp-2">{{ post.title }}</h3>
          <p class="text-sm text-text-muted mb-3">{{ post.authorFullName || post.authorName }} &middot; {{ languageLabel(post.language) }}</p>

          <div class="flex flex-wrap gap-1.5 mb-3" *ngIf="post.tags?.length || post.collections?.length">
            <span
              *ngFor="let c of post.collections"
              class="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full"
            >
              {{ c.name }}
            </span>
            <span
              *ngFor="let t of post.tags"
              class="text-xs font-semibold text-text-muted bg-bg px-2 py-0.5 rounded-full"
            >
              {{ t.name }}
            </span>
          </div>

          <p *ngIf="isScheduled(post)" class="text-xs font-semibold text-warning mb-3">
            {{ formatDate(post.publishAt) }} tarihinde yayınlanacak
          </p>

          <div class="mt-auto flex justify-end gap-2 pt-3 border-t border-border">
            <a
              [routerLink]="['/posts/edit', post.slug]"
              class="px-3 py-1.5 rounded-lg bg-primary !text-white text-xs font-bold hover:bg-primary-dark transition-colors"
            >
              Düzenle
            </a>
            <button
              class="px-3 py-1.5 rounded-lg border border-danger !text-danger text-xs font-bold hover:bg-danger hover:!text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
              (click)="onDelete(post)"
              [disabled]="deletingSlug === post.slug"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tablo görünümü -->
    <div *ngIf="!isLoading && filteredPosts.length > 0 && viewMode === 'table'" class="bg-surface border border-border rounded-2xl overflow-x-auto">
      <table class="w-full text-sm border-collapse table-fixed min-w-[900px]">
        <colgroup>
          <col class="w-[18%]" />
          <col class="w-[24%]" />
          <col class="w-[10%]" />
          <col class="w-[8%]" />
          <col class="w-[14%]" />
          <col class="w-[10%]" />
          <col class="w-[16%]" />
        </colgroup>
        <thead>
          <tr class="border-b border-border text-left text-text-muted">
            <th class="px-4 py-3 font-semibold">Slug</th>
            <th class="px-4 py-3 font-semibold">Başlık</th>
            <th class="px-4 py-3 font-semibold">Durum</th>
            <th class="px-4 py-3 font-semibold">Dil</th>
            <th class="px-4 py-3 font-semibold">Yazar</th>
            <th class="px-4 py-3 font-semibold">Tarih</th>
            <th class="px-4 py-3 font-semibold text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let post of filteredPosts" class="border-b border-border last:border-0 hover:bg-bg transition-colors align-top">
            <td class="px-4 py-3">
              <span class="font-mono text-xs text-primary truncate block" [title]="'/posts/' + post.slug">/posts/{{ post.slug }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="font-bold text-text-primary truncate" [title]="post.title">{{ post.title }}</div>
              <div class="flex flex-wrap gap-1 mt-1" *ngIf="post.tags?.length">
                <span *ngFor="let t of post.tags" class="text-[11px] font-semibold text-text-muted bg-bg px-1.5 py-0.5 rounded-full">
                  {{ t.name }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <app-badge [text]="statusLabel(post)" [tone]="statusTone(post)"></app-badge>
            </td>
            <td class="px-4 py-3 text-text-muted truncate">{{ languageLabel(post.language) }}</td>
            <td class="px-4 py-3 text-text-muted truncate" [title]="post.authorFullName || post.authorName">
              {{ post.authorFullName || post.authorName }}
            </td>
            <td class="px-4 py-3 text-text-muted whitespace-nowrap">{{ formatDate(post.createdAt) }}</td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <a
                  [routerLink]="['/posts/edit', post.slug]"
                  class="px-3 py-1.5 rounded-lg bg-primary !text-white text-xs font-bold hover:bg-primary-dark transition-colors whitespace-nowrap"
                >
                  Düzenle
                </a>
                <button
                  class="px-3 py-1.5 rounded-lg border border-danger !text-danger text-xs font-bold hover:bg-danger hover:!text-white transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
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
  `,
})
export class PostsListComponent implements OnInit {
  private postService = inject(PostService);
  private collectionService = inject(CollectionService);
  private tagService = inject(TagService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  posts: Post[] = [];
  collections: CollectionSummary[] = [];
  tags: TagSummary[] = [];
  isLoading = true;
  deletingSlug: string | null = null;
  viewMode: 'grid' | 'table' = 'grid';

  searchQuery = '';
  statusFilter: 'all' | PostStatus | 'SCHEDULED' = 'all';
  languageFilter: 'all' | Language = 'all';
  collectionFilter = 'all';
  tagFilter = 'all';
  authorFilter = 'all';

  ngOnInit(): void {
    this.loadPosts();
    this.collectionService.getCollections().subscribe({ next: (list) => (this.collections = list), error: () => {} });
    this.tagService.getTags().subscribe({ next: (list) => (this.tags = list), error: () => {} });
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

  // Yazının benzersiz yazarlarının listesi - admin filtre dropdown'ını
  // doldurmak için kullanılıyor, ayrı bir API çağrısına gerek yok.
  get authorOptions(): string[] {
    const names = new Set(this.posts.map((p) => p.authorFullName || p.authorName));
    return Array.from(names).sort();
  }

  isScheduled(post: Post): boolean {
    return post.status === 'DRAFT' && !!post.publishAt && new Date(post.publishAt) > new Date();
  }

  statusLabel(post: Post): string {
    if (this.isScheduled(post)) return 'Zamanlanmış';
    return post.status === 'PUBLISHED' ? 'Yayında' : 'Taslak';
  }

  statusTone(post: Post): BadgeTone {
    if (this.isScheduled(post)) return 'warning';
    return post.status === 'PUBLISHED' ? 'success' : 'neutral';
  }

  languageLabel(lang: Language): string {
    switch (lang) {
      case 'TR': return 'Türkçe';
      case 'EN': return 'İngilizce';
      case 'DE': return 'Almanca';
      case 'RU': return 'Rusça';
      default: return lang;
    }
  }

  get filteredPosts(): Post[] {
    const q = this.searchQuery.toLowerCase().trim();

    return this.posts.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.name.toLowerCase().includes(q));

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'SCHEDULED' ? this.isScheduled(p) : p.status === this.statusFilter);

      const matchesLanguage = this.languageFilter === 'all' || p.language === this.languageFilter;

      const matchesCollection =
        this.collectionFilter === 'all' || (p.collections || []).some((c) => c.name === this.collectionFilter);

      const matchesTag = this.tagFilter === 'all' || (p.tags || []).some((t) => t.name === this.tagFilter);

      const matchesAuthor =
        this.authorFilter === 'all' || (p.authorFullName || p.authorName) === this.authorFilter;

      return matchesQuery && matchesStatus && matchesLanguage && matchesCollection && matchesTag && matchesAuthor;
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