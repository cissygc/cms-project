import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Kullanım: <app-badge text="Yayında" tone="success" />
//
// "tone" adında bir @Input() alıyor - dışarıdan "success" | "warning" |
// "danger" | "neutral" verilir, component kendi içinde bunu hangi Tailwind
// class'ına çevireceğine karar verir. Böylece her sayfa "yeşil mi kırmızı mı"
// diye tekrar tekrar karar vermek zorunda kalmıyor, sadece anlamı söylüyor
// ("success", "danger"...) component görünümü hallediyor.
export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" [ngClass]="toneClasses">
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClasses"></span>
      {{ text }}
    </span>
  `,
})
export class BadgeComponent {
  // @Input() ile bu component'i kullanan sayfa "text" ve "tone" değerlerini geçiyor.
  @Input({ required: true }) text = '';
  @Input() tone: BadgeTone = 'neutral';

  // NOT: Buradaki "computed()" DEĞİL, normal bir getter kullanıyorum. Sebebi:
  // Angular'ın computed() fonksiyonu sadece içinde okunan başka SIGNAL'lerin
  // değişimini takip eder. "tone" burada klasik bir @Input() (yani düz bir
  // property, signal değil) - computed() içine koysaydım, tone SONRADAN
  // değişse bile (örn. bir post taslakken yayınlanınca) yeniden hesaplanmazdı,
  // ilk hesaplanan değerde donup kalırdı. Düz bir getter ise Angular her
  // "change detection" turunda otomatik tekrar çalıştırılır, bu yüzden
  // @Input() ile birlikte güvenle kullanılabilir.
  get toneClasses(): string {
    switch (this.tone) {
      case 'success':
        return 'bg-green-50 text-success';
      case 'warning':
        return 'bg-amber-50 text-warning';
      case 'danger':
        return 'bg-red-50 text-danger';
      default:
        return 'bg-gray-100 text-text-muted';
    }
  }

  get dotClasses(): string {
    switch (this.tone) {
      case 'success':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'danger':
        return 'bg-danger';
      default:
        return 'bg-text-muted';
    }
  }
}