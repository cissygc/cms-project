import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { ToastService } from '../../services/toast.service';
import { MediaItem } from '../../models/media.model';

// Bu modal iki modda çalışır:
// - Tekli mod (multiple=false, varsayılan): bir görsele tıklamak hemen seçer
//   ve modal kapanır. Kapak görseli seçimi için kullanılır.
// - Çoklu mod (multiple=true): görseller işaretlenir (checkmark), "Ekle"
//   butonuna basılana kadar modal kapanmaz. İçerik galerisi için kullanılır.
// Her iki modda da "picked" event'i MediaItem[] olarak emit edilir -
// tekli modda dizide her zaman 1 eleman olur.
@Component({
  selector: 'app-media-picker-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ multiple ? '🖼️ Galeriye Görsel Ekle' : '🖼️ Görsel Seç veya Yükle' }}</h3>
          <button class="close-btn" (click)="close()">✕</button>
        </div>

        <div class="modal-body">
          <div class="upload-section">
            <label class="btn btn-primary upload-btn">
              <span>+ Yeni Görsel Yükle</span>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" hidden />
            </label>
            <span *ngIf="isUploading" class="uploading-text">Görsel yükleniyor...</span>
            <span *ngIf="multiple && selectedIds.size > 0" class="selection-count">
              {{ selectedIds.size }} görsel seçildi
            </span>
          </div>

          <div *ngIf="isLoading" class="loading-state">
            <div class="spinner"></div>
            <span>Medya dosyaları yükleniyor...</span>
          </div>

          <div *ngIf="!isLoading && mediaList.length === 0" class="empty-state">
            <div class="empty-icon">📷</div>
            <p>Henüz yüklenmiş bir görsel bulunmuyor.</p>
            <p class="sub-text">Yukarıdaki butonu kullanarak ilk görselinizi yükleyebilirsiniz.</p>
          </div>

          <div *ngIf="!isLoading && mediaList.length > 0" class="media-grid">
            <div
              *ngFor="let item of mediaList"
              class="media-card"
              [class.selected]="selectedIds.has(item.id)"
              (click)="onCardClick(item)"
              title="Görseli seçmek için tıklayın"
            >
              <div class="img-wrapper">
                <img [src]="item.url" [alt]="item.name" loading="lazy" />
                <div *ngIf="multiple && selectedIds.has(item.id)" class="check-badge">✓</div>
              </div>
              <div class="media-name">{{ item.name }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">İptal</button>
          <button
            *ngIf="multiple"
            class="btn btn-primary"
            [disabled]="selectedIds.size === 0"
            (click)="confirmSelection()"
          >
            Seçilenleri Ekle ({{ selectedIds.size }})
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(17, 24, 39, 0.6);
        backdrop-filter: blur(8px);
        z-index: 9000;
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
      }
      .modal-card {
        background: #ffffff;
        border: 1px solid #e8e3f2;
        border-radius: 20px;
        width: 100%;
        max-width: 760px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }
      .modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e8e3f2;
        display: flex; justify-content: space-between; align-items: center;
        background: #f8f6fc;
      }
      .modal-header h3 { font-size: 18px; font-weight: 800; color: #111827; }
      .close-btn {
        background: none; border: none; color: #6b7280;
        font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 8px;
      }
      .close-btn:hover { color: #111827; background: rgba(0, 0, 0, 0.05); }
      .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
      .upload-section {
        display: flex; align-items: center; gap: 16px;
        margin-bottom: 20px; padding-bottom: 16px;
        border-bottom: 1px solid #f1f5f9;
        flex-wrap: wrap;
      }
      .upload-btn { cursor: pointer; }
      .uploading-text { font-size: 13px; font-weight: 700; color: #7c3aed; }
      .selection-count {
        font-size: 12px; font-weight: 700; color: #ffffff;
        background: var(--revlo-purple-main);
        padding: 4px 10px; border-radius: var(--radius-pill);
        margin-left: auto;
      }
      .media-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;
      }
      .media-card {
        background: #ffffff;
        border: 2px solid #e8e3f2;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      }
      .media-card:hover { border-color: #7c3aed; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.15); }
      .media-card.selected { border-color: var(--revlo-purple-main); box-shadow: 0 0 0 3px rgba(88,32,129,0.15); }
      .img-wrapper { position: relative; width: 100%; height: 110px; background: #f1f5f9; overflow: hidden; }
      .media-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .check-badge {
        position: absolute; top: 6px; right: 6px;
        width: 22px; height: 22px;
        background: var(--revlo-purple-main);
        color: #fff;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 800;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      .media-name {
        padding: 8px; font-size: 12px; font-weight: 600; color: #111827;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;
      }
      .loading-state, .empty-state { text-align: center; padding: 40px 0; color: #6b7280; font-size: 14px; }
      .empty-icon { font-size: 40px; margin-bottom: 8px; }
      .sub-text { font-size: 12px; color: #9ca3af; margin-top: 4px; }
      .spinner {
        width: 32px; height: 32px;
        border: 3px solid #e8e3f2; border-top-color: #7c3aed;
        border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .modal-footer {
        padding: 16px 24px; border-top: 1px solid #e8e3f2;
        display: flex; justify-content: flex-end; gap: 10px;
        background: #f8f6fc;
      }
    `,
  ],
})
export class MediaPickerModalComponent {
  private mediaService = inject(MediaService);
  private toastService = inject(ToastService);

  private _isOpen = false;
  @Input() set isOpen(val: boolean) {
    this._isOpen = val;
    if (val) {
      this.selectedIds.clear();
      this.loadMedia();
    }
  }
  get isOpen(): boolean {
    return this._isOpen;
  }

  // multiple=false: tıklama anında seçer ve kapanır (kapak görseli).
  // multiple=true: birden fazla görsel işaretlenip "Ekle" ile onaylanır (galeri).
  @Input() multiple = false;

  @Output() picked = new EventEmitter<MediaItem[]>();
  @Output() closed = new EventEmitter<void>();

  mediaList: MediaItem[] = [];
  isLoading = false;
  isUploading = false;
  selectedIds = new Set<number | string>();

  loadMedia(): void {
    this.isLoading = true;
    this.mediaService.getMediaList().subscribe({
      next: (list) => {
        this.mediaList = list;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Görseller yüklenemedi.');
        this.isLoading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isUploading = true;

    this.mediaService.uploadMedia(file).subscribe({
      next: (item) => {
        this.isUploading = false;
        this.toastService.success('Görsel yüklendi.');
        this.mediaList.unshift(item);
        if (!this.multiple) {
          this.picked.emit([item]);
          this.close();
        } else {
          this.selectedIds.add(item.id);
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.toastService.error(err.message || 'Görsel yüklenemedi.');
      },
    });
    input.value = '';
  }

  onCardClick(item: MediaItem): void {
    if (!this.multiple) {
      this.picked.emit([item]);
      this.close();
      return;
    }
    if (this.selectedIds.has(item.id)) {
      this.selectedIds.delete(item.id);
    } else {
      this.selectedIds.add(item.id);
    }
  }

  confirmSelection(): void {
    const items = this.mediaList.filter((m) => this.selectedIds.has(m.id));
    this.picked.emit(items);
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}