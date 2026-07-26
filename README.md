# Revlo CMS

**Headless içerik yönetim sistemi.** Klasik bir CMS gibi sayfa/tema üretmez;
amacı içerik üretimini tek bir merkezde toplayıp, REST API üzerinden farklı
istemcilere (web sitesi, mobil uygulama, masaüstü uygulaması vb.) aynı anda
servis etmektir.

Admin panel arayüzü olarak [Decap CMS](https://decapcms.org/) kullanılır;
Decap'in "custom backend" mekanizması sayesinde arayüz doğrudan bu projenin
Spring Boot API'sine JWT ile bağlanır.

---

## Features

- 🔐 **JWT tabanlı kimlik doğrulama** — stateless auth, rol bazlı yetkilendirme (ADMIN / EDITOR)
- 📝 **İçerik (Post) yönetimi** — oluşturma, güncelleme, silme, slug bazlı erişim
- 🖼️ **Medya yönetimi** — dosya yükleme, kullanıcı bazlı medya listesi
- 👥 **Kullanıcı yönetimi** — ADMIN yeni editör hesabı açabilir, tüm kullanıcıları
  görüntüleyebilir ve silebilir (kendi hesabını / son admini silmesine izin verilmez,
  yazısı veya medyası olan kullanıcı önce o kayıtlar temizlenmeden silinemez)
- 📊 **Dashboard** — toplam içerik/medya/kullanıcı sayısı ve son eklenen 5 içerik
  (EDITOR sadece kendi verilerini görür, ADMIN tüm sistemi görür)
- 🌍 **Public API** — kimlik doğrulama gerektirmeyen, herkese açık okuma uç noktaları
  (harici bir web sitesi veya mobil uygulama içerikleri buradan çeker)
- ✍️ **Decap CMS entegrasyonu** — markdown editör, özel görsel widget'ı, custom backend

## Architecture

```
┌─────────────────┐        JWT (Bearer)        ┌──────────────────────┐
│   Decap CMS      │ ─────────────────────────▶ │   Spring Boot API     │
│  (frontend/)      │ ◀───────────────────────── │ (backend/…-backend)  │
│  custom-backend.js│                             │                       │
└─────────────────┘                             │  Controller → Service │
                                                  │      → Repository     │
        ▲                                        │           → PostgreSQL│
        │ herkese açık okuma                     └──────────────────────┘
        │ (/api/public/**)
┌─────────────────┐
│  Diğer istemciler │  (web sitesi, mobil app, vs.)
└─────────────────┘
```

Backend katmanlı mimari izler: `controller` (arayüz + implementasyon ayrı) →
`service` → `repository` (Spring Data JPA). Güvenlik `SecurityConfig` +
`AuthTokenFilter` (JWT doğrulama) ile sağlanır. Hatalar `GlobalExceptionHandler`
üzerinden tek tip bir JSON formatında (`{ exception: { message, ... } }`) döner.

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA |
| Veritabanı | PostgreSQL |
| Kimlik doğrulama | JWT (jjwt) |
| Admin Panel | Decap CMS (custom backend ile) |
| Build | Maven |

## Installation

### Backend

```bash
cd backend/revlo-cms-backend
# src/main/resources/application.properties içinde DB bağlantı bilgilerini kendine göre düzenle
./mvnw spring-boot:run
```

Varsayılan olarak `8080` portunda ayağa kalkar.

### Frontend (Admin Panel)

`frontend/` klasörünü herhangi bir statik dosya sunucusundan servis et
(veya doğrudan `index.html`'i tarayıcıda aç). `custom-backend.js` içindeki
`BASE_URL` değişkeninin backend adresinle eşleştiğinden emin ol.

```js
// frontend/custom-backend.js
const BASE_URL = "https://your-backend-url";
```

İlk ADMIN kullanıcısını veritabanına elle eklemen gerekir (kayıt endpoint'i
sadece giriş yapmış bir ADMIN tarafından çağrılabilir — bkz. API bölümü).

## API

Detaylı uç nokta listesi için [`docs/API.md`](docs/API.md) dosyasına bakabilirsin.
Özet:

| Alan | Base Path | Erişim |
|---|---|---|
| Auth | `/api/auth` | signin herkese açık, signup sadece ADMIN |
| Posts | `/api/entries/posts` | JWT gerekli |
| Public Posts | `/api/public/posts` | herkese açık |
| Media | `/api/media` | JWT gerekli |
| Users | `/api/users` | sadece ADMIN |
| Dashboard | `/api/dashboard/stats` | JWT gerekli |

## Roadmap

Aşağıdaki başlıklar bir sonraki sürümler için planlanan, henüz geliştirilmemiş
özelliklerdir:

- [ ] Draft / Published içerik durumu
- [ ] Global search (başlık + slug)
- [ ] Dynamic Collections & Dynamic Fields
- [ ] İlişkisel içerik alanları (Relationships)
- [ ] GraphQL API
- [ ] Plugin sistemi
- [ ] Webhooks
- [ ] İçerik sürüm geçmişi (Version History)
- [ ] Çoklu dil desteği
- [ ] Özel alan tipleri (Custom Field Types)
- [ ] İstemci SDK'sı
