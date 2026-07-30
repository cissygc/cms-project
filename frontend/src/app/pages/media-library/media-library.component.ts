import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { ToastService } from '../../services/toast.service';
import { MediaItem } from '../../models/media.model';

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Medya Kütüphanesi</h1>
          <p class="section-desc">Görsel ve dijital varlıklarınızı merkezi depoda yönetin</p>
        </div>

        <label class="btn btn-primary upload-btn">
          <span>✨ Görsel Yükle</span>
          <input type="file" (change)="onFileSelected($event)" accept="image/*" hidden />
        </label>
      </div>

      <!-- Drag & Drop Upload Zone -->
      <div
        class="glass-card dropzone-card"
        [class.dragging]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <div class="dropzone-content">
          <div class="upload-icon-circle">
            <span class="upload-icon">☁️</span>
          </div>
          <h3>Görsellerinizi Buraya Sürükleyin</h3>
          <p>veya bilgisayarınızdan dosya seçmek için yukarıdaki butonu kullanın</p>
          <span class="file-hint">Desteklenen formatlar: JPG, PNG, WEBP, GIF, SVG</span>
        </div>
      </div>

      <div *ngIf="isUploading" class="uploading-bar">
        <div class="spinner-sm"></div>
        <span>Görsel sunucuya yükleniyor, lütfen bekleyin...</span>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Medya kütüphanesi taranıyor...</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && mediaList.length === 0" class="glass-card empty-card">
        <div class="empty-icon-box">🖼️</div>
        <h3>Henüz Yüklenmiş Medya Yok</h3>
        <p>İçeriklerinizde kullanmak için ilk görselinizi yükleyin.</p>
      </div>

      <!-- Media Grid -->
      <div *ngIf="!isLoading && mediaList.length > 0" class="media-grid">
        <div *ngFor="let item of mediaList" class="glass-card media-card">
          <div class="image-box">
            <img [src]="item.url" [alt]="item.name" loading="lazy" />
            <div class="image-overlay">
              <button class="overlay-btn" (click)="copyUrl(item.url)" title="Bağlantıyı Kopyala">
                📋 Kopyala
              </button>
            </div>
          </div>

          <div class="media-info">
            <div class="media-name" [title]="item.name">{{ item.name }}</div>
            <div class="media-meta">
              <span class="file-tag">IMAGE</span>
              <span class="meta-dot">•</span>
              <span class="url-text">{{ item.url }}</span>
            </div>

            <div class="card-actions">
              <button class="btn btn-secondary btn-sm" (click)="copyUrl(item.url)">
                📋 URL
              </button>
              <button
                class="btn btn-danger btn-sm"
                (click)="onDelete(item)"
                [disabled]="deletingId === item.id"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .section-desc {
        color: var(--text-muted);
        font-size: 14px;
        margin-top: 4px;
      }
      .upload-btn {
        cursor: pointer;
      }
      .dropzone-card {
        padding: 36px 20px;
        text-align: center;
        border: 2px dashed rgba(99, 102, 241, 0.3);
        background: rgba(18, 24, 38, 0.4);
        margin-bottom: 32px;
        transition: var(--transition-normal);
      }
      .dropzone-card.dragging,
      .dropzone-card:hover {
        border-color: var(--primary);
        background: rgba(99, 102, 241, 0.08);
      }
      .upload-icon-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(99, 102, 241, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        border: 1px solid rgba(99, 102, 241, 0.3);
      }
      .upload-icon {
        font-size: 28px;
      }
      .dropzone-content h3 {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 6px;
      }
      .dropzone-content p {
        color: var(--text-muted);
        font-size: 14px;
        margin-bottom: 8px;
      }
      .file-hint {
        font-size: 12px;
        color: var(--accent-cyan);
        font-weight: 600;
      }
      .uploading-bar {
        background: rgba(99, 102, 241, 0.2);
        border: 1px solid var(--primary);
        color: #ffffff;
        padding: 14px 20px;
        border-radius: var(--radius-md);
        margin-bottom: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 600;
      }
      .spinner-sm {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      .loading-state {
        text-align: center;
        padding: 80px 0;
        color: var(--text-muted);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      .empty-card {
        text-align: center;
        padding: 60px 20px;
      }
      .empty-icon-box {
        font-size: 48px;
        margin-bottom: 14px;
      }
      .empty-card h3 {
        font-size: 20px;
        font-weight: 800;
        margin-bottom: 6px;
      }

      .media-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 24px;
      }
      .media-card {
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .image-box {
        position: relative;
        width: 100%;
        height: 170px;
        background: #0a0f1d;
        overflow: hidden;
      }
      .image-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }
      .media-card:hover .image-box img {
        transform: scale(1.08);
      }
      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: var(--transition-fast);
      }
      .media-card:hover .image-overlay {
        opacity: 1;
      }
      .overlay-btn {
        padding: 8px 16px;
        background: var(--primary);
        color: #ffffff;
        border-radius: 8px;
        font-weight: 700;
        font-size: 13px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      }
      .media-info {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .media-name {
        font-weight: 700;
        font-size: 14px;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .media-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--text-muted);
      }
      .file-tag {
        font-weight: 800;
        color: var(--accent-cyan);
        background: rgba(6, 182, 212, 0.12);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .url-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: 'Fira Code', monospace;
      }
      .card-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }
      .btn-sm { flex: 1; padding: 7px 12px; font-size: 12px; }
    `,
  ],
})
export class MediaLibraryComponent implements OnInit {
  private mediaService = inject(MediaService);
  private toastService = inject(ToastService);

  mediaList: MediaItem[] = [];
  isLoading = true;
  isUploading = false;
  isDragging = false;
  deletingId: number | string | null = null;

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia(): void {
    this.isLoading = true;
    this.mediaService.getMediaList().subscribe({
      next: (list) => {
        this.mediaList = list;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Medya listesi yüklenemedi.');
        this.isLoading = false;
      },
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.uploadFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.uploadFile(input.files[0]);
  }

  uploadFile(file: File): void {
    this.isUploading = true;
    this.mediaService.uploadMedia(file).subscribe({
      next: (newItem) => {
        this.isUploading = false;
        this.toastService.success('Görsel başarıyla yüklendi.');
        this.mediaList.unshift(newItem);
      },
      error: (err) => {
        this.isUploading = false;
        this.toastService.error(err.message || 'Yükleme başarısız.');
      },
    });
  }

  copyUrl(url: string): void {
    navigator.clipboard.writeText(url).then(
      () => this.toastService.success('Görsel adresi panoya kopyalandı!'),
      () => this.toastService.error('Bağlantı kopyalanamadı.')
    );
  }

  onDelete(item: MediaItem): void {
    if (!confirm(`"${item.name}" medyasını silmek istediğinize emin misiniz?`)) return;

    this.deletingId = item.id;
    this.mediaService.deleteMedia(item.id).subscribe({
      next: () => {
        this.toastService.success(`"${item.name}" silindi.`);
        this.mediaList = this.mediaList.filter((m) => m.id !== item.id);
        this.deletingId = null;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Medya silinemedi.');
        this.deletingId = null;
      },
    });
  }
}
