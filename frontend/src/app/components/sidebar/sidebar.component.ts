import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Bu component, eskiden var olan yatay üst navbar'ın yerine geçen SOL SIDEBAR.
// Figma referansındaki yapıyı (üstte logo, ortada ikon+etiket menü, altta
// kullanıcı avatarı+çıkış) Revlo'nun açık tema + mor marka rengine göre uyarladık.
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 h-screen sticky top-0 flex flex-col bg-surface border-r border-border" *ngIf="authService.isLoggedIn()">

      <!-- Logo alanı - gerçek Revlo logosu, öncekinden daha büyük -->
      <div class="h-20 flex items-center px-6 border-b border-border">
        <a routerLink="/dashboard" class="flex items-end gap-2.5">
          <img src="assets/branding/revlo-logo.png" alt="Revlo" class="h-9 w-auto" />
          <span class="text-xs font-bold text-text-muted tracking-widest uppercase leading-none translate-y-[-3px]">CMS</span>
        </a>
      </div>

      <!-- "+ Yeni Yazı" butonu -->
      <div class="px-4 pt-5">
        <a routerLink="/posts/new"
           class="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary !text-white text-sm font-bold shadow-sm hover:bg-primary-dark hover:shadow-md transition-all">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span class="!text-white">Yeni Yazı</span>
        </a>
      </div>

      <!-- Ana navigasyon - ikonlar ve yazı öncekine göre belirgin şekilde
           kalınlaştırıldı (stroke-width 2.4, w-6 h-6), aktif/hover arka
           planları artık gerçekten görünür bir mor tonda. -->
      <nav class="px-4 pt-6 flex flex-col gap-1.5">
        <a routerLink="/dashboard"
           routerLinkActive="bg-primary !text-white shadow-sm"
           [routerLinkActiveOptions]="{ exact: true }"
           class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-text-primary hover:bg-primary-light transition-colors">
          <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Ana Sayfa
        </a>

        <a routerLink="/posts"
           routerLinkActive="bg-primary !text-white shadow-sm"
           class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-text-primary hover:bg-primary-light transition-colors">
          <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Yazılar
        </a>

        <a routerLink="/media"
           routerLinkActive="bg-primary !text-white shadow-sm"
           class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-text-primary hover:bg-primary-light transition-colors">
          <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 12V4.5A2.25 2.25 0 015.25 2.25h15A2.25 2.25 0 0122.5 4.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15.75z" />
          </svg>
          Medya Kütüphanesi
        </a>

        <a *ngIf="authService.isAdmin()"
           routerLink="/users"
           routerLinkActive="bg-primary !text-white shadow-sm"
           [routerLinkActiveOptions]="{ exact: true }"
           class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-text-primary hover:bg-primary-light transition-colors">
          <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          Kullanıcılar
        </a>

        <a *ngIf="authService.isAdmin()"
           routerLink="/collections"
           routerLinkActive="bg-primary !text-white shadow-sm"
           class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-text-primary hover:bg-primary-light transition-colors">
          <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-19.5 0v6a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-6m-19.5 0h19.5M4.5 9.75V6a2.25 2.25 0 012.25-2.25h6l3 3h5.25a2.25 2.25 0 012.25 2.25v.75" />
          </svg>
          Koleksiyonlar
        </a>

        <a *ngIf="authService.isAdmin()"
           routerLink="/tags"
           routerLinkActive="bg-primary !text-white shadow-sm"
           class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold text-text-primary hover:bg-primary-light transition-colors">
          <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
          Etiketler
        </a>
      </nav>

      <!-- Boşluğu yukarı it, alt kısmı sabitle -->
      <div class="flex-1"></div>

      <!-- Alt kısım: profil + çıkış - artık kendi kartı gibi, çıkış tam
           genişlikte belirgin bir buton (öncekinden çok daha büyük/görünür) -->
      <div class="p-4 border-t border-border space-y-3">
        <a routerLink="/profile" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg transition-colors">
          <img
            *ngIf="authService.avatarUrl()"
            [src]="authService.avatarUrl()"
            alt="Avatar"
            class="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div
            *ngIf="!authService.avatarUrl()"
            class="w-10 h-10 rounded-full bg-primary !text-white flex items-center justify-center font-bold text-base shrink-0"
          >
            {{ authService.username().substring(0, 1).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold text-text-primary truncate">{{ authService.username() }}</div>
            <div class="text-xs text-text-muted">Profili görüntüle</div>
          </div>
        </a>

        <button (click)="authService.logout()"
                class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border !text-danger text-sm font-bold hover:bg-danger hover:!text-white hover:border-danger transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  authService = inject(AuthService);
}