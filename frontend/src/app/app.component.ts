import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToastComponent } from './components/toast/toast.component';

// "flex" burada CSS Flexbox demek - sidebar'ı SOLA, içerik alanını SAĞA
// yan yana (row yönünde) diziyor. Tailwind'de flex class'ı display:flex ile
// aynı şey, sadece CSS dosyasına yazmak yerine HTML'e class olarak ekliyoruz.
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, ToastComponent],
  template: `
    <div class="flex min-h-screen bg-bg">
      <app-sidebar></app-sidebar>
      <!-- flex-1: kalan tüm genişliği kapla (sidebar sabit 240px, bu esnek) -->
      <main class="flex-1 min-w-0 p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
    <app-toast></app-toast>
  `,
})
export class AppComponent {
  title = 'cms-frontend';
}