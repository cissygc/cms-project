import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-toast></app-toast>
  `,
  styles: [
    `
      .main-content {
        min-height: calc(100vh - 64px);
        padding-bottom: 40px;
      }
    `,
  ],
})
export class AppComponent {
  title = 'cms-frontend';
}
