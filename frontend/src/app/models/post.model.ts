// Bu dosya, backend'in bir Post için GERÇEKTE ne gönderdiğini tarif eder.
// "interface" bir Java/Spring interface'i gibi değil - burada sadece
// "bu objede hangi alanlar var, tipleri ne" diye bir şablon. Çalışma
// zamanında hiçbir kontrol yapmaz, sadece TypeScript'e (ve bize) yardımcı olur.

// Backend'de artık DRAFT/PUBLISHED büyük harfle geliyor (eskiden küçük harfti)
export type PostStatus = 'DRAFT' | 'PUBLISHED';

export type Language = 'TR' | 'EN' | 'DE' | 'RU';

// Bir post'un bağlı olduğu koleksiyon (kategori) - backend'deki
// CollectionSummaryDto'nun karşılığı
export interface CollectionSummary {
  id: number;
  name: string;
  slug: string;
}

// Serbest etiket - backend'deki TagSummaryDto'nun karşılığı
export interface TagSummary {
  id: number;
  name: string;
  slug: string;
}

// Post içeriğine eklenmiş (kapak HARİÇ) bir görsel
export interface PostMediaItem {
  mediaId: number;
  url: string;
  caption?: string;
  sortOrder: number;
}

// SEO alanları - backend zaten fallback uygulayıp DOLU gönderiyor,
// biz burada hiçbir hesaplama yapmıyoruz, direkt gösteriyoruz.
export interface PostSeo {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl?: string;
  canonicalUrl: string;
  noIndex: boolean;
}

// Backend'den GET ile geldiğinde bir Post'un tam hali
export interface Post {
  id: number;
  slug: string;
  title: string;
  image?: string; // kapak görseli - backend zaten tam URL olarak gönderiyor
  content: string;
  status: PostStatus;
  language: Language;
  collections: CollectionSummary[];
  tags: TagSummary[];
  media: PostMediaItem[];
  seo: PostSeo;
  readingTimeMinutes: number;
  publishAt?: string; // zamanlanmış yayın tarihi, yoksa boş
  authorName: string;
  authorFullName?: string;
  authorAvatarUrl?: string;
  authorSlug?: string;
  createdAt: string;
  updatedAt: string;
}

// Bir Post OLUŞTURURKEN ya da GÜNCELLERKEN backend'e GÖNDERDİĞİMİZ veri.
// Yukarıdaki Post'tan farkı: id/authorName/createdAt gibi backend'in kendi
// hesapladığı alanlar burada YOK, sadece editörün girdiği alanlar var.
export interface PostPayload {
  slug: string;
  title: string;
  content: string;
  coverMediaId?: number;
  status?: string;
  language?: string;
  collectionIds?: number[];
  tagNames?: string[];
  media?: { mediaId: number; caption?: string }[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImageUrl?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
  };
  publishAt?: string;
}