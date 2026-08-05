import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TagSummary } from '../models/post.model';
import { API_CONFIG } from '../config';

export interface TagListItem extends TagSummary {
  postCount: number;
}

// Backend'in confirm olmadan gönderdiğinde döndürdüğü ön-kontrol sonucu
export interface TagDeleteResult {
  deleted: boolean;
  affectedPostCount: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);
  private tagsUrl = `${API_CONFIG.baseUrl}/api/tags`;

  getTags(): Observable<TagListItem[]> {
    return this.http.get<TagListItem[]>(this.tagsUrl).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Etiketler alınamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }

  // confirm=false: etiket bir yazıda kullanılıyorsa silmez, kaç yazıyı
  // etkileyeceğini bildiren bir sonuç döner (deleted:false). Kullanıcı
  // onaylarsa confirm=true ile tekrar çağrılır ve gerçekten siler.
  deleteTag(id: number, confirm: boolean): Observable<TagDeleteResult> {
    return this.http.delete<TagDeleteResult>(`${this.tagsUrl}/${id}?confirm=${confirm}`).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Etiket silinemedi.';
        return throwError(() => new Error(msg));
      })
    );
  }
}