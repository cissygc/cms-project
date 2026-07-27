import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { ToastService } from '../../services/toast.service';
import { MediaItem } from '../../models/media.model';

@Component({
  selector: 'app-media-picker-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Görsel Seç</h3>
          <button class="close-btn" (click)="close()">✕</button>
        </div>

        <div class="modal-body">
          <div class="upload-section">
            <label class="btn btn-primary upload-btn">
              <span>+ Yeni Görsel Yükle</span>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" hidden />
            </label>
            <span *ngIf="isUploading" class="uploading-text">Yükleniyor...</span>
          </div>

          <div *ngIf="isLoading" class="loading-state">Medya dosyaları yükleniyor...</div>

          <div *ngIf="!isLoading && mediaList.length === 0" class="empty-state">
            Henüz yüklenmiş görsel bulunmuyor.
          </div>

          <div *ngIf="!isLoading && mediaList.length > 0" class="media-grid">
            <div
              *ngFor="let item of mediaList"
              class="media-card"
              (click)="selectImage(item.url)"
            >
              <img [src]="item.url" [alt]="item.name" loading="lazy" />
              <div class="media-name">{{ item.name }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">İptal</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(6px);
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .modal-card {
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        width: 100%;
        max-width: 720px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }
      .modal-header {
        padding: 18px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
      }
      .close-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 18px;
        cursor: pointer;
      }
      .close-btn:hover {
        color: #ffffff;
      }
      .modal-body {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
      }
      .upload-section {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      .upload-btn {
        cursor: pointer;
      }
      .uploading-text {
        font-size: 13px;
        color: var(--primary);
      }
      .media-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 14px;
      }
      .media-card {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s;
      }
      .media-card:hover {
        border-color: var(--primary);
        transform: translateY(-2px);
      }
      .media-card img {
        width: 100%;
        height: 100px;
        object-fit: cover;
        display: block;
      }
      .media-name {
        padding: 6px 8px;
        font-size: 11px;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .loading-state,
      .empty-state {
        text-align: center;
        padding: 40px 0;
        color: var(--text-muted);
        font-size: 14px;
      }
      .modal-footer {
        padding: 14px 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: flex-end;
      }
    `,
  ],
})
export class MediaPickerModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() imageSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  private mediaService = inject(MediaService);
  private toastService = inject(ToastService);

  mediaList: MediaItem[] = [];
  isLoading = false;
  isUploading = false;

  ngOnInit(): void {
    if (this.isOpen) {
      this.loadMedia();
    }
  }

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
        this.selectImage(item.url);
      },
      error: (err) => {
        this.isUploading = false;
        this.toastService.error(err.message || 'Görsel yüklenemedi.');
      },
    });
  }

  selectImage(url: string): void {
    this.imageSelected.emit(url);
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
