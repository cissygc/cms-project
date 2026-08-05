import { CanDeactivateFn } from '@angular/router';

// Herhangi bir component'in "canDeactivate()" adında bir metodu olması
// yeterli - bu guard sadece o metodu çağırıp sonucunu Router'a döner.
// PostEditorComponent bu metodu implemente ediyor: kaydedilmemiş değişiklik
// yoksa direkt true döner, varsa bir onay modalı açıp kullanıcının seçimini
// (kaydet/kaydetme/vazgeç) bekleyen bir Promise<boolean> döner.
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  return component.canDeactivate();
};