import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { DashboardStats } from '../models/dashboard.model';
import { API_CONFIG } from '../config';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API_CONFIG.baseUrl}/api/dashboard/stats`).pipe(
      catchError((err) => {
        const msg = err?.error?.exception?.message || 'İstatistikler alınamadı.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
