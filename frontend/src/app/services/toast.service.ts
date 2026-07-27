import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();
  private counter = 0;

  show(text: string, type: 'success' | 'error' | 'info' = 'success', duration = 3500): void {
    const id = ++this.counter;
    const toast: ToastMessage = { id, text, type };
    this.toastsSignal.update((current) => [...current, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  info(text: string): void {
    this.show(text, 'info');
  }

  remove(id: number): void {
    this.toastsSignal.update((current) => current.filter((t) => t.id !== id));
  }
}
