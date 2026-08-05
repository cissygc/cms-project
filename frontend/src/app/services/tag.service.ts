import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TagSummary } from '../models/post.model';
import { API_CONFIG } from '../config';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);
  private tagsUrl = `${API_CONFIG.baseUrl}/api/tags`;

  getTags(): Observable<TagSummary[]> {
    return this.http.get<TagSummary[]>(this.tagsUrl).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Etiketler alınamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }
}