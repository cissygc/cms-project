// Backend'den GET ile geldiğinde bir medya dosyasının hali
export interface MediaItem {
  id: number | string;
  name: string;
  url: string;
  size?: number;
  // ADMIN tüm medyaları görebildiği için kimin yüklediği bilgisi de geliyor
  uploadedByUsername?: string;
  uploadedByFullName?: string;
}