import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MediaItem } from '../models/media.model';
import { API_CONFIG } from '../config';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private http = inject(HttpClient);
  private mediaUrl = `${API_CONFIG.baseUrl}/api/media`;

  getMediaList(): Observable<MediaItem[]> {
    return this.http.get<MediaItem[]>(this.mediaUrl).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Medya listesi alınamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }

  uploadMedia(file: File): Observable<MediaItem> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<MediaItem>(this.mediaUrl, formData).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Medya yüklenemedi.';
        return throwError(() => new Error(msg));
      })
    );
  }

  deleteMedia(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.mediaUrl}/${encodeURIComponent(id)}`).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Medya silinemedi.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
