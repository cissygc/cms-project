import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MediaItem } from '../models/media.model';
import { API_CONFIG } from '../config';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private http = inject(HttpClient);
  private mediaUrl = `${API_CONFIG.baseUrl}/api/media`;

  // isAdmin=true ise backend tüm kullanıcıların medyasını döner
  getMediaList(isAdmin = false): Observable<MediaItem[]> {
    const params = isAdmin ? new HttpParams().set('isAdmin', 'true') : new HttpParams();
    return this.http.get<MediaItem[]>(this.mediaUrl, { params }).pipe(
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

  deleteMedia(id: number | string, isAdmin = false): Observable<void> {
    const params = isAdmin ? new HttpParams().set('isAdmin', 'true') : new HttpParams();
    return this.http.delete<void>(`${this.mediaUrl}/${encodeURIComponent(id)}`, { params }).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Medya silinemedi.';
        return throwError(() => new Error(msg));
      })
    );
  }
}