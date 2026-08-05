import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { CollectionService } from '../../services/collection.service';
import { TagService } from '../../services/tag.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { BadgeComponent, BadgeTone } from '../../components/badge/badge.component';
import { Post, PostStatus, Language, CollectionSummary, TagSummary, PostPayload } from '../../models/post.model';

type SortKey = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';

const PAGE_STEP = 5;

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

    <!-- Üst bar: arama + filtreler butonu + sıralama + görünüm -->
    <div class="bg-surface border border-border rounded-2xl p-4 mb-4">
      <div class="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Başlık, URL adresi veya etiket ile ara..."
          class="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />

        <button
          type="button"
          (click)="filtersOpen = !filtersOpen"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors"
          [class.border-primary]="filtersOpen || activeFilterCount > 0"
          [class.text-primary]="filtersOpen || activeFilterCount > 0"
          [class.border-border]="!(filtersOpen || activeFilterCount > 0)"
          [class.text-text-primary]="!(filtersOpen || activeFilterCount > 0)"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filtreler
          <span *ngIf="activeFilterCount > 0" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary !text-white text-[11px] font-bold">
            {{ activeFilterCount }}
          </span>
        </button>

        <select
          [(ngModel)]="sortKey"
          class="px-3 py-2.5 rounded-xl border border-border bg-bg text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="date-desc">Tarih (yeni &rarr; eski)</option>
          <option value="date-asc">Tarih (eski &rarr; yeni)</option>
          <option value="title-asc">İsim (A &rarr; Z)</option>
          <option value="title-desc">İsim (Z &rarr; A)</option>
        </select>

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

      <!-- Açılır filtre paneli - üst bardan aşağı doğru açılır, listenin ÜSTÜNDE durur -->
      <div *ngIf="filtersOpen" class="mt-4 pt-4 border-t border-border">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-bold text-text-muted uppercase tracking-wide">Filtrele</span>
          <button
            *ngIf="activeFilterCount > 0"
            type="button"
            (click)="clearAllFilters()"
            class="text-xs font-bold text-primary hover:underline"
          >
            Tümünü temizle ({{ activeFilterCount }})
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <!-- Durum -->
          <div>
            <div class="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Durum</div>
            <label class="flex items-center gap-2.5 py-1 cursor-pointer">
              <input type="checkbox" [checked]="statusSet.has('PUBLISHED')" (change)="toggleSet(statusSet, 'PUBLISHED')" class="rounded border-border accent-primary" />
              <span class="text-sm text-text-primary">Yayında</span>
            </label>
            <label class="flex items-center gap-2.5 py-1 cursor-pointer">
              <input type="checkbox" [checked]="statusSet.has('DRAFT')" (change)="toggleSet(statusSet, 'DRAFT')" class="rounded border-border accent-primary" />
              <span class="text-sm text-text-primary">Taslak</span>
            </label>
            <label class="flex items-center gap-2.5 py-1 cursor-pointer">
              <input type="checkbox" [checked]="statusSet.has('SCHEDULED')" (change)="toggleSet(statusSet, 'SCHEDULED')" class="rounded border-border accent-primary" />
              <span class="text-sm text-text-primary">Zamanlanmış</span>
            </label>
          </div>

          <!-- Dil -->
          <div>
            <div class="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Dil</div>
            <label *ngFor="let l of languageOptions" class="flex items-center gap-2.5 py-1 cursor-pointer">
              <input type="checkbox" [checked]="languageSet.has(l.value)" (change)="toggleSet(languageSet, l.value)" class="rounded border-border accent-primary" />
              <span class="text-sm text-text-primary">{{ l.label }}</span>
            </label>
          </div>

          <!-- Koleksiyon -->
          <div *ngIf="collections.length > 0">
            <div class="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Koleksiyon</div>
            <label *ngFor="let c of collections.slice(0, collectionShowCount)" class="flex items-center gap-2.5 py-1 cursor-pointer">
              <input type="checkbox" [checked]="collectionSet.has(c.name)" (change)="toggleSet(collectionSet, c.name)" class="rounded border-border accent-primary" />
              <span class="text-sm text-text-primary truncate">{{ c.name }}</span>
            </label>
            <button
              *ngIf="collections.length > collectionShowCount"
              type="button"
              (click)="collectionShowCount = collectionShowCount + 5"
              class="text-xs font-bold text-primary hover:underline mt-1"
            >
              {{ collections.length - collectionShowCount }} tane daha göster
            </button>
          </div>

          <!-- Etiket -->
          <div *ngIf="tags.length > 0">
            <div class="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Etiket</div>
            <label *ngFor="let t of tags.slice(0, tagShowCount)" class="flex items-center gap-2.5 py-1 cursor-pointer">
              <input type="checkbox" [checked]="tagSet.has(t.name)" (change)="toggleSet(tagSet, t.name)" class="rounded border-border accent-primary" />
              <span class="text-sm text-text-primary truncate">{{ t.name }}</span>
            </label>
            <button
              *ngIf="tags.length > tagShowCount"
              type="button"
              (click)="tagShowCount = tagShowCount + 5"
              class="text-xs font-bold text-primary hover:underline mt-1"
            >
              {{ tags.length - tagShowCount }} tane daha göster
            </button>
          </div>

          <!-- Yazar - sadece admin görür -->
          <div *ngIf="authService.isAdmin() && authorOptions.length > 0">
            <div class="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Yazar</div>
            <label *ngFor="let a of authorOptions.slice(0, authorShowCount)" class="flex items-center gap-2.5 py-1 cursor-pointer">
              <input type="checkbox" [checked]="authorSet.has(a.username)" (change)="toggleSet(authorSet, a.username)" class="rounded border-border accent-primary" />
              <span class="text-sm text-text-primary truncate">{{ a.label }}</span>
            </label>
            <button
              *ngIf="authorOptions.length > authorShowCount"
              type="button"
              (click)="authorShowCount = authorShowCount + 5"
              class="text-xs font-bold text-primary hover:underline mt-1"
            >
              {{ authorOptions.length - authorShowCount }} tane daha göster
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <span class="text-sm text-text-muted">{{ filteredPosts.length }} yazı</span>
    </div>

    <div *ngIf="isLoading" class="text-center py-16 text-text-muted">Yükleniyor...</div>

    <div *ngIf="!isLoading && filteredPosts.length === 0" class="text-center py-16 bg-surface border border-border rounded-2xl text-text-muted">
      Aranan kriterde kayıt bulunamadı.
    </div>

    <!-- Kart görünümü -->
    <div *ngIf="!isLoading && filteredPosts.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        *ngFor="let post of sortedPosts"
        class="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
      >
        <div class="h-36 bg-primary-light flex items-center justify-center overflow-hidden">
          <img *ngIf="post.image" [src]="post.image" [alt]="post.title" class="w-full h-full object-cover" />
          <img
            *ngIf="!post.image"
            src="assets/branding/revlo-logo.png"
            alt="Revlo"
            class="h-9 w-auto opacity-40"
          />
        </div>

        <div class="p-4 flex flex-col flex-1">
          <div class="flex items-center justify-between mb-2">
            <app-badge [text]="statusLabel(post)" [tone]="statusTone(post)"></app-badge>
            <span class="text-xs text-text-muted">{{ formatDate(post.createdAt) }}</span>
          </div>

          <h3 class="font-bold text-text-primary mb-1 line-clamp-2">{{ post.title }}</h3>
          <p class="text-sm text-text-muted mb-3">{{ post.authorFullName || post.authorName }} &middot; {{ languageLabel(post.language) }}</p>

          <div class="flex flex-wrap gap-1.5 mb-3" *ngIf="post.tags?.length || post.collections?.length">
            <span *ngFor="let c of post.collections" class="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
              {{ c.name }}
            </span>
            <span *ngFor="let t of post.tags" class="text-xs font-semibold text-text-muted bg-bg px-2 py-0.5 rounded-full">
              {{ t.name }}
            </span>
          </div>

          <p *ngIf="isScheduled(post)" class="text-xs font-semibold text-warning mb-3">
            {{ formatDate(post.publishAt) }} tarihinde yayınlanacak
          </p>

          <div class="mt-auto flex justify-end gap-2 pt-3 border-t border-border flex-wrap">
            <button
              *ngIf="post.status === 'DRAFT'"
              class="px-3 py-1.5 rounded-lg border border-primary !text-primary text-xs font-bold hover:bg-primary hover:!text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
              (click)="onQuickPublish(post)"
              [disabled]="publishingSlug === post.slug"
            >
              {{ publishingSlug === post.slug ? 'Yayınlanıyor...' : 'Yayınla' }}
            </button>
            <a [routerLink]="['/posts/edit', post.slug]" class="px-3 py-1.5 rounded-lg bg-primary !text-white text-xs font-bold hover:bg-primary-dark transition-colors">
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
          <col class="w-[16%]" />
          <col class="w-[22%]" />
          <col class="w-[9%]" />
          <col class="w-[7%]" />
          <col class="w-[13%]" />
          <col class="w-[9%]" />
          <col class="w-[24%]" />
        </colgroup>
        <thead>
          <tr class="border-b border-border text-left text-text-muted">
            <th class="px-4 py-3 font-semibold">URL Adresi</th>
            <th class="px-4 py-3 font-semibold">Başlık</th>
            <th class="px-4 py-3 font-semibold">Durum</th>
            <th class="px-4 py-3 font-semibold">Dil</th>
            <th class="px-4 py-3 font-semibold">Yazar</th>
            <th class="px-4 py-3 font-semibold">Tarih</th>
            <th class="px-4 py-3 font-semibold text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let post of sortedPosts" class="border-b border-border last:border-0 hover:bg-bg transition-colors align-top">
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
              <div class="flex justify-end gap-2 flex-wrap">
                <button
                  *ngIf="post.status === 'DRAFT'"
                  class="px-3 py-1.5 rounded-lg border border-primary !text-primary text-xs font-bold hover:bg-primary hover:!text-white transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
                  (click)="onQuickPublish(post)"
                  [disabled]="publishingSlug === post.slug"
                >
                  {{ publishingSlug === post.slug ? 'Yayınlanıyor...' : 'Yayınla' }}
                </button>
                <a [routerLink]="['/posts/edit', post.slug]" class="px-3 py-1.5 rounded-lg bg-primary !text-white text-xs font-bold hover:bg-primary-dark transition-colors whitespace-nowrap">
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
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  posts: Post[] = [];
  collections: CollectionSummary[] = [];
  tags: TagSummary[] = [];
  authorOptions: { username: string; label: string }[] = [];
  isLoading = true;
  deletingSlug: string | null = null;
  publishingSlug: string | null = null;
  viewMode: 'grid' | 'table' = 'grid';
  sortKey: SortKey = 'date-desc';

  filtersOpen = false;
  searchQuery = '';
  statusSet = new Set<string>();
  languageSet = new Set<string>();
  collectionSet = new Set<string>();
  tagSet = new Set<string>();
  authorSet = new Set<string>();

  // Her filtre kategorisinde başlangıçta sadece PAGE_STEP kadar seçenek
  // gösteriliyor - "daha fazla göster" ile 5'er 5'er artıyor.
  collectionShowCount = PAGE_STEP;
  tagShowCount = PAGE_STEP;
  authorShowCount = PAGE_STEP;

  languageOptions: { value: Language; label: string }[] = [
    { value: 'TR', label: 'Türkçe' },
    { value: 'EN', label: 'İngilizce' },
    { value: 'DE', label: 'Almanca' },
    { value: 'RU', label: 'Rusça' },
  ];

  ngOnInit(): void {
    // Koleksiyonlar sayfasından bir koleksiyona tıklanıp gelindiyse
    // (?collection=Ad) o koleksiyon otomatik işaretli gelsin.
    const collectionParam = this.route.snapshot.queryParamMap.get('collection');
    if (collectionParam) {
      this.collectionSet.add(collectionParam);
      this.filtersOpen = true;
    }

    this.loadPosts();
    this.collectionService.getCollections().subscribe({ next: (list) => (this.collections = list), error: () => {} });
    this.tagService.getTags().subscribe({ next: (list) => (this.tags = list), error: () => {} });

    if (this.authService.isAdmin()) {
      this.userService.getUsers().subscribe({
        next: (list) =>
          (this.authorOptions = list
            .filter((u) => !u.deleted)
            .map((u) => ({ username: u.username, label: u.fullName || u.username }))),
        error: () => {},
      });
    }
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

  toggleSet(set: Set<string>, value: string): void {
    if (set.has(value)) set.delete(value);
    else set.add(value);
  }

  get activeFilterCount(): number {
    return (
      this.statusSet.size + this.languageSet.size + this.collectionSet.size + this.tagSet.size + this.authorSet.size
    );
  }

  clearAllFilters(): void {
    this.statusSet.clear();
    this.languageSet.clear();
    this.collectionSet.clear();
    this.tagSet.clear();
    this.authorSet.clear();
    this.searchQuery = '';
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
    return this.languageOptions.find((l) => l.value === lang)?.label || lang;
  }

  get filteredPosts(): Post[] {
    const q = this.searchQuery.toLowerCase().trim();

    return this.posts.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.name.toLowerCase().includes(q));

      const postStatusKey = this.isScheduled(p) ? 'SCHEDULED' : p.status;
      const matchesStatus = this.statusSet.size === 0 || this.statusSet.has(postStatusKey);

      const matchesLanguage = this.languageSet.size === 0 || this.languageSet.has(p.language);

      const matchesCollection =
        this.collectionSet.size === 0 || (p.collections || []).some((c) => this.collectionSet.has(c.name));

      const matchesTag = this.tagSet.size === 0 || (p.tags || []).some((t) => this.tagSet.has(t.name));

      const matchesAuthor = this.authorSet.size === 0 || this.authorSet.has(p.authorName);

      return matchesQuery && matchesStatus && matchesLanguage && matchesCollection && matchesTag && matchesAuthor;
    });
  }

  get sortedPosts(): Post[] {
    const list = [...this.filteredPosts];
    switch (this.sortKey) {
      case 'date-asc':
        return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
      case 'title-desc':
        return list.sort((a, b) => b.title.localeCompare(a.title, 'tr'));
      case 'date-desc':
      default:
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  // Listeden tek tıkla yayınlama - post zaten tüm alanlarıyla elimizde
  // olduğu için editöre gitmeye gerek yok, aynı veriyle status=PUBLISHED
  // gönderip güncelliyoruz. publishAt kasten göndermiyoruz - backend zaten
  // status=PUBLISHED olunca zamanlanmış tarihi otomatik temizliyor.
  onQuickPublish(post: Post): void {
    this.publishingSlug = post.slug;
    const payload: PostPayload = {
      slug: post.slug,
      title: post.title,
      content: post.content,
      status: 'PUBLISHED',
      language: post.language,
      collectionIds: (post.collections || []).map((c) => c.id),
      tagNames: (post.tags || []).map((t) => t.name),
      media: (post.media || []).map((m) => ({ mediaId: m.mediaId, caption: m.caption })),
      seo: {
        metaTitle: post.seo?.metaTitle,
        metaDescription: post.seo?.metaDescription,
        ogImageUrl: post.seo?.ogImageUrl,
        canonicalUrl: post.seo?.canonicalUrl,
        noIndex: post.seo?.noIndex,
      },
    };

    this.postService.updatePost(post.slug, payload).subscribe({
      next: (updated) => {
        this.publishingSlug = null;
        this.toastService.success(`"${post.title}" yayınlandı.`);
        const idx = this.posts.findIndex((p) => p.slug === post.slug);
        if (idx !== -1) this.posts[idx] = updated;
      },
      error: (err) => {
        this.publishingSlug = null;
        this.toastService.error(err.message || 'Yayınlanamadı.');
      },
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