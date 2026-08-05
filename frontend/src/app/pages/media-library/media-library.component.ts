import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { MediaItem } from '../../models/media.model';

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Medya Kütüphanesi</h1>
          <p class="section-desc">
            Görsel yükleyin, kırpın ve içeriklerinizde kullanın.
          </p>
        </div>

        <div class="header-actions">
          <!-- Gizli file input — hem buton hem dropzone bunu tetikler -->
          <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)" />
        </div>
      </div>

      <!-- Drag & Drop / Click / Paste Zone -->
      <div
        class="dropzone-card"
        [class.dragging]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <div class="dropzone-icon">☁️</div>
        <p class="dropzone-title">Görseli sürükleyin, yapıştırın veya buraya tıklayın</p>
        <p class="dropzone-sub">JPG, PNG, WEBP, GIF, SVG · Maks. 10 MB</p>
      </div>

      <!-- Upload bar -->
      <div *ngIf="isUploading" class="status-bar">
        <div class="spinner-sm"></div>
        <span>Görsel yükleniyor...</span>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Yükleniyor...</span>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading && mediaList.length === 0" class="empty-state">
        <div class="empty-icon">🖼️</div>
        <h3>Henüz yüklenmiş medya yok</h3>
        <p>İlk görselinizi yükleyin</p>
      </div>

      <!-- Media Grid -->
      <div *ngIf="!isLoading && mediaList.length > 0" class="media-grid">
        <div *ngFor="let item of mediaList" class="media-card">
          <div class="image-box">
            <img [src]="item.url" [alt]="item.name" loading="lazy" />
            <div class="image-overlay">
              <button class="overlay-btn" (click)="copyUrl(item.url)">📋 URL Kopyala</button>
              <button class="overlay-btn crop-btn" (click)="openCrop(item)">✂️ Kırp</button>
            </div>
          </div>

          <div class="media-info">
            <div class="media-name" [title]="item.name">{{ item.name }}</div>
            <!-- Admin ise her zaman kim yüklediğini göster -->
            <div *ngIf="isAdmin && (item.uploadedByFullName || item.uploadedByUsername)" class="uploader-tag">
              👤 {{ item.uploadedByFullName || item.uploadedByUsername }}
            </div>
            <div class="card-actions">
              <button class="btn btn-secondary btn-sm" (click)="copyUrl(item.url)">📋 URL</button>
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

    <!-- ─── CROP MODAL ─────────────────────────────────────────────── -->
    <div *ngIf="cropModalOpen" class="modal-backdrop" (click)="closeCrop()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Görseli Kırp</h2>
          <button class="modal-close" (click)="closeCrop()">✕</button>
        </div>

        <p class="crop-help">
          Kırmızı kutuyu sürükleyerek taşıyın, köşelerinden boyutlandırın.
        </p>

        <!--
          crop-wrapper: görsel, ekrana (max-width/max-height ile) sığacak
          şekilde oranı korunarak küçültülür - hiçbir kısmı kesilmez.
          Seçim kutusunun left/top/width/height değerleri
          scaledSel'den geliyor (orijinal piksel / scale).
        -->
        <div class="crop-wrapper" #cropWrapper>
          <canvas #cropCanvas class="crop-canvas"></canvas>

          <div
            class="crop-selection"
            [style.left.px]="scaledSel.x"
            [style.top.px]="scaledSel.y"
            [style.width.px]="scaledSel.w"
            [style.height.px]="scaledSel.h"
            (mousedown)="startDrag($event, 'move')"
          >
            <div class="handle nw" (mousedown)="startDrag($event, 'nw')"></div>
            <div class="handle ne" (mousedown)="startDrag($event, 'ne')"></div>
            <div class="handle sw" (mousedown)="startDrag($event, 'sw')"></div>
            <div class="handle se" (mousedown)="startDrag($event, 'se')"></div>
          </div>
        </div>

        <p class="crop-size-label">
          Seçim: {{ sel.w | number:'1.0-0' }} × {{ sel.h | number:'1.0-0' }} px
        </p>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeCrop()">İptal</button>
          <button class="btn btn-primary" (click)="applyCrop()" [disabled]="isCropping">
            <span *ngIf="!isCropping">✂️ Kırp ve Yükle</span>
            <span *ngIf="isCropping">Yükleniyor...</span>
          </button>
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
      .paste-hint {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: var(--revlo-purple-main);
        font-weight: 600;
      }

      /* ── Header actions ── */
      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-shrink: 0;
      }

      /* ── Dropzone ── */
      .dropzone-card {
        border: 2px dashed var(--border-purple);
        border-radius: var(--radius-card);
        padding: 40px 20px;
        text-align: center;
        background: var(--revlo-purple-soft);
        margin-bottom: 28px;
        transition: all 0.2s;
        cursor: pointer;
      }
      .dropzone-card.dragging,
      .dropzone-card:hover {
        border-color: var(--revlo-purple-main);
        background: #ede0f8;
      }
      .dropzone-icon { font-size: 36px; margin-bottom: 12px; }
      .dropzone-title { font-weight: 700; font-size: 16px; color: var(--text-title); margin-bottom: 4px; }
      .dropzone-sub { font-size: 12px; color: var(--text-muted); }

      /* ── Status bar ── */
      .status-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        border-radius: var(--radius-md);
        margin-bottom: 24px;
        font-size: 14px;
        font-weight: 600;
        background: #f1e9f8;
        border: 1px solid var(--border-purple);
        color: var(--revlo-purple-main);
      }
      .spinner-sm {
        width: 16px; height: 16px;
        border: 2px solid rgba(88,32,129,0.3);
        border-top-color: var(--revlo-purple-main);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        flex-shrink: 0;
      }

      /* ── Loading / Empty ── */
      .loading-state, .empty-state {
        text-align: center;
        padding: 80px 0;
        color: var(--text-muted);
      }
      .spinner {
        width: 36px; height: 36px;
        border: 3px solid #e8e3f2;
        border-top-color: var(--revlo-purple-main);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 12px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .empty-icon { font-size: 48px; margin-bottom: 12px; }
      .empty-state h3 { font-size: 18px; font-weight: 700; color: var(--text-title); }

      /* ── Media Grid ── */
      .media-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }
      .media-card {
        background: #fff;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-card);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: var(--shadow-card);
        transition: var(--transition-smooth);
      }
      .media-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-hover);
        border-color: var(--border-purple);
      }
      .image-box {
        position: relative;
        height: 160px;
        background: #f6f5f9;
        overflow: hidden;
      }
      .image-box img {
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }
      .media-card:hover .image-box img { transform: scale(1.05); }
      .image-overlay {
        position: absolute;
        inset: 0;
        background: rgba(88, 32, 129, 0.55);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .media-card:hover .image-overlay { opacity: 1; }
      .overlay-btn {
        padding: 7px 16px;
        background: #fff;
        color: var(--revlo-purple-main);
        border-radius: var(--radius-sm);
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        width: 140px;
        text-align: center;
      }
      .crop-btn { background: var(--revlo-purple-main); color: #fff; }

      .media-info { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
      .media-name {
        font-weight: 700; font-size: 13px;
        color: var(--text-title);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .uploader-tag {
        font-size: 11px;
        color: var(--revlo-purple-main);
        font-weight: 600;
        background: var(--revlo-purple-soft);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        width: fit-content;
      }
      .card-actions { display: flex; gap: 8px; }
      .btn-sm { flex: 1; padding: 7px 10px; font-size: 12px; }

      /* ── Crop Modal ── */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
      }
      .modal-box {
        background: #fff;
        border-radius: var(--radius-card);
        /* Sabit genişlik yok - içerideki (kırpılacak) görselin oranına göre
           kendi kendine boyutlanır. max-width/max-height sadece ekrandan
           taşmasını engeller, taşarsa overflow-y:auto devreye girer. */
        width: auto;
        max-width: 92vw;
        max-height: 92vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
      }
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px 16px;
        border-bottom: 1px solid var(--border-subtle);
        flex-shrink: 0;
      }
      .modal-title { font-size: 18px; font-weight: 800; color: var(--text-title); }
      .modal-close {
        font-size: 20px; color: var(--text-muted);
        cursor: pointer; padding: 4px 8px;
      }
      .crop-help {
        padding: 12px 24px 0;
        font-size: 13px;
        color: var(--text-muted);
      }

      /*
        crop-wrapper: hem yatay hem dikey görselleri (uzun/dar veya geniş/kısa)
        her zaman TAMAMEN görünür şekilde sığdırır. max-width + max-height
        birlikte width:auto/height:auto ile kullanılınca tarayıcı görseli
        her iki eksende de sığacak şekilde ORANI KORUYARAK küçültür - bu
        yüzden görselin alt kısmı asla kesilmez, scroll'a gerek kalmaz.
      */
      .crop-wrapper {
        position: relative;
        display: inline-flex;
        margin: 14px 24px 0;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        background: #111;
        overflow: hidden;
        cursor: crosshair;
        line-height: 0;
        max-width: calc(92vw - 48px);
        max-height: 65vh;
      }
      .crop-canvas {
        display: block;
        width: auto;
        height: auto;
        max-width: calc(92vw - 48px);
        max-height: 65vh;
        user-select: none;
        pointer-events: none;
      }

      /* Seçim kutusu */
      .crop-selection {
        position: absolute;
        border: 2px solid #dc2626;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.45);
        cursor: move;
        user-select: none;
        box-sizing: border-box;
      }
      .handle {
        position: absolute;
        width: 12px; height: 12px;
        background: #fff;
        border: 2px solid #dc2626;
        border-radius: 2px;
      }
      .handle.nw { top: -6px; left: -6px; cursor: nw-resize; }
      .handle.ne { top: -6px; right: -6px; cursor: ne-resize; }
      .handle.sw { bottom: -6px; left: -6px; cursor: sw-resize; }
      .handle.se { bottom: -6px; right: -6px; cursor: se-resize; }

      .crop-size-label {
        padding: 8px 24px 0;
        font-size: 12px; color: var(--text-muted); font-weight: 600;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 20px 24px;
        border-top: 1px solid var(--border-subtle);
        margin-top: 16px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class MediaLibraryComponent implements OnInit, OnDestroy, AfterViewInit {
  private mediaService = inject(MediaService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  @ViewChild('cropCanvas') cropCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropWrapper') cropWrapperRef!: ElementRef<HTMLDivElement>;

  mediaList: MediaItem[] = [];
  isLoading = true;
  isUploading = false;
  isDragging = false;
  deletingId: number | string | null = null;

  // Crop state
  cropModalOpen = false;
  isCropping = false;
  cropItem: MediaItem | null = null;
  cropImg = new Image();
  // sel: orijinal görsel piksel koordinatları
  sel = { x: 0, y: 0, w: 0, h: 0 };
  // scaledSel: CSS px (canvas'ın ekrandaki görünen boyutuna göre)
  scaledSel = { x: 0, y: 0, w: 0, h: 0 };

  private dragMode: 'move' | 'nw' | 'ne' | 'sw' | 'se' | null = null;
  private dragStart = { clientX: 0, clientY: 0, sx: 0, sy: 0, sw: 0, sh: 0 };
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);

  // Paste handler — sadece window'a bir kez bağlanır.
  // Template'de (paste) event YOK — çift tetiklenmeyi önlemek için.
  private pasteHandler = (e: ClipboardEvent) => this.handlePaste(e);

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadMedia();
    window.addEventListener('paste', this.pasteHandler);
  }

  ngAfterViewInit(): void {
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mouseup', this.boundMouseUp);
  }

  ngOnDestroy(): void {
    window.removeEventListener('paste', this.pasteHandler);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mouseup', this.boundMouseUp);
  }

  // ── Medya listesi ─────────────────────────────────────────────────

  loadMedia(): void {
    this.isLoading = true;
    // Admin ise her zaman tüm kullanıcıların medyasını iste (isAdmin=true).
    // Editör ise backend zaten sadece kendi medyasını döner.
    this.mediaService.getMediaList(this.isAdmin).subscribe({
      next: (list) => { this.mediaList = list; this.isLoading = false; },
      error: (err) => {
        this.toastService.error(err.message || 'Medya listesi yüklenemedi.');
        this.isLoading = false;
      },
    });
  }

  // ── Drag-drop ─────────────────────────────────────────────────────

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragging = true; }
  onDragLeave(e: DragEvent): void { e.preventDefault(); this.isDragging = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) this.uploadFile(file);
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadFile(file);
    input.value = ''; // sıfırla: aynı dosyayı tekrar seçebilmek için
  }

  // ── Paste-to-upload ───────────────────────────────────────────────
  // Bu metot SADECE window.addEventListener('paste') tarafından çağrılır.
  // Template'de (paste) bağlantısı YOK — aksi hâlde her Ctrl+V iki kez
  // tetiklenirdi (window + Angular event bubbling).
  private handlePaste(e: ClipboardEvent): void {
    // Crop modal açıkken yapıştırmayı yoksay
    if (this.cropModalOpen) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const raw = item.getAsFile();
        if (!raw) break;
        const ext = item.type.split('/')[1] || 'png';
        const file = new File([raw], `pasted-image.${ext}`, { type: item.type });
        this.uploadFile(file);
        break; // sadece ilk görsel öğesini al
      }
    }
  }

  uploadFile(file: File): void {
    this.isUploading = true;
    this.mediaService.uploadMedia(file).subscribe({
      next: (item) => {
        this.isUploading = false;
        this.toastService.success('Görsel yüklendi.');
        this.mediaList.unshift(item);
      },
      error: (err) => {
        this.isUploading = false;
        this.toastService.error(err.message || 'Yükleme başarısız.');
      },
    });
  }

  copyUrl(url: string): void {
    navigator.clipboard.writeText(url).then(
      () => this.toastService.success('URL panoya kopyalandı!'),
      () => this.toastService.error('Kopyalanamadı.')
    );
  }

  onDelete(item: MediaItem): void {
    if (!confirm(`"${item.name}" medyasını silmek istediğinize emin misiniz?`)) return;
    this.deletingId = item.id;
    this.mediaService.deleteMedia(item.id, this.isAdmin).subscribe({
      next: () => {
        this.toastService.success(`"${item.name}" silindi.`);
        this.mediaList = this.mediaList.filter((m) => m.id !== item.id);
        this.deletingId = null;
      },
      error: (err) => {
        this.toastService.error(err.message || 'Silinemedi.');
        this.deletingId = null;
      },
    });
  }

  // ── Crop ──────────────────────────────────────────────────────────

  openCrop(item: MediaItem): void {
    this.cropItem = item;
    this.cropModalOpen = true;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.cropImg = img;
      // Modal DOM'a render edilsin diye bir tick bekle, sonra canvas'ı hazırla
      setTimeout(() => this.initCropCanvas(), 60);
    };
    img.src = item.url;
  }

  private initCropCanvas(): void {
    const canvas = this.cropCanvasRef?.nativeElement;
    if (!canvas) return;

    const img = this.cropImg;
    // Canvas'ı görselin gerçek piksel boyutuna ayarla
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Başlangıç seçimi: ortaya hizalanmış, görselin %70'i
    const sw = Math.round(img.naturalWidth * 0.7);
    const sh = Math.round(img.naturalHeight * 0.7);
    this.sel = {
      x: Math.round((img.naturalWidth - sw) / 2),
      y: Math.round((img.naturalHeight - sh) / 2),
      w: sw,
      h: sh,
    };
    this.updateScaledSel();
  }

  closeCrop(): void {
    this.cropModalOpen = false;
    this.cropItem = null;
    this.dragMode = null;
  }

  // scale = orijinal genişlik / ekranda görünen genişlik
  // Örnek: 4000px orijinal, 650px görünen → scale = 6.15
  // Seçim kutusu CSS px = orijinal px / scale
  private getScale(): number {
    const canvas = this.cropCanvasRef?.nativeElement;
    if (!canvas || canvas.width === 0) return 1;
    return canvas.width / canvas.getBoundingClientRect().width;
  }

  private updateScaledSel(): void {
    const scale = this.getScale();
    this.scaledSel = {
      x: this.sel.x / scale,
      y: this.sel.y / scale,
      w: this.sel.w / scale,
      h: this.sel.h / scale,
    };
  }

  startDrag(e: MouseEvent, mode: 'move' | 'nw' | 'ne' | 'sw' | 'se'): void {
    e.preventDefault();
    e.stopPropagation();
    this.dragMode = mode;
    this.dragStart = {
      clientX: e.clientX,
      clientY: e.clientY,
      sx: this.sel.x,
      sy: this.sel.y,
      sw: this.sel.w,
      sh: this.sel.h,
    };
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.dragMode) return;
    const canvas = this.cropCanvasRef?.nativeElement;
    if (!canvas) return;

    const scale = this.getScale();
    // Fare hareketi CSS px → orijinal piksel
    const dx = (e.clientX - this.dragStart.clientX) * scale;
    const dy = (e.clientY - this.dragStart.clientY) * scale;
    const maxW = canvas.width;
    const maxH = canvas.height;
    const MIN = 30; // minimum seçim (orijinal px)
    const { sx, sy, sw, sh } = this.dragStart;
    let next = { ...this.sel };

    if (this.dragMode === 'move') {
      next = {
        x: Math.max(0, Math.min(sx + dx, maxW - sw)),
        y: Math.max(0, Math.min(sy + dy, maxH - sh)),
        w: sw, h: sh,
      };
    } else if (this.dragMode === 'se') {
      next = { x: sx, y: sy, w: Math.max(MIN, sw + dx), h: Math.max(MIN, sh + dy) };
    } else if (this.dragMode === 'sw') {
      const nw = Math.max(MIN, sw - dx);
      next = { x: sx + (sw - nw), y: sy, w: nw, h: Math.max(MIN, sh + dy) };
    } else if (this.dragMode === 'ne') {
      const nh = Math.max(MIN, sh - dy);
      next = { x: sx, y: sy + (sh - nh), w: Math.max(MIN, sw + dx), h: nh };
    } else if (this.dragMode === 'nw') {
      const nw = Math.max(MIN, sw - dx);
      const nh = Math.max(MIN, sh - dy);
      next = { x: sx + (sw - nw), y: sy + (sh - nh), w: nw, h: nh };
    }

    // Sınır: seçim canvas dışına çıkmasın
    next.x = Math.max(0, next.x);
    next.y = Math.max(0, next.y);
    if (next.x + next.w > maxW) next.w = maxW - next.x;
    if (next.y + next.h > maxH) next.h = maxH - next.y;

    this.sel = next;
    this.updateScaledSel();
  }

  onMouseUp(): void {
    this.dragMode = null;
  }

  applyCrop(): void {
    const canvas = this.cropCanvasRef?.nativeElement;
    if (!canvas || !this.cropItem) return;
    this.isCropping = true;

    const out = document.createElement('canvas');
    const w = Math.round(this.sel.w);
    const h = Math.round(this.sel.h);
    out.width = w;
    out.height = h;
    const ctx = out.getContext('2d')!;
    // cropImg'den seçili bölgeyi out canvas'a kopyala
    ctx.drawImage(this.cropImg, Math.round(this.sel.x), Math.round(this.sel.y), w, h, 0, 0, w, h);

    out.toBlob(
      (blob) => {
        if (!blob) { this.toastService.error('Kırpma başarısız.'); this.isCropping = false; return; }
        const base = this.cropItem!.name.replace(/\.[^.]+$/, '');
        const file = new File([blob], `${base}-cropped.jpg`, { type: 'image/jpeg' });
        this.mediaService.uploadMedia(file).subscribe({
          next: (item) => {
            this.toastService.success('Kırpılan görsel yüklendi.');
            this.mediaList.unshift(item);
            this.isCropping = false;
            this.closeCrop();
          },
          error: (err) => {
            this.toastService.error(err.message || 'Yükleme başarısız.');
            this.isCropping = false;
          },
        });
      },
      'image/jpeg', 0.92
    );
  }
}