# Revlo CMS

Revlo AI şirketinin blog sistemi (revloai.com/tr/blog) için geliştirilen özel içerik yönetim
sistemi (CMS). Angular tabanlı bir yönetim paneli ve Spring Boot tabanlı bir REST API'den oluşur.

Proje, Decap CMS ile başlayıp zamanla tam özellikli bir CMS'e dönüştürülmüştür.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
  - [Backend](#backend-kurulumu)
  - [Frontend](#frontend-kurulumu)
- [Roller ve Yetkiler](#roller-ve-yetkiler)
- [Veri Modeli Özeti](#veri-modeli-özeti)
- [Bilinen Kısıtlar / Kasıtlı Kararlar](#bilinen-kısıtlar--kasıtlı-kararlar)
- [API Dokümantasyonu](#api-dokümantasyonu)

---

## Özellikler

- **Yazı yönetimi**: taslak/yayın akışı, zamanlanmış yayın, çoklu dil (TR/EN/DE/RU)
- **Koleksiyonlar**: admin tarafından yönetilen sabit kategori sistemi
- **Etiketler**: editörün serbestçe eklediği, otomatik oluşan (find-or-create) etiketler
- **Medya kütüphanesi**: yükleme, panodan yapıştırarak yükleme (Ctrl+V), kırpma, admin için
  tüm kullanıcıların medyalarını görme
- **Zengin içerik editörü**: markdown tabanlı araç çubuğu (kalın, italik, başlık, liste, alıntı,
  kod bloğu, link, yatay çizgi), içerik akışının içine satır arasına görsel ekleme
- **SEO alanları**: meta başlık/açıklama, OG görseli, canonical URL, noindex — hepsi opsiyonel,
  boş bırakılırsa otomatik fallback uygulanır
- **Kapak görseli + çoklu medya**: yazı başına bir kapak, içerik içinde sınırsız ek görsel
- **Editör profilleri**: ad, biyografi, avatar, özel URL (slug), kullanıcı adı/şifre değişimi
- **Kapsamlı filtreleme**: durum, dil, koleksiyon, etiket ve (admin için) yazara göre çoklu
  seçim filtreleme, arama, sıralama
- **Rol tabanlı yetkilendirme**: ADMIN / EDITOR
- **Herkese açık okuma API'si**: giriş yapmadan (JWT'siz) erişilebilen, public blog'un
  kullanacağı salt-okunur uç noktalar

---

## Teknoloji Yığını

### Backend
- **Java 21**, **Spring Boot** (Spring Web, Spring Data JPA, Spring Security)
- **PostgreSQL**
- **JWT** (jjwt) ile kimlik doğrulama
- **springdoc-openapi** (Swagger UI) — çalışan sunucuda `/swagger-ui.html` üzerinden canlı
  API dokümantasyonu
- **Lombok**

### Frontend
- **Angular 19** (standalone component'ler, sinyal tabanlı state)
- **Tailwind CSS v4**
- Yerleşik markdown önizleme, kırpma ve panodan-yapıştırma gibi özellikler için üçüncü parti
  kütüphane kullanılmadan (vanilla canvas/clipboard API) yazılmıştır

---

## Proje Yapısı

```
cms-project/
├── backend/
│   └── revlo-cms-backend/
│       ├── src/main/java/com/example/
│       │   ├── controller/        # REST endpoint'leri (arayüz + impl)
│       │   ├── service/           # İş mantığı (arayüz + impl)
│       │   ├── entity/            # JPA entity'leri
│       │   ├── repository/        # Spring Data repository'leri
│       │   ├── dto/               # İstek/yanıt DTO'ları (paket başına gruplu)
│       │   ├── security/          # JWT + Spring Security yapılandırması
│       │   ├── scheduler/         # Zamanlanmış yayın (PostPublishScheduler)
│       │   └── handler/           # Global exception handling
│       └── src/main/resources/
│           └── application.properties
└── frontend/
    └── src/app/
        ├── pages/                 # Sayfa component'leri (dashboard, posts-list, post-editor, ...)
        ├── components/            # Paylaşılan component'ler (sidebar, badge, media-picker-modal, ...)
        ├── services/              # HTTP servisleri
        ├── models/                # TypeScript arayüzleri (backend DTO'larının karşılığı)
        └── guards/                # Route guard'ları (auth, admin, kaydedilmemiş değişiklik)
```

---

## Kurulum

### Backend Kurulumu

**Gereksinimler:** Java 21, Maven, PostgreSQL

1. PostgreSQL'de bir veritabanı ve şema oluşturun:
   ```sql
   CREATE DATABASE cms;
   CREATE SCHEMA cms;
   ```
2. `backend/revlo-cms-backend/src/main/resources/application.properties` dosyasındaki
   veritabanı bağlantı bilgilerini kendi ortamınıza göre düzenleyin:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/cms
   spring.datasource.username=postgres
   spring.datasource.password=12345
   spring.jpa.hibernate.ddl-auto=update
   site.public-base-url=https://revloai.com
   ```
   > `ddl-auto=update` geliştirme ortamı için uygundur; canlıya alırken migration
   > aracı (Flyway/Liquibase) kullanmanız önerilir.
3. Projeyi çalıştırın:
   ```bash
   cd backend/revlo-cms-backend
   ./mvnw spring-boot:run
   ```
4. Sunucu varsayılan olarak `http://localhost:8080` üzerinde çalışır.
   Swagger UI: `http://localhost:8080/swagger-ui.html`

**JWT hakkında not:** İmzalama anahtarı her sunucu başlangıcında rastgele üretilir
(`JwtUtils`), yani **sunucu her yeniden başlatıldığında mevcut tüm token'lar geçersiz olur**
— kullanıcıların yeniden giriş yapması gerekir. Token geçerlilik süresi 24 saattir.

### Frontend Kurulumu

**Gereksinimler:** Node.js, npm

1. Bağımlılıkları kurun:
   ```bash
   cd frontend
   npm install
   ```
2. `src/app/config.ts` içindeki `API_CONFIG.baseUrl` değerinin backend adresinizle
   eşleştiğinden emin olun (varsayılan: `http://localhost:8080`).
3. Geliştirme sunucusunu başlatın:
   ```bash
   ng serve
   ```
4. Tarayıcıda `http://localhost:4200` adresini açın.

**İlk kullanıcı:** Sistemde henüz kullanıcı yoksa, `/api/auth/signup` uç noktasına doğrudan
(Swagger UI veya Postman ile) bir ADMIN kullanıcısı oluşturarak başlayın — panelden kullanıcı
oluşturma zaten ADMIN yetkisi gerektirdiği için "ilk admin"i API üzerinden elle oluşturmak
gerekir.

---

## Roller ve Yetkiler

| Yetenek | EDITOR | ADMIN |
|---|---|---|
| Kendi yazılarını oluşturma/düzenleme/silme | ✅ | ✅ |
| Başkalarının yazılarını görme/düzenleme | ❌ | ✅ |
| Kendi medyasını yönetme | ✅ | ✅ |
| Tüm kullanıcıların medyasını görme/silme | ❌ | ✅ |
| Koleksiyon oluşturma/silme | ❌ | ✅ |
| Etiket silme | ❌ | ✅ |
| Kullanıcı oluşturma/silme, tüm kullanıcıları listeleme | ❌ | ✅ |
| Kendi profilini düzenleme (ad, bio, avatar, şifre) | ✅ | ✅ |

Yazı/etiket oluşturma ve koleksiyon/etiket **listeleme** her iki role de açıktır (editörün
post yazarken koleksiyon seçebilmesi ve etiket girebilmesi gerekiyor).

---

## Veri Modeli Özeti

- **User**: username, password (hash'li), fullName, bio, avatarMedia (→Media), slug, role
  (ADMIN/EDITOR), deleted (soft-delete)
- **Post**: slug, title, content, coverMedia (→Media), status (DRAFT/PUBLISHED), language,
  collections (→Collection, çoktan-çoğa), tags (→Tag, çoktan-çoğa), media (→PostMedia, sıralı
  ek görseller), SEO alanları, publishAt (zamanlanmış yayın), author (→User)
- **Collection**: name, slug — admin tarafından yönetilen sabit taksonomi
- **Tag**: name, slug — post kaydedilirken otomatik oluşan (find-or-create) serbest etiket
- **Media**: dosya kaydı, diskteki gerçek dosya adı (çakışma önleme için UUID önekli),
  yükleyen kullanıcı
- **PostMedia**: Post ↔ Media ara tablosu (kapak HARİÇ, içerik içi görseller), sıra ve
  opsiyonel açıklama (caption) taşır

---

## Bilinen Kısıtlar / Kasıtlı Kararlar

Bunlar eksiklik değil, bilinçli kapsam kararlarıdır:

- **Onay/inceleme akışı yok** — editör kendi yazısını doğrudan yayınlayabilir, admin onayı
  gerekmez. "Taslak" sadece "sonra devam et" anlamına gelir.
- **Versiyon geçmişi / audit log yok** — küçük ekip için gereksiz karmaşıklık olarak
  değerlendirildi, ihtiyaç doğarsa sonradan eklenebilir.
- **Kullanıcılar kendi hesaplarını silemez** — WordPress/Ghost geleneğine uyularak sadece
  ADMIN başka bir kullanıcıyı silebilir.
- **Koleksiyon silme, içinde yazı varsa engellenmez** — bunun yerine koleksiyon otomatik
  olarak o yazılardan çıkarılır (yazılara dokunulmaz), iki aşamalı onay istenir.
- **Halka açık blog sitesinin kendisi (revloai.com/tr/blog) bu repoda değildir** — burada
  sadece CMS paneli ve o sitenin tüketeceği herkese açık salt-okunur API
  (`/api/public/posts`) bulunur.

---

## API Dokümantasyonu

Tüm uç noktaların ayrıntılı listesi için **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**
dosyasına bakın. Sunucu çalışırken canlı ve interaktif dokümantasyon için Swagger UI
(`/swagger-ui.html`) de kullanılabilir.
