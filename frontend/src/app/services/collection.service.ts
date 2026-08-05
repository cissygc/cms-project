import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CollectionSummary } from '../models/post.model';
import { API_CONFIG } from '../config';

// Backend'in koleksiyon listesi için gerçekte döndürdüğü şekil - CollectionSummary'e
// ek olarak postCount de var (yönetim sayfasında göstermek için).
export interface CollectionListItem extends CollectionSummary {
  postCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private http = inject(HttpClient);
  private collectionsUrl = `${API_CONFIG.baseUrl}/api/collections`;

  getCollections(): Observable<CollectionListItem[]> {
    return this.http.get<CollectionListItem[]>(this.collectionsUrl).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Koleksiyonlar alınamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }

  // Sadece ADMIN oluşturabilir (backend kontrol ediyor)
  createCollection(name: string, slug?: string): Observable<CollectionListItem> {
    return this.http.post<CollectionListItem>(this.collectionsUrl, { name, slug }).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Koleksiyon oluşturulamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }

  // Sadece ADMIN silebilir. İçinde post varsa backend hata döner (zorlama
  // seçeneği yok - önce postların koleksiyondan çıkarılması gerekiyor).
  deleteCollection(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.collectionsUrl}/${id}`).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Koleksiyon silinemedi.';
        return throwError(() => new Error(msg));
      })
    );
  }
}