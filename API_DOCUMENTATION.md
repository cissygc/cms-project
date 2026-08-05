# Revlo CMS — API Dokümantasyonu

Base URL (geliştirme): `http://localhost:8080`

Sunucu çalışırken canlı/interaktif dokümantasyon için: **`/swagger-ui.html`**

---

## İçindekiler

- [Genel Kurallar](#genel-kurallar)
- [Kimlik Doğrulama](#1-auth--kimlik-doğrulama)
- [Kullanıcılar](#2-users--kullanıcılar)
- [Yazılar](#3-posts--yazılar)
- [Herkese Açık Yazı API'si](#4-public-posts--herkese-açık-yazı-apisi)
- [Koleksiyonlar](#5-collections--koleksiyonlar)
- [Etiketler](#6-tags--etiketler)
- [Medya](#7-media--medya)
- [Dashboard](#8-dashboard)
- [Hata Formatı](#hata-formatı)

---

## Genel Kurallar

### Kimlik doğrulama

`/api/public/**` ve `/api/auth/**` dışındaki **tüm** uç noktalar JWT gerektirir. Token,
`/api/auth/signin` yanıtından alınır ve her istekte şu şekilde gönderilir:

```
Authorization: Bearer <token>
```

Token geçerlilik süresi **24 saat**tir. Sunucu her yeniden başladığında imzalama anahtarı
yeniden üretilir — bu da o ana kadar verilmiş tüm token'ların geçersiz kaldığı anlamına gelir.

### Roller

- **EDITOR**: kendi içeriğini (yazı, medya) yönetebilir.
- **ADMIN**: EDITOR'ün yapabildiği her şeye ek olarak tüm kullanıcıların içeriğini görebilir/
  yönetebilir, kullanıcı/koleksiyon/etiket yönetimi yapabilir.

A�ağıdaki her uç nokta için "Yetki" satırı hangi rollerin erişebildiğini belirtir.

### Content-Type

Aksi belirtilmedikçe tüm istek/yanıtlar `application/json`. Medya yükleme
`multipart/form-data` kullanır.

---

## 1. Auth — Kimlik Doğrulama

Taban yol: `/api/auth`

### `POST /api/auth/signin`

Giriş yapar, JWT döner.

**Yetki:** Herkese açık (JWT gerekmez)

**İstek gövdesi:**
```json
{
  "username": "ceren",
  "password": "sifre123"
}
```

**Yanıt (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "username": "ceren",
  "role": "ADMIN"
}
```

**Hatalar:** Kullanıcı adı/şifre hatalıysa `401` — güvenlik amacıyla hangisinin yanlış
olduğu belirtilmez, her zaman aynı genel mesaj döner.

---

### `POST /api/auth/signup`

Yeni bir kullanıcı (editör veya admin) oluşturur.

**Yetki:** ADMIN

**İstek gövdesi:**
```json
{
  "username": "yeni_editor",
  "password": "en-az-4-karakter",
  "role": "EDITOR",
  "fullName": "Ayşe Yılmaz",
  "bio": "İçerik editörü (opsiyonel)",
  "avatarMediaId": 12,
  "slug": "ayse-yilmaz"
}
```

| Alan | Zorunlu mu | Not |
|---|---|---|
| `username` | ✅ | 3-20 karakter, sadece harf/rakam/`_`/`.` |
| `password` | ✅ | En az 4 karakter |
| `role` | opsiyonel | Gönderilmezse `EDITOR` |
| `fullName` | ✅ | 2-100 karakter |
| `bio` | opsiyonel | En fazla 2000 karakter |
| `avatarMediaId` | opsiyonel | Önce medya kütüphanesine yüklenmiş olmalı |
| `slug` | opsiyonel | Boşsa isimden otomatik üretilir |

**Yanıt (200):**
```json
{ "message": "Kullanıcı başarıyla oluşturuldu." }
```

> **Not:** Sistemde henüz hiç kullanıcı yoksa (ilk kurulum), bu uç nokta doğrudan Swagger
> UI veya Postman üzerinden çağrılarak ilk ADMIN hesabı oluşturulmalıdır.

---

## 2. Users — Kullanıcılar

Taban yol: `/api/users`

### `GET /api/users`

Tüm kullanıcıları listeler.

**Yetki:** ADMIN

**Query parametreleri:**

| Parametre | Tip | Varsayılan | Açıklama |
|---|---|---|---|
| `includeDeleted` | boolean | `false` | `true` ise soft-delete edilmiş kullanıcılar da listeye dahil olur |

**Yanıt (200):**
```json
[
  {
    "id": 1,
    "username": "ceren",
    "fullName": "Ceren Gürcan",
    "bio": "...",
    "avatarUrl": "https://.../uploads/xyz.png",
    "slug": "ceren-gurcan",
    "role": "ADMIN",
    "deleted": false,
    "postCount": 12
  }
]
```

---

### `DELETE /api/users/{id}`

Bir kullanıcıyı **soft-delete** eder (`deleted=true` olarak işaretlenir; kayıt silinmez).

**Yetki:** ADMIN

**Davranış:**
- Silinen kullanıcı artık giriş yapamaz.
- Yazdığı yazılar herkese açık API'de görünmeye **devam eder**.
- Varsayılan kullanıcı listesinde (`includeDeleted=false`) artık görünmez.
- Bir kullanıcı **kendi hesabını silemez**.

**Yanıt (200):** `{ "message": "Kullanıcı başarıyla silindi." }`

---

### `GET /api/users/me`

Giriş yapmış kullanıcının kendi profilini getirir.

**Yetki:** ADMIN veya EDITOR (herkes kendi profilini görebilir)

**Yanıt (200):** `GET /api/users` ile aynı şekildeki tek bir kullanıcı objesi.

---

### `PUT /api/users/me`

Giriş yapmış kullanıcının kendi profilini günceller. **Tüm alanlar opsiyoneldir** —
gönderilmeyen alan mevcut değerinde kalır.

**Yetki:** ADMIN veya EDITOR (herkes kendi profilini düzenleyebilir)

**İstek gövdesi:**
```json
{
  "fullName": "Yeni İsim",
  "bio": "Güncel biyografi",
  "avatarMediaId": 15,
  "slug": "yeni-slug",
  "username": "yeni_kullanici_adi",
  "newPassword": "yeni-sifre",
  "currentPassword": "mevcut-sifre"
}
```

**Önemli notlar:**
- Şifre değiştirmek için `newPassword` gönderiliyorsa, **`currentPassword` da zorunludur**
  (açık kalmış bir oturumdan şifre değiştirilmesini engellemek için).
- `username` değiştirilirse, mevcut JWT token eski kullanıcı adını taşımaya devam eder —
  kullanıcının **yeniden giriş yapması gerekir**.

**Yanıt (200):** Güncellenmiş kullanıcı objesi.

---

## 3. Posts — Yazılar

Taban yol: `/api/entries/posts`

Bu uç noktalar **CMS panelinin kendisi** için — herkese açık okuma için bkz.
[Public Posts](#4-public-posts--herkese-açık-yazı-apisi).

### `GET /api/entries/posts`

Yazıları listeler.

**Yetki:** ADMIN veya EDITOR
**Davranış:** EDITOR sadece **kendi** yazılarını görür; ADMIN **tüm** yazıları görür.

**Yanıt (200):** Aşağıdaki `PostResponseDto` şeklinin bir dizisi (bkz. altta).

---

### `GET /api/entries/posts/{slug}`

Tek bir yazının tüm detaylarını getirir.

**Yetki:** ADMIN veya EDITOR
**Davranış:** EDITOR sadece kendi yazısına erişebilir (başkasının yazısına erişmeye
çalışırsa `403`).

**Yanıt (200) — `PostResponseDto`:**
```json
{
  "id": 42,
  "slug": "ota-review-management",
  "title": "OTA Review Management Without the Friday Scramble",
  "image": "https://.../uploads/cover.jpg",
  "content": "Yazının markdown içeriği...\n\n![alt](https://.../img2.jpg)\n\ndevamı...",
  "status": "PUBLISHED",
  "language": "EN",
  "collections": [{ "id": 3, "name": "Otelcilik", "slug": "otelcilik" }],
  "tags": [{ "id": 8, "name": "reviews", "slug": "reviews" }],
  "media": [
    { "mediaId": 21, "url": "https://.../img2.jpg", "caption": "Ekran görüntüsü", "sortOrder": 0 }
  ],
  "seo": {
    "metaTitle": "...",
    "metaDescription": "...",
    "ogImageUrl": "https://.../uploads/cover.jpg",
    "canonicalUrl": "https://revloai.com/en/blog/ota-review-management",
    "noIndex": false
  },
  "readingTimeMinutes": 4,
  "publishAt": null,
  "authorName": "ceren",
  "authorFullName": "Ceren Gürcan",
  "authorAvatarUrl": "https://.../uploads/avatar.png",
  "authorSlug": "ceren-gurcan",
  "createdAt": "2026-07-20T10:00:00",
  "updatedAt": "2026-08-01T14:22:00"
}
```

---

### `POST /api/entries/posts`

Yeni bir yazı oluşturur.

**Yetki:** ADMIN veya EDITOR

**İstek gövdesi — `PostRequestDto`:**
```json
{
  "slug": "yeni-yazi",
  "title": "Yazı Başlığı",
  "content": "İçerik metni (markdown)",
  "coverMediaId": 5,
  "status": "DRAFT",
  "language": "TR",
  "collectionIds": [1, 3],
  "tagNames": ["yapay-zeka", "otelcilik"],
  "media": [{ "mediaId": 21, "caption": "opsiyonel açıklama" }],
  "seo": {
    "metaTitle": "opsiyonel",
    "metaDescription": "opsiyonel",
    "ogImageUrl": "opsiyonel",
    "canonicalUrl": "opsiyonel",
    "noIndex": false
  },
  "publishAt": "2026-08-10T09:00:00"
}
```

| Alan | Zorunlu mu | Not |
|---|---|---|
| `slug` | ✅ | Küçük harf, rakam, tire — örn. `merhaba-dunya` |
| `title` | ✅ | En fazla 300 karakter |
| `content` | ✅ | — |
| `coverMediaId` | opsiyonel | Yoksa yazı kapaksız kalır |
| `status` | opsiyonel | Yoksa `DRAFT` |
| `language` | opsiyonel | Yoksa `TR` — `TR`/`EN`/`DE`/`RU` |
| `collectionIds` | opsiyonel | — |
| `tagNames` | opsiyonel | Var olmayan isim otomatik oluşturulur (find-or-create) |
| `media` | opsiyonel | Kapak HARİÇ, içerik içi ek görseller. Sıra = gösterim sırası |
| `seo` | opsiyonel | Boş bırakılan her alan otomatik fallback alır |
| `publishAt` | opsiyonel | `LocalDateTime` formatında (**saat dilimi EKLEMEYİN** — örn. `2026-08-10T09:00:00`, sonunda `Z` OLMAMALI). Doluysa ve `status=DRAFT` ise, bu tarih geldiğinde otomatik `PUBLISHED`'e çevrilir |

**Yanıt (200):** Oluşturulan yazının `PostResponseDto`'su.

---

### `PUT /api/entries/posts/{slug}`

Mevcut bir yazıyı günceller. `{slug}` yolda **eski** slug'dır; gövdedeki `slug` alanı
**yeni** slug olabilir (slug değiştirme desteklenir).

**Yetki:** ADMIN veya EDITOR (EDITOR sadece kendi yazısını güncelleyebilir)

**"Gönderilmezse dokunma" davranışı** — aşağıdaki alanlar **null/eksik gönderilirse mevcut
değer korunur**, sadece **boş dizi `[]`** gönderilirse bilerek temizlenir:

- `collectionIds`: `null` = korunur, `[]` = tüm koleksiyonlardan çıkarılır
- `tagNames`: `null` = korunur, `[]` = tüm etiketler kaldırılır
- `media`: `null` = korunur, `[]` = tüm içerik görselleri kaldırılır
- `coverMediaId`: `null` = kapak **korunur**. Kapağı bilerek kaldırmak için ayrıca
  `"removeCover": true` göndermek gerekir.

Diğer tüm alanlar (title, content, status, language, seo, publishAt) her zaman gönderilen
değerle **doğrudan üzerine yazılır**.

**Yanıt (200):** Güncellenmiş yazının `PostResponseDto`'su.

---

### `DELETE /api/entries/posts/{slug}`

Bir yazıyı kalıcı olarak siler.

**Yetki:** ADMIN veya EDITOR (EDITOR sadece kendi yazısını silebilir)

**Yanıt (200):** `{ "message": "Yazı başarıyla silindi." }`

---

## 4. Public Posts — Herkese Açık Yazı API'si

Taban yol: `/api/public/posts`

Bu uç noktalar **JWT gerektirmez** — halka açık blog sitesinin (revloai.com/tr/blog)
kullanması içindir. Sadece `status=PUBLISHED` olan yazıları döner.

### `GET /api/public/posts`

**Query parametreleri (ikisi de opsiyonel):**

| Parametre | Açıklama |
|---|---|
| `language` | örn. `TR` — sadece o dildeki yazıları filtreler |
| `collection` | koleksiyon **slug**'ı — sadece o koleksiyondaki yazıları filtreler |

**Yanıt (200):** `PostResponseDto` dizisi (yukarıdaki şekille aynı).

### `GET /api/public/posts/{slug}`

Tek bir yayında yazının detayını getirir (yazı yayında değilse `404`).

---

## 5. Collections — Koleksiyonlar

Taban yol: `/api/collections`

Koleksiyonlar admin tarafından yönetilen **sabit kategori** sistemi (örn. "Otelcilik",
"Ürün Güncellemeleri"). Etiketlerden farkı: serbestçe oluşturulamaz, sadece admin
tanımlayabilir.

### `GET /api/collections`

**Yetki:** ADMIN veya EDITOR (post yazarken seçim yapabilmesi için)

**Yanıt (200):**
```json
[{ "id": 1, "name": "Otelcilik", "slug": "otelcilik", "postCount": 8 }]
```

### `POST /api/collections`

**Yetki:** ADMIN

**İstek gövdesi:**
```json
{ "name": "Yeni Koleksiyon", "slug": "opsiyonel-yoksa-otomatik-uretilir" }
```

**Yanıt (200):** Oluşturulan koleksiyon.

### `DELETE /api/collections/{id}`

**Yetki:** ADMIN

**Davranış:** İçinde **hiçbir yazı yoksa** direkt silinir. İçinde yazı **varsa** silme
**engellenir** ve kaç yazı olduğunu belirten bir hata döner — önce o yazıların
koleksiyondan çıkarılması (ya da başka koleksiyona taşınması) gerekir. Bu uç noktanın
zorla-sil (force) seçeneği yoktur.

---

## 6. Tags — Etiketler

Taban yol: `/api/tags`

Etiketler serbest metin — editör yazı yazarken anında yeni bir etiket girebilir, sistemde
yoksa otomatik oluşturulur (**find-or-create**, büyük/küçük harf duyarsız). Bu yüzden ayrı
bir "etiket oluşturma" uç noktası **yoktur** — oluşturma, yazı kaydetme sırasında
(`POST`/`PUT /api/entries/posts`, `tagNames` alanı üzerinden) örtük olarak gerçekleşir.

### `GET /api/tags`

**Yetki:** ADMIN veya EDITOR

**Yanıt (200):**
```json
[{ "id": 8, "name": "reviews", "slug": "reviews", "postCount": 5 }]
```

### `DELETE /api/tags/{id}`

Etiketi siler. **Yazıların kendisi silinmez**, sadece o etiketten çıkarılırlar.

**Yetki:** ADMIN

**Query parametreleri:**

| Parametre | Tip | Varsayılan | Açıklama |
|---|---|---|---|
| `confirm` | boolean | `false` | İki aşamalı silme onayı için (aşağıya bakın) |

**İki aşamalı akış:**
1. `confirm=false` (ya da hiç gönderilmeden) çağrılır. Etiket hiçbir yazıda kullanılmıyorsa
   direkt silinir. Kullanılıyorsa **silinmez**, kaç yazıyı etkileyeceği bilgisiyle döner:
   ```json
   { "deleted": false, "affectedPostCount": 5, "message": "Bu etiket 5 yazıda kullanılıyor..." }
   ```
2. Kullanıcı onaylarsa aynı istek `confirm=true` ile tekrar gönderilir, bu sefer gerçekten
   siler:
   ```json
   { "deleted": true, "affectedPostCount": 5, "message": "Etiket silindi." }
   ```

---

## 7. Media — Medya

Taban yol: `/api/media`

### `POST /api/media`

Dosya yükler (`multipart/form-data`).

**Yetki:** ADMIN veya EDITOR

**Form alanı:** `file` (görsel dosyası)

**Kısıtlar:** Maksimum 10 MB, sadece görsel dosya tipleri kabul edilir.

**Yanıt (200):**
```json
{
  "id": "42",
  "name": "cover-image.jpg",
  "url": "https://.../uploads/a1b2c3d4-cover-image.jpg",
  "size": 245678,
  "uploadedByUsername": "ceren",
  "uploadedByFullName": "Ceren Gürcan"
}
```
> Diskteki gerçek dosya adı isim çakışmasını önlemek için UUID önekli tutulur; `url` alanı
> yine de orijinal görünür isimle birlikte tam erişilebilir bir bağlantı döner.

### `GET /api/media`

**Yetki:** ADMIN veya EDITOR
**Davranış:** EDITOR sadece **kendi yüklediği** medyayı görür. ADMIN **tüm kullanıcıların**
medyasını görür (her öğede `uploadedByUsername`/`uploadedByFullName` doludur).

**Yanıt (200):** `MediaResponseDto` dizisi (yukarıdaki şekille aynı).

### `DELETE /api/media/{id}`

**Yetki:** ADMIN veya EDITOR (EDITOR sadece kendi medyasını silebilir)

**Davranış:** Bir yazının **kapak görseli**, **içerik görseli** ya da bir kullanıcının
**avatarı** olarak kullanılan medya **silinemez** (önce ilişkili yerden kaldırılması
gerekir) — bu bir hata olarak döner, sessizce yoksayılmaz.

**Yanıt (200):** `{ "message": "Medya başarıyla silindi." }`

---

## 8. Dashboard

Taban yol: `/api/dashboard`

### `GET /api/dashboard/stats`

**Yetki:** ADMIN veya EDITOR

**Davranış:** EDITOR sadece kendi istatistiklerini görür; ADMIN sistemin genelini görür.

**Yanıt (200):**
```json
{
  "totalPosts": 24,
  "totalMedia": 57,
  "totalUsers": 4,
  "recentPosts": [ /* PostResponseDto dizisi, en yeni birkaç yazı */ ]
}
```
> `totalUsers` sadece ADMIN için doldurulur, EDITOR için her zaman `0` döner.

---

## Hata Formatı

Tüm hatalar aynı zarf (envelope) içinde döner:

```json
{
  "status": 400,
  "exception": {
    "message": "Bu isimde bir koleksiyon zaten var",
    "createTime": "2026-08-05T10:00:00.000+00:00",
    "hostName": "...",
    "path": "uri=/api/collections"
  }
}
```

| HTTP Kodu | Anlamı |
|---|---|
| `400` | İş kuralı ihlali veya validasyon hatası — `exception.message` neyin yanlış olduğunu söyler |
| `401` | Giriş bilgisi hatalı veya token yok/geçersiz/süresi dolmuş |
| `403` | Yetkisiz erişim (örn. EDITOR başkasının yazısına erişmeye çalışıyor) |
| `500` | Beklenmeyen sunucu hatası — `exception.message` genel bir mesajdır, ayrıntı sunucu loglarındadır |
