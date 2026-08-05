import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagService, TagListItem } from '../../services/tag.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tags-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold text-text-primary">Etiketler</h1>
      <p class="text-text-muted text-sm mt-1">
        Etiketler yazı düzenlerken otomatik oluşur - burada sadece mevcut etiketleri görüp silebilirsin.
      </p>
    </div>

    <div class="bg-surface border border-border rounded-2xl overflow-hidden">
      <div *ngIf="isLoading" class="text-center py-16 text-text-muted">Yükleniyor...</div>

      <div *ngIf="!isLoading && tags.length === 0" class="text-center py-16 text-text-muted">
        Henüz hiç etiket oluşturulmamış.
      </div>

      <table *ngIf="!isLoading && tags.length > 0" class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-border text-left text-text-muted">
            <th class="px-5 py-3 font-semibold">Ad</th>
            <th class="px-5 py-3 font-semibold">URL Adresi</th>
            <th class="px-5 py-3 font-semibold">Yazı Sayısı</th>
            <th class="px-5 py-3 font-semibold text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of tags" class="border-b border-border last:border-0 hover:bg-bg transition-colors">
            <td class="px-5 py-3 font-bold text-text-primary">{{ t.name }}</td>
            <td class="px-5 py-3 font-mono text-xs text-primary">/{{ t.slug }}</td>
            <td class="px-5 py-3 text-text-muted">{{ t.postCount }} yazı</td>
            <td class="px-5 py-3 text-right">
              <button
                class="px-3 py-1.5 rounded-lg border border-danger !text-danger text-xs font-bold hover:bg-danger hover:!text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                (click)="onDeleteClick(t)"
                [disabled]="deletingId === t.id"
              >
                Sil
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- İki aşamalı silme onayı: etiket bir yazıda kullanılıyorsa backend
         önce kaç yazıyı etkileyeceğini söylüyor, burada onay isteniyor. -->
    <div
      *ngIf="pendingDelete"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      (click)="cancelDelete()"
    >
      <div class="bg-surface rounded-2xl p-6 max-w-md w-full" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold text-text-primary mb-2">Etiketi Sil</h3>
        <p class="text-sm text-text-muted mb-4">
          <strong class="text-text-primary">{{ pendingDelete.name }}</strong> etiketi
          <strong>{{ affectedPostCount }} yazıda</strong> kullanılıyor.
        </p>

        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p class="text-sm text-amber-800">
            Etiketi silseniz de yazıların kendisi silinmez, sadece bu etiketten çıkarılır.
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <button
            (click)="cancelDelete()"
            class="px-4 py-2 rounded-xl border border-border text-sm font-bold text-text-primary hover:bg-bg transition-colors"
          >
            Vazgeç
          </button>
          <button
            (click)="confirmDelete()"
            [disabled]="deletingId === pendingDelete.id"
            class="px-4 py-2 rounded-xl bg-danger !text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {{ deletingId === pendingDelete.id ? 'Siliniyor...' : 'Yine de Sil' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class TagsListComponent implements OnInit {
  private tagService = inject(TagService);
  private toastService = inject(ToastService);

  tags: TagListItem[] = [];
  isLoading = true;
  deletingId: number | null = null;

  pendingDelete: TagListItem | null = null;
  affectedPostCount = 0;

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.isLoading = true;
    this.tagService.getTags().subscribe({
      next: (list) => {
        this.tags = list;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Etiketler alınamadı.');
        this.isLoading = false;
      },
    });
  }

  // İlk tıklamada confirm=false gönderiyoruz - hiçbir yazıda kullanılmıyorsa
  // backend zaten direkt siliyor (deleted:true döner), kullanılıyorsa
  // onay modalını açıyoruz.
  onDeleteClick(t: TagListItem): void {
    this.deletingId = t.id;
    this.tagService.deleteTag(t.id, false).subscribe({
      next: (result) => {
        this.deletingId = null;
        if (result.deleted) {
          this.toastService.success(`"${t.name}" etiketi silindi.`);
          this.tags = this.tags.filter((x) => x.id !== t.id);
        } else {
          this.pendingDelete = t;
          this.affectedPostCount = result.affectedPostCount;
        }
      },
      error: (err) => {
        this.deletingId = null;
        this.toastService.error(err.message || 'Etiket silinemedi.');
      },
    });
  }

  cancelDelete(): void {
    this.pendingDelete = null;
  }

  confirmDelete(): void {
    const tag = this.pendingDelete;
    if (!tag) return;

    this.deletingId = tag.id;
    this.tagService.deleteTag(tag.id, true).subscribe({
      next: () => {
        this.toastService.success(`"${tag.name}" etiketi silindi.`);
        this.tags = this.tags.filter((x) => x.id !== tag.id);
        this.pendingDelete = null;
        this.deletingId = null;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Etiket silinemedi.');
        this.deletingId = null;
      },
    });
  }
}