import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CollectionSummary } from '../models/post.model';
import { API_CONFIG } from '../config';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private http = inject(HttpClient);
  private collectionsUrl = `${API_CONFIG.baseUrl}/api/collections`;

  getCollections(): Observable<CollectionSummary[]> {
    return this.http.get<CollectionSummary[]>(this.collectionsUrl).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Koleksiyonlar alınamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }
}