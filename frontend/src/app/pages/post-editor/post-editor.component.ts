import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../services/toast.service';
import { MediaPickerModalComponent } from '../../components/media-picker-modal/media-picker-modal.component';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MediaPickerModalComponent],
  template: `
    <div class="container">
      <!-- Top Page Navigation -->
      <div class="page-header">
        <div>
          <span class="header-badge">
            {{ isEditMode ? '✏️ İÇERİK DÜZENLEME' : '✨ YENİ İÇERİK OLUŞTURMA' }}
          </span>
          <h1 class="page-title">{{ isEditMode ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle' }}</h1>
          <p class="section-sub">İçeriğinizi hazırlayın, kapak fotoğrafını ekleyin ve yayınlayın</p>
        </div>
        <a routerLink="/dashboard" class="btn btn-secondary">← Ana Sayfaya Dön</a>
      </div>

      <form (ngSubmit)="onSubmit()" #postForm="ngForm">
        <div class="editor-layout">
          <!-- Main Content Section -->
          <div class="glass-card editor-main-card">
            <!-- Title Input Field -->
            <div class="form-group">
              <label class="form-label" for="title">Yazı Başlığı</label>
              <input
                type="text"
                id="title"
                name="title"
                class="form-input title-input"
                [(ngModel)]="title"
                required
                placeholder="Örn: Oteller İçin Yapay Zeka Dönemi ve Dijital Dönüşüm"
              />
            </div>

            <!-- Rich Text Editor Section -->
            <div class="form-group editor-group">
              <label class="form-label">Yazı İçeriği (Post)</label>

              <div class="editor-header-bar">
                <div class="editor-tools">
                  <button
                    type="button"
                    class="tool-btn"
                    (click)="insertText('**', '**')"
                    title="Kalın"
                  >
                    <b>B</b>
                  </button>
                  <button
                    type="button"
                    class="tool-btn"
                    (click)="insertText('*', '*')"
                    title="İtalik"
                  >
                    <i>I</i>
                  </button>
                  <button
                    type="button"
                    class="tool-btn"
                    (click)="insertText('# ', '')"
                    title="Başlık H1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    class="tool-btn"
                    (click)="insertText('## ', '')"
                    title="Başlık H2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    class="tool-btn"
                    (click)="insertText('> ', '')"
                    title="Alıntı"
                  >
                    “ ”
                  </button>
                  <button
                    type="button"
                    class="tool-btn"
                    (click)="insertCodeBlock()"
                    title="Kod Bloğu"
                  >
                    &lt;/&gt;
                  </button>
                </div>

                <div class="view-tab-switch">
                  <button
                    type="button"
                    class="tab-switch-btn"
                    [class.active]="activeTab === 'edit'"
                    (click)="activeTab = 'edit'"
                  >
                    📝 Metin Editörü
                  </button>
                  <button
                    type="button"
                    class="tab-switch-btn"
                    [class.active]="activeTab === 'preview'"
                    (click)="activeTab = 'preview'"
                  >
                    👁️ Canlı Önizleme
                  </button>
                </div>
              </div>

              <!-- Content Textarea -->
              <textarea
                *ngIf="activeTab === 'edit'"
                id="contentEditor"
                name="content"
                class="form-textarea main-textarea"
                [(ngModel)]="content"
                required
                placeholder="Yazınızın detaylı içeriğini buraya yazabilirsiniz..."
                rows="14"
              ></textarea>

              <!-- Fixed Width & Height Responsive Live Preview Container -->
              <div *ngIf="activeTab === 'preview'" class="preview-container">
                <div class="preview-card-header">
                  <h2 class="preview-heading">{{ title || 'Başlık Henüz Girilmedi' }}</h2>
                </div>
                <div *ngIf="image" class="preview-cover-wrapper">
                  <img [src]="image" alt="Kapak Önizleme" class="preview-cover-img" />
                </div>
                <div class="preview-rendered-body" [innerHTML]="formattedContent"></div>
              </div>

              <div class="editor-info-bar">
                <span>Karakter Sayısı: <strong>{{ content.length }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Right Column: Cover Image & Actions -->
          <div class="editor-sidebar">
            <!-- Cover Photo Card -->
            <div class="glass-card sidebar-widget">
              <h3 class="widget-title">🖼️ Kapak Görseli</h3>

              <div class="cover-widget-body">
                <div *ngIf="image" class="cover-preview-box">
                  <img [src]="image" alt="Kapak Görseli" class="cover-image-display" />
                  <div class="cover-actions-row">
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      (click)="isMediaPickerOpen = true"
                    >
                      Değiştir
                    </button>
                    <button
                      type="button"
                      class="btn btn-danger btn-sm"
                      (click)="image = ''"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>

                <div *ngIf="!image" class="cover-dropzone" (click)="isMediaPickerOpen = true">
                  <div class="dropzone-icon">📸</div>
                  <span class="dropzone-title">Kapak Görseli Ekleyin</span>
                  <span class="dropzone-desc">Medya kütüphanesinden görsel seçmek için tıklayın</span>
                  <button type="button" class="btn btn-primary btn-sm dropzone-btn">
                    ✨ Medya Kütüphanesi
                  </button>
                </div>
              </div>
            </div>

            <!-- Save & Publish Card -->
            <div class="glass-card sidebar-widget">
              <h3 class="widget-title">🚀 Yayınla ve Paylaş</h3>
              <p class="widget-note">
                Yazı kaydedildiğinde anında yayınlanır ve Ana Sayfadaki içerik akışına eklenir.
              </p>

              <div class="submit-actions">
                <button
                  type="submit"
                  class="btn btn-primary btn-block btn-lg"
                  [disabled]="isSaving || !title || !content"
                >
                  <span *ngIf="!isSaving">{{ isEditMode ? '💾 Değişiklikleri Kaydet' : '✨ Yazıyı Yayınla ve Ana Sayfaya Ekle' }}</span>
                  <span *ngIf="isSaving">Yayınlanıyor...</span>
                </button>

                <a routerLink="/dashboard" class="btn btn-secondary btn-block">İptal</a>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Media Picker Modal -->
    <app-media-picker-modal
      [isOpen]="isMediaPickerOpen"
      (imageSelected)="image = $event"
      (closed)="isMediaPickerOpen = false"
    ></app-media-picker-modal>
  `,
  styles: [
    `
      .header-badge {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #ffffff !important;
        background: linear-gradient(135deg, #2a1b4e, #7c3aed);
        border: 1px solid rgba(124, 58, 237, 0.3);
        padding: 5px 14px;
        border-radius: var(--radius-pill);
        margin-bottom: 8px;
        display: inline-block;
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
      }
      .section-sub {
        color: #4b5563 !important;
        font-size: 14px;
        margin-top: 4px;
      }
      .editor-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 28px;
      }
      .editor-main-card {
        padding: 32px;
        background: #ffffff;
      }
      .form-group {
        width: 100%;
        margin-bottom: 24px;
      }
      .form-label {
        color: #111827 !important;
        font-weight: 800;
      }

      /* Title Input */
      .title-input {
        width: 100%;
        font-size: 18px;
        font-weight: 700;
        padding: 14px 18px;
        background: #f8f6fc !important;
        border: 1px solid #e8e3f2;
        color: #111827 !important;
      }
      .title-input::placeholder {
        color: #9ca3af !important;
        font-weight: 400;
      }
      .title-input:focus {
        background: #ffffff !important;
        border-color: #7c3aed;
        box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
      }

      .editor-group {
        width: 100%;
      }
      .editor-header-bar {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f0ebf8;
        padding: 10px 16px;
        border-top-left-radius: var(--radius-md);
        border-top-right-radius: var(--radius-md);
        border: 1px solid #e8e3f2;
        border-bottom: none;
      }
      .editor-tools {
        display: flex;
        gap: 6px;
      }
      .tool-btn {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: #ffffff;
        border: 1px solid #e8e3f2;
        color: #111827;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-smooth);
      }
      .tool-btn:hover {
        background: #7c3aed;
        color: #ffffff;
        border-color: #7c3aed;
      }
      .view-tab-switch {
        display: flex;
        gap: 4px;
        background: #e8e3f2;
        padding: 3px;
        border-radius: 10px;
      }
      .tab-switch-btn {
        padding: 5px 14px;
        font-size: 12px;
        font-weight: 700;
        color: #4b5563;
        border-radius: 8px;
        background: transparent;
      }
      .tab-switch-btn.active {
        color: #ffffff;
        background: #7c3aed;
      }

      /* Textarea */
      .main-textarea {
        width: 100% !important;
        box-sizing: border-box !important;
        display: block !important;
        border-top-left-radius: 0 !important;
        border-top-right-radius: 0 !important;
        border-bottom-left-radius: var(--radius-md) !important;
        border-bottom-right-radius: var(--radius-md) !important;
        font-size: 15px !important;
        line-height: 1.7 !important;
        min-height: 340px !important;
        padding: 20px !important;
        background: #ffffff !important;
        border: 1px solid #e8e3f2 !important;
        border-top: none !important;
        color: #111827 !important;
        cursor: text !important;
        pointer-events: auto !important;
        user-select: text !important;
        font-weight: 500 !important;
      }
      .main-textarea:focus {
        border-color: #7c3aed !important;
        box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12) !important;
        outline: none !important;
      }
      .main-textarea::placeholder {
        color: #9ca3af !important;
        font-weight: 400 !important;
      }

      /* Live Preview Fixes: Fixed Max Width, Responsive Image, Word Break */
      .preview-container {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        background: #ffffff;
        border: 1px solid #e8e3f2;
        border-top: none;
        border-bottom-left-radius: var(--radius-md);
        border-bottom-right-radius: var(--radius-md);
        padding: 28px;
        min-height: 340px;
        overflow-x: hidden;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      .preview-card-header {
        margin-bottom: 18px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f1f5f9;
      }
      .preview-heading {
        font-size: 24px;
        font-weight: 800;
        color: #111827;
        margin-bottom: 4px;
        word-break: break-word;
      }
      .preview-cover-wrapper {
        width: 100%;
        max-height: 320px;
        border-radius: var(--radius-md);
        overflow: hidden;
        margin-bottom: 20px;
        background: #f1f5f9;
      }
      .preview-cover-img {
        width: 100%;
        max-height: 320px;
        object-fit: cover;
        object-position: center;
        display: block;
        border-radius: var(--radius-md);
      }
      .preview-rendered-body {
        font-size: 15px;
        line-height: 1.8;
        color: #1f2937;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      .editor-info-bar {
        display: flex;
        justify-content: flex-end;
        font-size: 12px;
        color: #6b7280;
        margin-top: 10px;
        padding: 0 4px;
      }
      .editor-sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .sidebar-widget {
        padding: 24px;
        background: #ffffff;
      }
      .widget-title {
        font-size: 16px;
        font-weight: 800;
        color: #111827;
        margin-bottom: 14px;
      }
      .cover-widget-body {
        width: 100%;
      }
      .cover-preview-box {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .cover-image-display {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: var(--radius-md);
        border: 1px solid #e8e3f2;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
      }
      .cover-actions-row {
        display: flex;
        gap: 8px;
      }
      .cover-actions-row .btn { flex: 1; }

      .cover-dropzone {
        padding: 32px 16px;
        border: 2px dashed rgba(124, 58, 237, 0.3);
        border-radius: var(--radius-md);
        text-align: center;
        background: #f8f6fc;
        cursor: pointer;
        transition: var(--transition-smooth);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .cover-dropzone:hover {
        background: #f0ebf8;
        border-color: #7c3aed;
      }
      .dropzone-icon { font-size: 36px; margin-bottom: 8px; }
      .dropzone-title {
        font-weight: 800;
        font-size: 14px;
        color: #111827;
        margin-bottom: 4px;
      }
      .dropzone-desc {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 14px;
        line-height: 1.4;
      }
      .dropzone-btn { margin-top: 4px; }
      .widget-note {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 18px;
        line-height: 1.5;
      }
      .submit-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .btn-block { width: 100%; }
      .btn-lg { padding: 14px; font-size: 14px; }
      .btn-sm { padding: 8px 14px; font-size: 13px; }
    `,
  ],
})
export class PostEditorComponent implements OnInit {
  private postService = inject(PostService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  title = '';
  content = '';
  image = '';
  activeTab: 'edit' | 'preview' = 'edit';

  isEditMode = false;
  editingSlug = '';
  isSaving = false;
  isMediaPickerOpen = false;

  ngOnInit(): void {
    const slugParam = this.route.snapshot.paramMap.get('slug');
    if (slugParam) {
      this.isEditMode = true;
      this.editingSlug = slugParam;
      this.loadPost(slugParam);
    }
  }

  loadPost(slug: string): void {
    this.postService.getPost(slug).subscribe({
      next: (post) => {
        this.title = post.title;
        this.content = post.content || '';
        this.image = post.image || '';
      },
      error: (err) => {
        this.toastService.error(err.message || 'Yazı yüklenemedi.');
        this.router.navigate(['/dashboard']);
      },
    });
  }

  slugify(text: string): string {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  insertText(before: string, after: string): void {
    const textarea = document.getElementById('contentEditor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = this.content.substring(start, end) || 'metin';
    const replacement = before + selected + after;

    this.content = this.content.substring(0, start) + replacement + this.content.substring(end);
    textarea.focus();
  }

  insertCodeBlock(): void {
    this.insertText('```\n', '\n```');
  }

  get formattedContent(): string {
    return this.content.replace(/\n/g, '<br/>');
  }

  onSubmit(): void {
    if (!this.title || !this.content) return;

    this.isSaving = true;
    const computedSlug = this.isEditMode ? this.editingSlug : this.slugify(this.title);

    const payload = {
      title: this.title,
      slug: computedSlug,
      content: this.content,
      image: this.image,
    };

    if (this.isEditMode) {
      this.postService.updatePost(this.editingSlug, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.success('Yazı başarıyla güncellendi.');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.message || 'Güncelleme başarısız.');
        },
      });
    } else {
      this.postService.createPost(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.success('Yeni yazı yayınlandı ve ana sayfaya eklendi.');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.message || 'Kayıt başarısız.');
        },
      });
    }
  }
}