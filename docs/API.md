# Revlo CMS — API Documentation

> 💡 Bu dosya elle yazılmış özet dokümantasyondur. Backend ayaktayken
> **canlı, interaktif ve her zaman güncel** dokümantasyon için Swagger UI'ı
> kullan: `http://localhost:8080/swagger-ui.html` (OpenAPI JSON: `/v3/api-docs`).

Tüm istekler `Content-Type: application/json` bekler (medya yükleme hariç,
o `multipart/form-data` kullanır). Kimlik doğrulama gerektiren uç noktalarda
`Authorization: Bearer <token>` header'ı gönderilmelidir.

Hata yanıtları tek tip formattadır:

```json
{
  "status": 400,
  "exception": {
    "message": "Açıklayıcı hata mesajı",
    "createTime": "...",
    "path": "..."
  }
}
```

---

## Auth — `/api/auth`

| Method | Path | Erişim | Açıklama |
|---|---|---|---|
| POST | `/api/auth/signin` | Herkese açık | Kullanıcı adı + şifre ile giriş, JWT döner |
| POST | `/api/auth/signup` | Sadece ADMIN | Yeni kullanıcı (EDITOR veya ADMIN) oluşturur |

**POST /api/auth/signin**
```json
// Request
{ "username": "admin", "password": "••••••" }

// Response
{ "token": "eyJ...", "type": "Bearer", "username": "admin", "role": "ADMIN" }
```

**POST /api/auth/signup** *(Authorization: Bearer &lt;admin-token&gt; gerekli)*
```json
// Request
{ "username": "yeni-editor", "password": "en-az-4-karakter", "role": "EDITOR" }

// Response
{ "message": "Kullanıcı başarıyla oluşturuldu." }
```

---

## Posts (CMS) — `/api/entries/posts`

JWT gerekli. EDITOR sadece kendi yazılarını görür/düzenler/siler, ADMIN tüm yazılara erişir.

| Method | Path | Açıklama |
|---|---|---|
| GET | `/api/entries/posts` | Yazıları listeler |
| GET | `/api/entries/posts/{slug}` | Tek yazı detayı |
| POST | `/api/entries/posts` | Yeni yazı oluşturur |
| PUT | `/api/entries/posts/{slug}` | Yazıyı günceller |
| DELETE | `/api/entries/posts/{slug}` | Yazıyı siler |

**Post gövdesi (POST / PUT)**
```json
{
  "slug": "ilk-yazim",
  "title": "İlk Yazım",
  "image": "https://.../uploads/xyz.jpg",
  "content": "Markdown içerik..."
}
```

---

## Public Posts — `/api/public/posts`

Herkese açık, JWT **gerekmez**. Harici sitelerin/uygulamaların içerik çekmesi içindir.

| Method | Path | Açıklama |
|---|---|---|
| GET | `/api/public/posts` | Tüm yazıları listeler |
| GET | `/api/public/posts/{slug}` | Slug ile tek yazı |

---

## Media — `/api/media`

JWT gerekli.

| Method | Path | Açıklama |
|---|---|---|
| POST | `/api/media` | Dosya yükler (`multipart/form-data`, alan adı: `file`) |
| GET | `/api/media` | Giriş yapan kullanıcının medyalarını listeler |
| DELETE | `/api/media/{id}` | Medyayı siler |

---

## Users — `/api/users`

Sadece **ADMIN**.

| Method | Path | Açıklama |
|---|---|---|
| GET | `/api/users` | Tüm kullanıcıları (şifre hariç) + yazı sayılarını listeler |
| DELETE | `/api/users/{id}` | Kullanıcıyı siler |

**GET /api/users — Response**
```json
[
  { "id": 1, "username": "admin", "role": "ADMIN", "postCount": 4 },
  { "id": 2, "username": "yeni-editor", "role": "EDITOR", "postCount": 0 }
]
```

**DELETE /api/users/{id}** aşağıdaki durumlarda `400` döner:
- Kendi hesabınızı silmeye çalışıyorsanız
- Sistemdeki son ADMIN'i silmeye çalışıyorsanız
- Kullanıcının hâlâ yazısı veya medyası varsa (önce onlar silinmeli/aktarılmalı)

---

## Dashboard — `/api/dashboard/stats`

JWT gerekli.

| Method | Path | Açıklama |
|---|---|---|
| GET | `/api/dashboard/stats` | Özet istatistikler + son 5 içerik |

- **ADMIN** için: sistemdeki toplam post/medya/kullanıcı sayısı ve en son eklenen 5 yazı (tüm kullanıcılar dahil).
- **EDITOR** için: sadece kendi post/medya sayısı ve kendi son 5 yazısı; `totalUsers` alanı `0` döner.

```json
{
  "totalPosts": 12,
  "totalMedia": 7,
  "totalUsers": 3,
  "recentPosts": [
    { "id": 12, "slug": "...", "title": "...", "image": "...", "content": "...",
      "authorName": "admin", "createdAt": "...", "updatedAt": "..." }
  ]
}
```
