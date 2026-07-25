const API_BASE = "https://provoking-dork-purchase.ngrok-free.dev/rest/api/posts";

function slugify(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(options.headers || {}),
    },
  });
  return response;
}

function toEntry(post) {
  if (!post) return null;
  
  const entryData = {
    title: post.title || "",
    body: post.body || "",
    author: post.author || "",
  };
  const jsonString = JSON.stringify(entryData);
  const cleanSlug = post.slug || `post-${Date.now()}`;

  return {
    slug: cleanSlug,
    file: { path: `posts/${cleanSlug}.json` },
    path: `posts/${cleanSlug}.json`,
    data: jsonString,
    raw: jsonString,
  };
}

class MyCustomBackend {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
  }

  // ---- Auth (test amaçlı, gerçek login yok) ----
  authComponent() {
    return function (props) {
      return window.h(
        "button",
        {
          type: "button",
          onClick: function (e) {
            e.preventDefault();
            props.onLogin({ email: "admin@localhost" });
          },
          style: { padding: "10px", margin: "20px", cursor: "pointer", fontSize: "16px" },
        },
        "Sisteme Giriş Yap (Test)",
      );
    };
  }

  async authenticate(state) {
    return { email: state.email || "admin@localhost" };
  }
  async restoreUser(user) {
    return user;
  }
  async logout() {
    return null;
  }
  async getToken() {
    return "test-token";
  }
  async currentUser() {
    return { email: "admin@localhost" };
  }

  // Decap bazı yerlerde bu metodları da çağırıyor; implemente edilmezse
  // sessiz hatalar / tekrar tekrar deneme davranışına yol açabiliyor.
  isGitBackend() {
    return false;
  }
  async status() {
    return { auth: { status: true }, api: { status: true } };
  }
  async unpublishedEntry() {
    // Editorial workflow kullanmıyoruz -> her zaman "taslak yok" dönüyoruz.
    return null;
  }
  async unpublishedEntries() {
    return [];
  }
  async entriesByFiles(files) {
    return [];
  }
  async traverseCursor() {
    return { entries: [], cursor: null };
  }

  // 1. Tüm yazıları listele (GET)
  async entriesByFolder(collection, extension, depth) {
    const response = await apiFetch("/list", { method: "GET" });
    if (!response.ok) {
      throw new Error("Veriler listelenirken sunucu hatası oluştu.");
    }
    const posts = await response.json();
    return posts.map(toEntry);
  }

  // 2. Tekil kayıt (Decap'in listede tıklanan entry'yi açması)
  // ÖNEMLİ: Decap CMS bu fonksiyonu (collection, slug) ile DEĞİL, TEK parametreyle,
  // doğrudan dosya yolu (path) ile çağırıyor: this.implementation.getEntry(path)
  // (bkz. decap-cms-core/src/backend.ts). Yanlış imza yüzden "slug" hep undefined
  // geliyor ve kayıt hiç bulunamıyordu.
  async getEntry(path) {
    const match = /(?:^|\/)posts\/(.+?)(?:\.json)?$/.exec(path || "");
    const slug = match ? match[1] : path;

    if (!slug) {
      throw new Error("Kayıt bulunamadı.");
    }

    const response = await apiFetch(`/slug/${encodeURIComponent(slug)}`, { method: "GET" });
    if (!response.ok) {
      throw new Error("Kayıt bulunamadı.");
    }
    const postData = await response.json();
    return toEntry(postData);
  }

  async getMedia(folderPath) {
    return [];
  }

  async getMediaDisplayURL(key) {
    if (typeof key === "object" && key !== null) {
      return key.url || key.path || "";
    }
    return key || "";
  }

  async persistMedia(fileObj, options = {}) {
    console.log("Medya yükleniyor:", bigFile);
    const file = bigFile.file || bigFile;
    const url = file instanceof Blob ? URL.createObjectURL(file) : (file.url || "");
    
    const mediaItem = {
      id: file.name || `media-${Date.now()}`,
      name: file.name || "photo.jpg",
      size: file.size || 0,
      path: `uploads/${file.name || "photo.jpg"}`,
      url: url,
      displayURL: url,
      file: file
    };

    if (!this.mediaList) this.mediaList = [];
    
    const existingIndex = this.mediaList.findIndex(m => m.name === mediaItem.name);
    if (existingIndex >= 0) {
      this.mediaList[existingIndex] = mediaItem;
    } else {
      this.mediaList.push(mediaItem);
    }

    return mediaItem;
  }

  async deleteMedia(path) {
    return true;
  }

  async deleteFiles(paths, commitMessage) {
    const postPaths = (paths || []).filter((p) => typeof p === "string" && p.includes("posts/"));

    await Promise.all(
      postPaths.map((p) => {
        const match = /(?:^|\/)posts\/(.+?)(?:\.json)?$/.exec(p);
        const slug = match ? match[1] : p;
        return apiFetch(`/slug/${encodeURIComponent(slug)}`, { method: "DELETE" }).catch(() => null);
      }),
    );
  }

  // 3. Kaydet / Yayınla (Publish) butonu
  // ÖNEMLİ: Decap "New Post" oluştururken entry.slug'ı DAHA BACKEND'E SORMADAN,
  // başlıktan (title) türeterek client tarafında üretir ve editör bu slug ile açılır.
  // Bizim eski kodumuz backend'in ürettiği auto-increment ID'yi "yeni slug" olarak
  // geri döndürüyordu; Decap ise hâlâ eski (client) slug'a bağlı kalıp o slug'ı tekrar
  // tekrar yüklemeye (getEntry) çalışıyor, backend'de bulamayınca hata alıyor ve bu
  // tekrar deneme "infinite loop" gibi görünüyordu. Çözüm: slug hiçbir zaman değişmiyor;
  // backend de kimliği (id yerine) bu slug üzerinden yönetiyor.
  async persistEntry(entry, options) {
    const rawJsonString = entry.dataFiles[0].raw;
    const postData = JSON.parse(rawJsonString);

    // Decap'in ürettiği slug varsa onu kullan, yoksa (garanti olsun diye) başlıktan üret.
    let slug = entry.slug || entry.dataFiles[0].slug;
    if (!slug) {
      slug = slugify(postData.title) || `post-${Date.now()}`;
    }

    // Bu slug backend'de zaten var mı? Varsa güncelle (PUT), yoksa oluştur (POST).
    const existingResponse = await apiFetch(`/slug/${encodeURIComponent(slug)}`, { method: "GET" });

    let savedPost;
    if (existingResponse.ok) {
      const updateResponse = await apiFetch(`/slug/${encodeURIComponent(slug)}`, {
        method: "PUT",
        body: JSON.stringify(postData),
      });
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => null);
        throw new Error(errorData?.exception?.message || "Güncelleme reddedildi.");
      }
      savedPost = await updateResponse.json();
    } else {
      const createResponse = await apiFetch("/create-post", {
        method: "POST",
        body: JSON.stringify({ ...postData, slug }),
      });
      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => null);
        throw new Error(errorData?.exception?.message || "Sunucu işlemi reddetti.");
      }
      savedPost = await createResponse.json();
    }

    return toEntry(savedPost);
  }
}

CMS.registerBackend("my-custom-backend", MyCustomBackend);