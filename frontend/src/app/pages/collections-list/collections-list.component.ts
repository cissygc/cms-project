import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CollectionService, CollectionListItem } from '../../services/collection.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-collections-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-text-primary">Koleksiyonlar</h1>
        <p class="text-text-muted text-sm mt-1">
          Yazıların gruplandığı koleksiyonları (kategorileri) yönet. Bir koleksiyona tıklayarak
          o koleksiyondaki yazıları görebilirsin.
        </p>
      </div>
      <button
        (click)="openCreateModal()"
        class="px-5 py-2.5 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors"
      >
        + Yeni Koleksiyon
      </button>
    </div>

    <div class="bg-surface border border-border rounded-2xl overflow-hidden">
      <div *ngIf="isLoading" class="text-center py-16 text-text-muted">Yükleniyor...</div>

      <div *ngIf="!isLoading && collections.length === 0" class="text-center py-16 text-text-muted">
        Henüz koleksiyon oluşturulmamış.
      </div>

      <table *ngIf="!isLoading && collections.length > 0" class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-border text-left text-text-muted">
            <th class="px-5 py-3 font-semibold">Ad</th>
            <th class="px-5 py-3 font-semibold">URL Adresi</th>
            <th class="px-5 py-3 font-semibold">Yazı Sayısı</th>
            <th class="px-5 py-3 font-semibold text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of collections" class="border-b border-border last:border-0 hover:bg-bg transition-colors">
            <td class="px-5 py-3">
              <a
                [routerLink]="['/posts']"
                [queryParams]="{ collection: c.name }"
                class="font-bold text-text-primary hover:text-primary hover:underline transition-colors"
              >
                {{ c.name }}
              </a>
            </td>
            <td class="px-5 py-3 font-mono text-xs text-primary">/{{ c.slug }}</td>
            <td class="px-5 py-3 text-text-muted">
              <a [routerLink]="['/posts']" [queryParams]="{ collection: c.name }" class="hover:text-primary hover:underline">
                {{ c.postCount }} yazı
              </a>
            </td>
            <td class="px-5 py-3 text-right">
              <button
                class="px-3 py-1.5 rounded-lg border border-danger !text-danger text-xs font-bold hover:bg-danger hover:!text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                (click)="onDelete(c)"
                [disabled]="deletingId === c.id"
              >
                Sil
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Yeni koleksiyon modalı -->
    <div
      *ngIf="showCreateModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      (click)="closeCreateModal()"
    >
      <div class="bg-surface rounded-2xl p-6 max-w-md w-full" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-bold text-text-primary mb-5">Yeni Koleksiyon</h3>

        <form (ngSubmit)="onCreate()" #collectionForm="ngForm" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-text-primary mb-1.5" for="newCollectionName">Koleksiyon Adı</label>
            <input
              type="text"
              id="newCollectionName"
              name="name"
              class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              [(ngModel)]="name"
              required
              placeholder="ör. Yapay Zeka"
            />
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="closeCreateModal()"
              class="px-4 py-2 rounded-xl border border-border text-sm font-bold text-text-primary hover:bg-bg transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting || !collectionForm.valid"
              class="px-4 py-2 rounded-xl bg-primary !text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? 'Oluşturuluyor...' : 'Oluştur' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CollectionsListComponent implements OnInit {
  private collectionService = inject(CollectionService);
  private toastService = inject(ToastService);

  collections: CollectionListItem[] = [];
  isLoading = true;
  deletingId: number | null = null;

  showCreateModal = false;
  name = '';
  isSubmitting = false;

  ngOnInit(): void {
    this.loadCollections();
  }

  loadCollections(): void {
    this.isLoading = true;
    this.collectionService.getCollections().subscribe({
      next: (list) => {
        this.collections = list;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Koleksiyonlar alınamadı.');
        this.isLoading = false;
      },
    });
  }

  openCreateModal(): void {
    this.name = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onCreate(): void {
    if (!this.name.trim()) return;
    this.isSubmitting = true;
    this.collectionService.createCollection(this.name.trim()).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success(`"${this.name}" koleksiyonu oluşturuldu.`);
        this.showCreateModal = false;
        this.loadCollections();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.message || 'Koleksiyon oluşturulamadı.');
      },
    });
  }

  // Backend, içinde post olan bir koleksiyonu silmeye izin vermiyor - bu
  // durumda hata mesajını (kaç yazı olduğunu belirten) doğrudan gösteriyoruz.
  onDelete(c: CollectionListItem): void {
    if (!confirm(`"${c.name}" koleksiyonunu silmek istediğinize emin misiniz?`)) return;

    this.deletingId = c.id;
    this.collectionService.deleteCollection(c.id).subscribe({
      next: () => {
        this.toastService.success(`"${c.name}" koleksiyonu silindi.`);
        this.collections = this.collections.filter((x) => x.id !== c.id);
        this.deletingId = null;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Koleksiyon silinemedi.');
        this.deletingId = null;
      },
    });
  }
}