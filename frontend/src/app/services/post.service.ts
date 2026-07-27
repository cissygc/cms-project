import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Post, PostPayload } from '../models/post.model';
import { API_CONFIG } from '../config';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  private postsUrl = `${API_CONFIG.baseUrl}/api/entries/posts`;

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.postsUrl).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Yazılar yüklenirken bir hata oluştu.';
        return throwError(() => new Error(msg));
      })
    );
  }

  getPost(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.postsUrl}/${encodeURIComponent(slug)}`).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Yazı detayları alınamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }

  createPost(payload: PostPayload): Observable<Post> {
    return this.http.post<Post>(this.postsUrl, payload).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Yazı oluşturulamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }

  updatePost(slug: string, payload: PostPayload): Observable<Post> {
    return this.http.put<Post>(`${this.postsUrl}/${encodeURIComponent(slug)}`, payload).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Yazı güncellenemedi.';
        return throwError(() => new Error(msg));
      })
    );
  }

  deletePost(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.postsUrl}/${encodeURIComponent(slug)}`).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Yazı silinemedi.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
