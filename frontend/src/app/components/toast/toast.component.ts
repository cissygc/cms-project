import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast"
        [ngClass]="'toast-' + toast.type"
      >
        <span class="toast-icon">
          <ng-container [ngSwitch]="toast.type">
            <span *ngSwitchCase="'success'">✓</span>
            <span *ngSwitchCase="'error'">✕</span>
            <span *ngSwitchDefault>ℹ</span>
          </ng-container>
        </span>
        <span class="toast-text">{{ toast.text }}</span>
        <button class="toast-close" (click)="toastService.remove(toast.id)">✕</button>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 380px;
        pointer-events: none;
      }
      .toast {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        color: #ffffff;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        animation: slideIn 0.25s ease-out;
      }
      .toast-success {
        background: #10b981;
      }
      .toast-error {
        background: #ef4444;
      }
      .toast-info {
        background: #3b82f6;
      }
      .toast-icon {
        font-weight: bold;
        font-size: 16px;
      }
      .toast-text {
        flex: 1;
      }
      .toast-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        cursor: pointer;
        padding: 2px 4px;
      }
      .toast-close:hover {
        color: #ffffff;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);
}
