import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Kullanım:
// <app-stat-card [value]="12" label="Yayınlanan Yazı">
//   <svg>...</svg>   <-- bu ikon <ng-content> ile component'in içine "aktarılıyor"
// </app-stat-card>
//
// "ng-content" ne demek?
// @Input() ile sadece basit DEĞERLER (metin, sayı) geçebiliyoruz. Ama bazen
// bir component'in içine tam bir HTML parçası (burada: ikon SVG'si) koymak
// istersin - Spring'de bir metoda parametre yerine bir "callback/closure"
// vermek gibi düşünebilirsin. Angular'da bunun karşılığı content projection:
// component'i KULLANDIĞIN yerde <app-stat-card> ... </app-stat-card> arasına
// ne yazarsan, component'in şablonundaki <ng-content></ng-content> tam o
// noktaya "ışınlanır". Böylece her sayfa kendi ikonunu seçebilir, kart
// tasarımının geri kalanı (kutu, gölge, sayı/etiket düzeni) sabit kalır.
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-4 bg-surface border border-border rounded-2xl p-5">
      <div class="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
        <ng-content></ng-content>
      </div>
      <div>
        <div class="text-2xl font-extrabold text-text-primary leading-none">{{ value }}</div>
        <div class="text-sm text-text-muted mt-1">{{ label }}</div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input({ required: true }) value: number | string = 0;
  @Input({ required: true }) label = '';
}