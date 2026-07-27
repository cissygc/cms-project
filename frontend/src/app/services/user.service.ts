import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { User, SignupPayload } from '../models/user.model';
import { API_CONFIG } from '../config';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private usersUrl = `${API_CONFIG.baseUrl}/api/users`;
  private signupUrl = `${API_CONFIG.baseUrl}/api/auth/signup`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Kullanıcı listesi alınamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }

  createUser(payload: SignupPayload): Observable<User> {
    return this.http.post<User>(this.signupUrl, payload).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Kullanıcı oluşturulamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }

  deleteUser(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${encodeURIComponent(id)}`).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'Kullanıcı silinemedi.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
