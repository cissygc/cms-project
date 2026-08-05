import {
  Component,
  OnInit,
  AfterViewInit,
  HostListener,
  ViewChild,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FormsModule, NgForm } from "@angular/forms";
import { Observable } from "rxjs";
import { PostService } from "../../services/post.service";
import { CollectionService } from "../../services/collection.service";
import { TagService } from "../../services/tag.service";
import { MediaService } from "../../services/media.service";
import { ToastService } from "../../services/toast.service";
import { MediaPickerModalComponent } from "../../components/media-picker-modal/media-picker-modal.component";
import { MediaItem } from "../../models/media.model";
import {
  CollectionSummary,
  TagSummary,
  Language,
  PostStatus,
  PostPayload,
  Post,
} from "../../models/post.model";
import { CanComponentDeactivate } from "../../guards/post-editor.guard";

@Component({
  selector: "app-post-editor",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MediaPickerModalComponent],
  template: `
    <div class="container editor-page">
      <div class="page-header">
        <div>
          <span class="header-badge">{{
            isEditMode ? "İÇERİK DÜZENLEME" : "YENİ İÇERİK OLUŞTURMA"
          }}</span>
          <h1 class="page-title">
            {{ isEditMode ? "Yazıyı Düzenle" : "Yeni Yazı Ekle" }}
          </h1>
        </div>
      </div>

      <form #postForm="ngForm">
        <!-- Başlık -->
        <div class="glass-card section-card">
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
          <p class="slug-preview" *ngIf="isEditMode">
            /posts/{{ editingSlug }}
          </p>
          <p class="slug-preview" *ngIf="!isEditMode && title">
            /posts/{{ slugify(title) }}
          </p>
        </div>

        <!-- İçerik -->
        <div class="glass-card section-card">
          <label class="form-label">Yazı İçeriği</label>

          <div class="editor-tools-row">
            <!-- Yazı -->
            <div class="tool-group">
              <button
                type="button"
                class="tool-btn"
                title="Kalın"
                (click)="insertText('**', '**')"
              >
                <b>B</b>
              </button>

              <button
                type="button"
                class="tool-btn"
                title="İtalik"
                (click)="insertText('*', '*')"
              >
                <i>I</i>
              </button>

              <button
                type="button"
                class="tool-btn"
                title="Altı Çizili"
                (click)="insertUnderline()"
              >
                <u>U</u>
              </button>

              <button
                type="button"
                class="tool-btn"
                title="Üstü Çizili"
                (click)="insertStrike()"
              >
                <s>S</s>
              </button>
            </div>

            <span class="tool-divider"></span>

            <!-- Başlık -->
            <div class="tool-group">
              <button
                type="button"
                class="tool-btn"
                (click)="insertText('# ', '')"
              >
                H1
              </button>

              <button
                type="button"
                class="tool-btn"
                (click)="insertText('## ', '')"
              >
                H2
              </button>

              <button type="button" class="tool-btn" (click)="insertHeading3()">
                H3
              </button>
            </div>

            <span class="tool-divider"></span>

            <!-- Listeler -->

            <div class="tool-group">
              <button
                type="button"
                class="tool-btn"
                title="Madde Listesi"
                (click)="insertBulletList()"
              >
                •
              </button>

              <button
                type="button"
                class="tool-btn"
                title="Numaralı Liste"
                (click)="insertNumberList()"
              >
                1.
              </button>
            </div>

            <span class="tool-divider"></span>

            <!-- Link -->

            <button
              type="button"
              class="tool-btn"
              title="Link"
              (click)="insertLink()"
            >
              🔗
            </button>

            <!-- Quote -->

            <button
              type="button"
              class="tool-btn"
              title="Alıntı"
              (click)="insertQuote()"
            >
              ❝
            </button>

            <!-- Kod -->

            <button
              type="button"
              class="tool-btn"
              title="Kod"
              (click)="insertCodeBlock()"
            >
              &lt;/&gt;
            </button>

            <!-- Çizgi -->

            <button
              type="button"
              class="tool-btn"
              title="Ayırıcı"
              (click)="insertHorizontalRule()"
            >
              ─
            </button>

            <span class="tool-divider"></span>

            <!-- Görsel -->

            <button
              type="button"
              class="tool-btn tool-btn-wide"
              (click)="openInlinePicker()"
            >
              🖼 Görsel
            </button>
          </div>

          <div class="tab-switch-row">
            <button
              type="button"
              class="tab-switch-btn"
              [class.active]="activeTab === 'edit'"
              (click)="activeTab = 'edit'"
            >
              Metin Editörü
            </button>
            <button
              type="button"
              class="tab-switch-btn"
              [class.active]="activeTab === 'preview'"
              (click)="activeTab = 'preview'"
            >
              Canlı Önizleme
            </button>
          </div>

          <textarea
            *ngIf="activeTab === 'edit'"
            id="contentEditor"
            name="content"
            class="form-textarea main-textarea"
            [(ngModel)]="content"
            required
            placeholder="Yazınızın detaylı içeriğini buraya yazabilirsiniz. Bir görsel eklemek için Ctrl+V ile yapıştırabilir ya da yukarıdaki 'Görsel Ekle' butonunu kullanabilirsiniz."
            rows="16"
            (paste)="onContentPaste($event)"
          ></textarea>

          <div *ngIf="activeTab === 'preview'" class="preview-container">
            <h2 class="preview-heading">
              {{ title || "Başlık henüz girilmedi" }}
            </h2>
            <div *ngIf="coverUrl" class="preview-cover-wrapper">
              <img
                [src]="coverUrl"
                alt="Kapak önizleme"
                class="preview-cover-img"
              />
            </div>
            <div
              class="preview-rendered-body"
              [innerHTML]="formattedContent"
            ></div>
          </div>

          <div class="editor-info-bar">
            <span>Karakter: {{ content.length }}</span>
            <span>Tahmini okuma: {{ estimatedReadingTime }} dk</span>
          </div>
        </div>

        <!-- Kapak Görseli -->
        <div class="glass-card section-card">
          <label class="form-label">Kapak Görseli</label>

          <div *ngIf="coverUrl" class="cover-preview-box">
            <img
              [src]="coverUrl"
              alt="Kapak görseli"
              class="cover-image-display"
            />
            <button
              type="button"
              class="btn btn-secondary btn-block"
              (click)="openCoverPicker()"
            >
              Değiştir
            </button>
            <button
              type="button"
              class="btn btn-danger btn-block"
              (click)="clearCover()"
            >
              Kaldır
            </button>
          </div>

          <div
            *ngIf="!coverUrl"
            class="cover-dropzone"
            (click)="openCoverPicker()"
          >
            <span class="dropzone-title">Kapak görseli ekleyin</span>
            <span class="dropzone-desc"
              >Medya kütüphanesinden görsel seçmek için tıklayın</span
            >
          </div>
        </div>

        <!-- Dil -->
        <div class="glass-card section-card">
          <label class="form-label" for="language">Dil</label>
          <select
            id="language"
            class="form-input"
            [(ngModel)]="language"
            name="language"
          >
            <option value="TR">Türkçe</option>
            <option value="EN">İngilizce</option>
            <option value="DE">Almanca</option>
            <option value="RU">Rusça</option>
          </select>
        </div>

        <!-- Zamanlanmış Yayın -->
        <div class="glass-card section-card">
          <label class="form-label" for="publishAt">Zamanlanmış Yayın</label>
          <input
            type="datetime-local"
            id="publishAt"
            class="form-input"
            [(ngModel)]="publishAtLocal"
            name="publishAt"
          />
          <p class="field-hint" *ngIf="publishAtLocal">
            Taslak olarak kaydedilirse bu tarihte otomatik yayınlanır.
          </p>
        </div>

        <!-- Koleksiyonlar -->
        <div class="glass-card section-card">
          <label class="form-label">Koleksiyonlar</label>
          <p class="field-hint" *ngIf="collections.length === 0">
            Henüz koleksiyon oluşturulmamış.
          </p>
          <div class="pill-select-grid" *ngIf="collections.length > 0">
            <button
              type="button"
              *ngFor="let c of collections"
              class="pill-select"
              [class.active]="selectedCollectionIds.has(c.id)"
              (click)="toggleCollection(c.id)"
            >
              {{ c.name }}
            </button>
          </div>
        </div>

        <!-- Etiketler -->
        <div class="glass-card section-card">
          <label class="form-label" for="tagDraft">Etiketler</label>
          <input
            type="text"
            id="tagDraft"
            class="form-input"
            placeholder="Etiket yazıp Enter'a basın"
            [(ngModel)]="tagDraft"
            name="tagDraft"
            (keydown.enter)="addTagFromDraft($event)"
            (keydown.comma)="addTagFromDraft($event)"
          />
          <div class="chip-row" *ngIf="selectedTagNames.length > 0">
            <span class="chip" *ngFor="let t of selectedTagNames">
              {{ t }}
              <button type="button" class="chip-remove" (click)="removeTag(t)">
                ×
              </button>
            </span>
          </div>
          <div class="existing-tags" *ngIf="existingTags.length > 0">
            <p class="field-hint">Mevcut etiketler:</p>
            <div class="chip-row">
              <button
                type="button"
                class="chip chip-suggestion"
                *ngFor="let t of existingTags"
                (click)="addTag(t.name)"
              >
                {{ t.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- SEO -->
        <div class="glass-card section-card">
          <div class="section-header-row">
            <label class="form-label">SEO Ayarları</label>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              (click)="seoOpen = !seoOpen"
            >
              {{ seoOpen ? "Gizle" : "Göster" }}
            </button>
          </div>
          <p class="field-hint">
            Boş bırakılan alanlar başlık, açıklama ve kapak görselinden otomatik
            türetilir.
          </p>

          <div *ngIf="seoOpen" class="seo-fields">
            <div class="form-group">
              <label class="form-label-sm" for="seoMetaTitle"
                >Meta Başlık</label
              >
              <input
                type="text"
                id="seoMetaTitle"
                class="form-input"
                [(ngModel)]="seoMetaTitle"
                name="seoMetaTitle"
                [placeholder]="title || 'Yazı başlığı'"
              />
            </div>
            <div class="form-group">
              <label class="form-label-sm" for="seoMetaDescription"
                >Meta Açıklama</label
              >
              <textarea
                id="seoMetaDescription"
                class="form-textarea"
                rows="2"
                [(ngModel)]="seoMetaDescription"
                name="seoMetaDescription"
                placeholder="Arama sonuçlarında görünecek kısa açıklama"
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label-sm" for="seoOgImageUrl"
                >OG Görsel URL</label
              >
              <input
                type="text"
                id="seoOgImageUrl"
                class="form-input"
                [(ngModel)]="seoOgImageUrl"
                name="seoOgImageUrl"
                [placeholder]="coverUrl || 'Kapak görseli kullanılır'"
              />
            </div>
            <div class="form-group">
              <label class="form-label-sm" for="seoCanonicalUrl"
                >Canonical URL</label
              >
              <input
                type="text"
                id="seoCanonicalUrl"
                class="form-input"
                [(ngModel)]="seoCanonicalUrl"
                name="seoCanonicalUrl"
                placeholder="https://revloai.com/tr/blog/..."
              />
            </div>
            <label class="checkbox-row">
              <input
                type="checkbox"
                [(ngModel)]="seoNoIndex"
                name="seoNoIndex"
              />
              <span>Arama motorlarında indekslenmesin (noindex)</span>
            </label>
          </div>
        </div>

        <!-- Kaydet -->
        <div class="save-actions">
          <button
            type="button"
            class="btn btn-primary btn-block btn-lg"
            [disabled]="isSaving || !title || !content"
            (click)="saveAs('PUBLISHED')"
          >
            <span *ngIf="!(isSaving && pendingStatus === 'PUBLISHED')"
              >Yayınla</span
            >
            <span *ngIf="isSaving && pendingStatus === 'PUBLISHED'"
              >Yayınlanıyor...</span
            >
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-block btn-lg"
            [disabled]="isSaving || !title || !content"
            (click)="saveAs('DRAFT')"
          >
            <span *ngIf="!(isSaving && pendingStatus === 'DRAFT')"
              >Taslak Olarak Kaydet</span
            >
            <span *ngIf="isSaving && pendingStatus === 'DRAFT'"
              >Kaydediliyor...</span
            >
          </button>
          <a routerLink="/posts" class="cancel-link">İptal</a>
        </div>
      </form>
    </div>

    <!-- Kapak seçimi -->
    <app-media-picker-modal
      [isOpen]="isCoverPickerOpen"
      [multiple]="false"
      (picked)="onCoverPicked($event)"
      (closed)="isCoverPickerOpen = false"
    ></app-media-picker-modal>

    <!-- İçerik içine görsel ekleme -->
    <app-media-picker-modal
      [isOpen]="isInlinePickerOpen"
      [multiple]="false"
      (picked)="onInlinePicked($event)"
      (closed)="isInlinePickerOpen = false"
    ></app-media-picker-modal>

    <!-- Sayfadan çıkış onayı -->
    <div *ngIf="leaveConfirmOpen" class="modal-backdrop">
      <div class="modal-box">
        <h3 class="modal-title">Kaydedilmemiş değişiklikler var</h3>
        <p class="modal-text">
          Bu sayfadan ayrılmadan önce değişikliklerinizi kaydetmek ister
          misiniz?
        </p>
        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-primary btn-block"
            (click)="confirmLeaveSaveAndExit()"
            [disabled]="isSaving"
          >
            {{ isSaving ? "Kaydediliyor..." : "Kaydet ve Çık" }}
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-block"
            (click)="confirmLeaveCancel()"
          >
            Düzenlemeye Devam Et
          </button>
          <button
            type="button"
            class="btn btn-danger btn-block"
            (click)="confirmLeaveDiscard()"
          >
            Kaydetmeden Çık
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .editor-page {
        width: min(1600px, calc(100vw - 320px));
        margin: 0 auto;
      }

      .header-badge {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #6b21a8;
        background: #f0ebf8;
        border: 1px solid rgba(124, 58, 237, 0.2);
        padding: 5px 14px;
        border-radius: var(--radius-pill);
        margin-bottom: 8px;
        display: inline-block;
      }
      .page-title {
        color: #111827 !important;
        font-weight: 800;
      }

      .section-card {
        padding: 24px;
        background: #ffffff;
        margin-bottom: 20px;
      }
      .form-group {
        margin-bottom: 18px;
      }
      .form-group:last-child {
        margin-bottom: 0;
      }
      .form-label {
        color: #111827 !important;
        font-weight: 800;
        display: block;
        margin-bottom: 10px;
      }
      .form-label-sm {
        color: #374151 !important;
        font-weight: 700;
        font-size: 13px;
        display: block;
        margin-bottom: 6px;
      }
      .field-hint {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 6px;
      }

      .title-input {
        width: 100%;
        font-size: 17px;
        font-weight: 700;
        padding: 14px 16px;
        background: #f8f6fc !important;
        border: 1px solid #e8e3f2;
        color: #111827 !important;
      }
      .title-input:focus {
        background: #ffffff !important;
        border-color: #7c3aed;
      }
      .slug-preview {
        margin-top: 8px;
        font-size: 12px;
        color: #7c3aed;
        font-family: "JetBrains Mono", monospace;
      }

      /* Editör araç çubuğu - üstte tek satır, sekme geçişi altında ayrı satır */
      .editor-tools-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        background: #f8f6fc;
        padding: 10px 12px;
        border-top-left-radius: var(--radius-md);
        border-top-right-radius: var(--radius-md);
        border: 1px solid #e8e3f2;
        border-bottom: none;
      }
      .tool-btn {
        min-width: 34px;
        height: 34px;
        padding: 0 10px;
        border-radius: 8px;
        background: #ffffff;
        border: 1px solid #e8e3f2;
        color: #111827;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .tool-btn:hover {
        background: #7c3aed;
        color: #ffffff;
        border-color: #7c3aed;
      }
      .tool-btn-wide {
        min-width: auto;
        font-weight: 700;
        font-size: 12px;
      }
      .tool-divider {
        width: 1px;
        height: 22px;
        background: #e8e3f2;
        margin: 0 4px;
      }

      .tab-switch-row {
        display: flex;
        gap: 0;
        border: 1px solid #e8e3f2;
        border-top: none;
        background: #ffffff;
      }
      .tab-switch-btn {
        flex: 1;
        padding: 9px;
        font-size: 12px;
        font-weight: 700;
        color: #6b7280;
        background: #f8f6fc;
        border-bottom: 2px solid transparent;
      }
      .tab-switch-btn.active {
        color: #7c3aed;
        background: #ffffff;
        border-bottom-color: #7c3aed;
      }

      .main-textarea {
        width: 100% !important;
        box-sizing: border-box !important;
        display: block !important;
        border-radius: 0 !important;
        border-bottom-left-radius: var(--radius-md) !important;
        border-bottom-right-radius: var(--radius-md) !important;
        font-size: 15px !important;
        line-height: 1.7 !important;
        min-height: 360px !important;
        padding: 18px !important;
        background: #ffffff !important;
        border: 1px solid #e8e3f2 !important;
        border-top: none !important;
        color: #111827 !important;
        font-weight: 500 !important;
      }
      .main-textarea:focus {
        border-color: #7c3aed !important;
        outline: none !important;
      }

      .preview-container {
        background: #ffffff;
        border: 1px solid #e8e3f2;
        border-top: none;
        border-bottom-left-radius: var(--radius-md);
        border-bottom-right-radius: var(--radius-md);
        padding: 24px;
        min-height: 360px;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      .preview-heading {
        font-size: 22px;
        font-weight: 800;
        color: #111827;
        margin-bottom: 16px;
      }
      .preview-cover-wrapper {
        width: 100%;
        border-radius: var(--radius-md);
        background: #f8f8f8;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        padding: 12px;
      }

      .preview-cover-img {
        width: 100%;
        height: auto;
        max-height: 420px;
        object-fit: contain;
        display: block;
      }
      .preview-rendered-body h3 {
        font-size: 20px;
        font-weight: 700;
        margin: 18px 0 8px;
      }

      .preview-rendered-body hr {
        margin: 28px 0;
        border: none;
        border-top: 1px solid #ddd;
      }

      .preview-rendered-body ul {
        margin: 14px 0;
        padding-left: 28px;
      }

      .preview-rendered-body ol {
        margin: 14px 0;
        padding-left: 28px;
      }

      .preview-rendered-body li {
        margin-bottom: 8px;
      }

      .preview-rendered-body a {
        color: #7c3aed;
        text-decoration: none;
        font-weight: 600;
      }

      .preview-rendered-body a:hover {
        text-decoration: underline;
      }

      .preview-rendered-body del {
        opacity: 0.7;
      }

      .preview-rendered-body u {
        text-decoration-thickness: 2px;
      }

      .preview-rendered-body blockquote {
        margin: 24px 0;

        padding: 18px 22px;

        background: #f8f5ff;

        border-left: 5px solid #7c3aed;

        font-style: italic;

        color: #444;

        border-radius: 10px;
      }
      .preview-rendered-body pre {
        background: #111827;
        color: #e5e7eb;
        padding: 14px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 12px 0;
        font-size: 13px;
      }
      .preview-rendered-body img {
        max-width: 100%;
        border-radius: var(--radius-md);
        display: block;
        margin: 14px 0;
      }

      .editor-info-bar {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #6b7280;
        margin-top: 10px;
      }

      /* Kapak */
      .cover-preview-box {
        align-items: center;
      }

      .cover-image-display {
        width: 100%;
        max-height: 420px;
        object-fit: contain;
      }
      .cover-dropzone {
        padding: 32px 16px;
        border: 2px dashed rgba(124, 58, 237, 0.3);
        border-radius: var(--radius-md);
        text-align: center;
        background: #f8f6fc;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .cover-dropzone:hover {
        background: #f0ebf8;
        border-color: #7c3aed;
      }
      .dropzone-title {
        font-weight: 800;
        font-size: 14px;
        color: #111827;
      }
      .dropzone-desc {
        font-size: 12px;
        color: #6b7280;
      }

      /* Koleksiyon pilleri */
      .pill-select-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .pill-select {
        padding: 6px 14px;
        border-radius: var(--radius-pill);
        font-size: 12px;
        font-weight: 700;
        background: #f0ebf8;
        color: #6b21a8;
        border: 1px solid transparent;
      }
      .pill-select.active {
        background: var(--revlo-purple-main);
        color: #fff;
      }

      /* Etiket chip'leri */
      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        color: var(--revlo-purple-main);
        background: #f0ebf8;
        padding: 4px 6px 4px 10px;
        border-radius: var(--radius-pill);
      }
      .chip-remove {
        color: var(--revlo-purple-main);
        font-size: 13px;
        opacity: 0.7;
        line-height: 1;
      }
      .chip-remove:hover {
        opacity: 1;
      }
      .chip-suggestion {
        cursor: pointer;
        background: #f1f5f9;
        color: #475569;
        padding: 4px 10px;
      }
      .chip-suggestion:hover {
        background: #e0f2fe;
        color: #0369a1;
      }
      .existing-tags {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid #f1f5f9;
      }

      /* SEO */
      .section-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .seo-fields {
        margin-top: 12px;
      }
      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #374151;
        font-weight: 600;
      }
      .checkbox-row input {
        width: 16px;
        height: 16px;
        accent-color: var(--revlo-purple-main);
      }

      /* Kaydet aksiyonları - hepsi alt alta */
      .save-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 8px;
      }
      .btn-block {
        width: 100%;
      }
      .btn-lg {
        padding: 14px;
        font-size: 14px;
      }
      .btn-sm {
        padding: 7px 12px;
        font-size: 12px;
      }
      .cancel-link {
        text-align: center;
        font-size: 13px;
        color: #6b7280;
        font-weight: 600;
        padding: 6px;
      }
      .cancel-link:hover {
        color: #111827;
      }

      /* Çıkış onay modalı */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }
      .modal-box {
        background: #fff;
        border-radius: var(--radius-card);
        padding: 28px;
        width: min(420px, 90vw);
      }
      .modal-title {
        font-size: 17px;
        font-weight: 800;
        color: #111827;
        margin-bottom: 8px;
      }
      .modal-text {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 20px;
        line-height: 1.5;
      }
      .modal-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `,
  ],
})
export class PostEditorComponent
  implements OnInit, AfterViewInit, CanComponentDeactivate
{
  private postService = inject(PostService);
  private collectionService = inject(CollectionService);
  private tagService = inject(TagService);
  private mediaService = inject(MediaService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild("postForm") postForm!: NgForm;

  // Temel alanlar
  title = "";
  content = "";
  activeTab: "edit" | "preview" = "edit";

  // Yayın
  status: PostStatus = "DRAFT";
  pendingStatus: PostStatus | null = null;
  language: Language = "TR";
  publishAtLocal = "";

  // Kapak
  coverMediaId: number | null = null;
  coverUrl = "";

  // İçerik içine eklenen görsellerin url -> mediaId eşlemesi.
  // Kaydederken içerik metnini tarayıp ![alt](url) biçimindeki her görseli
  // bu haritadan mediaId'ye çevirip backend'in beklediği media[] dizisini oluşturuyoruz.
  private imageUrlToMediaId = new Map<string, number>();

  // Koleksiyon & etiket
  collections: CollectionSummary[] = [];
  selectedCollectionIds = new Set<number>();
  existingTags: TagSummary[] = [];
  selectedTagNames: string[] = [];
  tagDraft = "";

  // SEO
  seoOpen = false;
  seoMetaTitle = "";
  seoMetaDescription = "";
  seoOgImageUrl = "";
  seoCanonicalUrl = "";
  seoNoIndex = false;

  isEditMode = false;
  editingSlug = "";
  isSaving = false;
  isCoverPickerOpen = false;
  isInlinePickerOpen = false;

  // Kaydedilmemiş değişiklik takibi
  hasUnsavedChanges = false;
  private initialLoadDone = false;
  leaveConfirmOpen = false;
  private leaveResolve: ((v: boolean) => void) | null = null;

  ngOnInit(): void {
    this.collectionService.getCollections().subscribe({
      next: (list) => (this.collections = list),
      error: () => {},
    });
    this.tagService.getTags().subscribe({
      next: (list) => (this.existingTags = list),
      error: () => {},
    });

    const slugParam = this.route.snapshot.paramMap.get("slug");
    if (slugParam) {
      this.isEditMode = true;
      this.editingSlug = slugParam;
      this.loadPost(slugParam);
    } else {
      setTimeout(() => (this.initialLoadDone = true), 50);
    }
  }

  ngAfterViewInit(): void {
    this.postForm.form.valueChanges.subscribe(() => {
      if (this.initialLoadDone) this.hasUnsavedChanges = true;
    });
  }

  @HostListener("window:beforeunload", ["$event"])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = "";
    }
  }

  private markDirty(): void {
    this.hasUnsavedChanges = true;
  }

  loadPost(slug: string): void {
    this.postService.getPost(slug).subscribe({
      next: (post) => {
        this.title = post.title;
        this.content = post.content || "";
        this.coverUrl = post.image || "";
        this.status = post.status;
        this.language = post.language;
        this.publishAtLocal = this.toDatetimeLocal(post.publishAt);
        this.selectedCollectionIds = new Set(
          (post.collections || []).map((c) => c.id),
        );
        this.selectedTagNames = (post.tags || []).map((t) => t.name);

        // Mevcut içerik-içi görsellerin url -> mediaId eşlemesini geri kur,
        // aksi halde tekrar kaydedince content'te duran görseller media[]
        // dizisine dahil edilemez.
        this.imageUrlToMediaId = new Map(
          (post.media || []).map((m) => [m.url, m.mediaId]),
        );

        if (post.seo) {
          this.seoMetaTitle = post.seo.metaTitle || "";
          this.seoMetaDescription = post.seo.metaDescription || "";
          this.seoOgImageUrl = post.seo.ogImageUrl || "";
          this.seoCanonicalUrl = post.seo.canonicalUrl || "";
          this.seoNoIndex = !!post.seo.noIndex;
        }

        setTimeout(() => (this.initialLoadDone = true), 50);
      },
      error: (err) => {
        this.toastService.error(err.message || "Yazı yüklenemedi.");
        this.router.navigate(["/posts"]);
      },
    });
  }

  slugify(text: string): string {
    return (text || "")
      .toString()
      .toLowerCase()
      .trim()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // ── Metin editörü araçları ────────────────────────────────────────

  insertText(before: string, after: string): void {
    const textarea = document.getElementById(
      "contentEditor",
    ) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = this.content.substring(start, end) || "metin";
    const replacement = before + selected + after;
    this.content =
      this.content.substring(0, start) +
      replacement +
      this.content.substring(end);
    this.markDirty();
    setTimeout(() => textarea.focus());
  }

  insertCodeBlock(): void {
    this.insertText("```\n", "\n```");
  }
  insertHeading3(): void {
    this.insertText("### ", "");
  }

  insertUnderline(): void {
    this.insertText("<u>", "</u>");
  }

  insertStrike(): void {
    this.insertText("~~", "~~");
  }

  insertQuote(): void {
    this.insertText("> ", "");
  }

  insertHorizontalRule(): void {
    const textarea = document.getElementById(
      "contentEditor",
    ) as HTMLTextAreaElement;

    const separator = "\n\n---\n\n";

    if (!textarea) {
      this.content += separator;
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    this.content =
      this.content.substring(0, start) +
      separator +
      this.content.substring(end);

    const pos = start + separator.length;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });

    this.markDirty();
  }

  insertBulletList(): void {
    const textarea = document.getElementById(
      "contentEditor",
    ) as HTMLTextAreaElement;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = this.content.substring(start, end) || "Liste öğesi";

    const lines = selected
      .split("\n")
      .map((x) => `- ${x}`)
      .join("\n");

    this.content =
      this.content.substring(0, start) + lines + this.content.substring(end);

    this.markDirty();
  }

  insertNumberList(): void {
    const textarea = document.getElementById(
      "contentEditor",
    ) as HTMLTextAreaElement;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = this.content.substring(start, end) || "Liste öğesi";

    const lines = selected
      .split("\n")
      .map((x, i) => `${i + 1}. ${x}`)
      .join("\n");

    this.content =
      this.content.substring(0, start) + lines + this.content.substring(end);

    this.markDirty();
  }

  insertLink(): void {
    const textarea = document.getElementById(
      "contentEditor",
    ) as HTMLTextAreaElement;

    if (!textarea) return;

    const selected =
      this.content.substring(textarea.selectionStart, textarea.selectionEnd) ||
      "Link";

    const url = prompt("URL");

    if (!url) return;

    const markdown = `[${selected}](${url})`;

    this.content =
      this.content.substring(0, textarea.selectionStart) +
      markdown +
      this.content.substring(textarea.selectionEnd);

    this.markDirty();
  }

  // Görseli her zaman kendi satırına, imlecin bulunduğu yere ekler -
  // böylece "yaz, görsel yapıştır, altından yazmaya devam et" akışı çalışır.
  private insertImageAtCursor(url: string, mediaId: number, alt: string): void {
    const textarea = document.getElementById(
      "contentEditor",
    ) as HTMLTextAreaElement;
    const snippet = `\n![${alt}](${url})\n`;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      this.content =
        this.content.substring(0, start) +
        snippet +
        this.content.substring(end);
      const newPos = start + snippet.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      });
    } else {
      this.content += snippet;
    }

    this.imageUrlToMediaId.set(url, mediaId);
    this.markDirty();
  }

  onContentPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        event.preventDefault();
        const raw = item.getAsFile();
        if (!raw) break;
        const ext = item.type.split("/")[1] || "png";
        const file = new File([raw], `pasted-image.${ext}`, {
          type: item.type,
        });

        this.mediaService.uploadMedia(file).subscribe({
          next: (uploaded) => {
            this.toastService.success("Görsel içeriğe eklendi.");
            this.insertImageAtCursor(
              uploaded.url,
              Number(uploaded.id),
              uploaded.name,
            );
          },
          error: (err) =>
            this.toastService.error(err.message || "Görsel yüklenemedi."),
        });
        break;
      }
    }
  }

  openInlinePicker(): void {
    this.isInlinePickerOpen = true;
  }

  onInlinePicked(items: MediaItem[]): void {
    const item = items[0];
    if (!item) return;
    this.insertImageAtCursor(item.url, Number(item.id), item.name);
    this.isInlinePickerOpen = false;
  }

  get formattedContent(): string {
    return this.renderMarkdown(this.content);
  }

  get estimatedReadingTime(): number {
    const words = this.content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  // Basit markdown -> HTML dönüştürücü. Sadece toolbar'ın ürettiği
  // sözdizimini destekler: **kalın**, *italik*, # / ## başlık, > alıntı,
  // ``` kod bloğu, ![alt](url) görsel. Amaç tam bir markdown motoru değil,
  // canlı önizlemenin editördeki biçimlendirmeyi doğru yansıtması.
  private renderMarkdown(raw: string): string {
    const codeBlocks: string[] = [];
    let text = raw.replace(/```([\s\S]*?)```/g, (_m, code) => {
      codeBlocks.push(
        `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`,
      );
      return `@@CODEBLOCK${codeBlocks.length - 1}@@`;
    });

    text = this.escapeHtml(text);
    text = text.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_m, alt, url) => `<img src="${url}" alt="${alt}" />`,
    );

    const lines = text.split("\n");
    const html = lines
      .map((line) => {
        if (/^###\s+/.test(line))
          return `<h3>${this.inlineFormat(line.replace(/^###\s+/, ""))}</h3>`;

        if (/^##\s+/.test(line))
          return `<h2>${this.inlineFormat(line.replace(/^##\s+/, ""))}</h2>`;

        if (/^#\s+/.test(line))
          return `<h1>${this.inlineFormat(line.replace(/^#\s+/, ""))}</h1>`;

        if (/^---$/.test(line.trim())) return "<hr>";

        if (/^&gt;\s+/.test(line))
          return `<blockquote>${this.inlineFormat(
            line.replace(/^&gt;\s+/, ""),
          )}</blockquote>`;

        if (/^-\s+/.test(line))
          return `<li>${this.inlineFormat(line.replace(/^-\s+/, ""))}</li>`;

        if (/^\d+\.\s+/.test(line))
          return `<li>${this.inlineFormat(line.replace(/^\d+\.\s+/, ""))}</li>`;

        if (/^<img /.test(line.trim())) return line;

        if (line.trim() === "") return "";

        return `<p>${this.inlineFormat(line)}</p>`;
      })
      .join("");

    let output = html;

    output = output.replace(/(<li>.*?<\/li>)+/gs, (m) => `<ul>${m}</ul>`);

    return output.replace(
      /@@CODEBLOCK(\d+)@@/g,
      (_m, i) => codeBlocks[Number(i)],
    );
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private inlineFormat(s: string): string {
    return (
      s

        // Bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

        // Italic
        .replace(/\*(.*?)\*/g, "<em>$1</em>")

        // Underline
        .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")

        // Strike
        .replace(/~~(.*?)~~/g, "<del>$1</del>")

        // Link
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    );
  }
  // ── Kapak görseli ─────────────────────────────────────────────────

  openCoverPicker(): void {
    this.isCoverPickerOpen = true;
  }

  onCoverPicked(items: MediaItem[]): void {
    const item = items[0];
    if (!item) return;
    this.coverMediaId = Number(item.id);
    this.coverUrl = item.url;
    this.isCoverPickerOpen = false;
    this.markDirty();
  }

  clearCover(): void {
    this.coverMediaId = null;
    this.coverUrl = "";
    this.markDirty();
  }

  // ── Koleksiyonlar ─────────────────────────────────────────────────

  toggleCollection(id: number): void {
    if (this.selectedCollectionIds.has(id)) {
      this.selectedCollectionIds.delete(id);
    } else {
      this.selectedCollectionIds.add(id);
    }
    this.markDirty();
  }

  // ── Etiketler ─────────────────────────────────────────────────────

  addTagFromDraft(event: Event): void {
    event.preventDefault();
    const raw = this.tagDraft.replace(/,$/, "").trim();
    if (raw) this.addTag(raw);
    this.tagDraft = "";
  }

  addTag(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = this.selectedTagNames.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      this.selectedTagNames.push(trimmed);
      this.markDirty();
    }
  }

  removeTag(name: string): void {
    this.selectedTagNames = this.selectedTagNames.filter((t) => t !== name);
    this.markDirty();
  }

  // ── Tarih dönüşümleri ────────────────────────────────────────────

  private toDatetimeLocal(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private fromDatetimeLocal(local: string): string | undefined {
    if (!local) return undefined;
    const d = new Date(local);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  // İçerik metnindeki ![alt](url) görsellerini sırayla tarayıp, daha önce
  // eklenirken kaydettiğimiz url -> mediaId eşlemesinden backend'in
  // beklediği media[] dizisini üretir.
  private extractContentMedia(): { mediaId: number; caption?: string }[] {
    const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const result: { mediaId: number; caption?: string }[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(this.content)) !== null) {
      const alt = match[1];
      const url = match[2];
      const mediaId = this.imageUrlToMediaId.get(url);
      if (mediaId) result.push({ mediaId, caption: alt || undefined });
    }
    return result;
  }

  private buildPayload(): PostPayload {
    const computedSlug = this.isEditMode
      ? this.editingSlug
      : this.slugify(this.title);

    const payload: PostPayload = {
      slug: computedSlug,
      title: this.title,
      content: this.content,
      status: this.status,
      language: this.language,
      collectionIds: Array.from(this.selectedCollectionIds),
      tagNames: this.selectedTagNames,
      media: this.extractContentMedia(),
      seo: {
        metaTitle: this.seoMetaTitle || undefined,
        metaDescription: this.seoMetaDescription || undefined,
        ogImageUrl: this.seoOgImageUrl || undefined,
        canonicalUrl: this.seoCanonicalUrl || undefined,
        noIndex: this.seoNoIndex,
      },
      publishAt: this.fromDatetimeLocal(this.publishAtLocal),
    };

    if (this.coverMediaId !== null) {
      payload.coverMediaId = this.coverMediaId;
    }

    return payload;
  }

  private sendPayload(): Observable<Post> {
    const payload = this.buildPayload();
    return this.isEditMode
      ? this.postService.updatePost(this.editingSlug, payload)
      : this.postService.createPost(payload);
  }

  // ── Kaydet ────────────────────────────────────────────────────────

  saveAs(status: PostStatus): void {
    if (!this.title || !this.content) return;
    this.status = status;
    this.pendingStatus = status;
    this.isSaving = true;

    this.sendPayload().subscribe({
      next: () => {
        this.isSaving = false;
        this.pendingStatus = null;
        this.hasUnsavedChanges = false;
        this.toastService.success(
          status === "PUBLISHED" ? "Yazı yayınlandı." : "Taslak kaydedildi.",
        );
        this.router.navigate(["/posts"]);
      },
      error: (err) => {
        this.isSaving = false;
        this.pendingStatus = null;
        this.toastService.error(err.message || "Kayıt başarısız.");
      },
    });
  }

  // ── Sayfadan çıkış onayı ─────────────────────────────────────────

  canDeactivate(): boolean | Promise<boolean> {
    if (!this.hasUnsavedChanges || this.isSaving) return true;
    this.leaveConfirmOpen = true;
    return new Promise<boolean>((resolve) => {
      this.leaveResolve = resolve;
    });
  }

  confirmLeaveSaveAndExit(): void {
    if (!this.title || !this.content) {
      this.toastService.error("Kaydetmek için başlık ve içerik gerekli.");
      return;
    }
    this.isSaving = true;
    this.sendPayload().subscribe({
      next: () => {
        this.isSaving = false;
        this.hasUnsavedChanges = false;
        this.leaveConfirmOpen = false;
        this.toastService.success("Kaydedildi.");
        this.leaveResolve?.(true);
      },
      error: (err) => {
        this.isSaving = false;
        this.toastService.error(
          err.message || "Kayıt başarısız, sayfada kalındı.",
        );
        // Kayıt başarısızsa sayfadan çıkılmasın, kullanıcı tekrar denesin.
      },
    });
  }

  confirmLeaveDiscard(): void {
    this.leaveConfirmOpen = false;
    this.hasUnsavedChanges = false;
    this.leaveResolve?.(true);
  }

  confirmLeaveCancel(): void {
    this.leaveConfirmOpen = false;
    this.leaveResolve?.(false);
  }
}
