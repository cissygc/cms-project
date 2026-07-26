/* ============================================================
 * Revlo CMS - Custom Decap CMS Backend
 * ------------------------------------------------------------
 * Backend artık JWT tabanlı auth kullanıyor:
 *   - /api/auth/**      -> herkese açık (signin, signup)
 *   - /api/entries/**   -> JWT gerekli (Authorization: Bearer <token>)
 *   - /api/media/**     -> JWT gerekli (Authorization: Bearer <token>)
 *
 * Bu yüzden bu dosyada eskisinden farklı olarak:
 *   1) Gerçek bir kullanıcı adı / şifre login formu var (test butonu değil)
 *   2) /api/auth/signin çağrılıp dönen JWT saklanıyor
 *   3) Her API isteğine Authorization header'ı otomatik ekleniyor
 * ============================================================ */

// 🔧 Backend'inizin adresi buradan değişir (ngrok URL'niz değişirse SADECE burayı güncelleyin)
const BASE_URL = "https://provoking-dork-purchase.ngrok-free.dev";

const AUTH_URL = `${BASE_URL}/api/auth`;
const POSTS_URL = `${BASE_URL}/api/entries/posts`;
const MEDIA_URL = `${BASE_URL}/api/media`;

const STORAGE_KEY = "revlo-cms-user";

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

function toEntry(post) {
  const entryData = {
    title: post.title,
    body: post.content,
    author: post.authorName,
    image: post.image || "",
    date: post.createdAt || new Date().toISOString(),
  };
  const jsonString = JSON.stringify(entryData);
  return {
    slug: post.slug,
    file: { path: `posts/${post.slug}.json` },
    path: `posts/${post.slug}.json`,
    data: jsonString,
    raw: jsonString,
  };
}

// Backend'in GlobalExceptionHandler'ı hatayı { status, exception: { message } } şeklinde döndürüyor
async function extractErrorMessage(response, fallback) {
  try {
    const errorData = await response.json();
    return (errorData && errorData.exception && errorData.exception.message) || fallback;
  } catch (e) {
    return fallback;
  }
}

class MyCustomBackend {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
    this.mediaList = [];
    this.user = null;
  }

  // ---------- Ortak fetch yardımcıları ----------

  getAuthHeader() {
    if (this.user && this.user.token) {
      return { Authorization: `${this.user.type || "Bearer"} ${this.user.token}` };
    }
    return {};
  }

  // JSON gövdeli istekler için (posts CRUD)
  async apiFetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...this.getAuthHeader(),
        ...(options.headers || {}),
      },
    });
    return response;
  }

  // FormData (dosya) istekleri için — Content-Type'ı tarayıcı otomatik ayarlamalı
  async apiFetchForm(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "ngrok-skip-browser-warning": "true",
        ...this.getAuthHeader(),
        ...(options.headers || {}),
      },
    });
    return response;
  }

  // ---------- Kimlik doğrulama ----------

  authComponent() {
    return function (props) {
      let username = "";
      let password = "";

      return window.h(
        "form",
        {
          onSubmit: function (e) {
            e.preventDefault();
            props.onLogin({ username: username, password: password });
          },
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "24px",
            maxWidth: "320px",
            margin: "60px auto",
            fontFamily: "sans-serif",
          },
        },
        window.h("h2", { style: { margin: "0 0 8px 0" } }, "Revlo CMS Girişi"),
        props.error &&
          window.h(
            "div",
            { style: { color: "#c0392b", fontSize: "14px" } },
            props.error,
          ),
        window.h("input", {
          type: "text",
          name: "username",
          placeholder: "Kullanıcı adı",
          required: true,
          autoFocus: true,
          onChange: function (e) {
            username = e.target.value;
          },
          style: { padding: "10px", fontSize: "15px" },
        }),
        window.h("input", {
          type: "password",
          name: "password",
          placeholder: "Şifre",
          required: true,
          onChange: function (e) {
            password = e.target.value;
          },
          style: { padding: "10px", fontSize: "15px" },
        }),
        window.h(
          "button",
          {
            type: "submit",
            style: {
              padding: "10px",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "8px",
            },
          },
          "Giriş Yap",
        ),
      );
    };
  }

  async authenticate(state) {
    const response = await fetch(`${AUTH_URL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        username: state.username,
        password: state.password,
      }),
    });

    if (!response.ok) {
      const message = await extractErrorMessage(
        response,
        "Kullanıcı adı veya şifre hatalı.",
      );
      throw new Error(message);
    }

    const jwtResponse = await response.json();
    // jwtResponse: { token, type, username, role }
    const user = {
      username: jwtResponse.username,
      role: jwtResponse.role,
      token: jwtResponse.token,
      type: jwtResponse.type || "Bearer",
    };

    this.user = user;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      // localStorage kullanılamıyorsa sessizce geç
    }

    return user;
  }

  async restoreUser(user) {
    // Sayfa yenilendiğinde CMS, localStorage'da bulduğu kullanıcıyı buraya verir
    this.user = user;
    return user;
  }

  async currentUser() {
    if (this.user) return this.user;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.user = JSON.parse(stored);
        return this.user;
      }
    } catch (e) {
      // yoksay
    }
    return null;
  }

  async logout() {
    this.user = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // yoksay
    }
    return null;
  }

  async getToken() {
    return this.user ? this.user.token : null;
  }

  isGitBackend() {
    return false;
  }

  async status() {
    return { auth: { status: true }, api: { status: true } };
  }

  async unpublishedEntry() {
    return null;
  }
  async unpublishedEntries() {
    return [];
  }
  async entriesByFiles() {
    return [];
  }
  async traverseCursor() {
    return { entries: [], cursor: null };
  }

  // ---------- Posts (entries) ----------

  async entriesByFolder() {
    const response = await this.apiFetch(POSTS_URL, { method: "GET" });
    if (response.status === 401 || response.status === 403) {
      throw new Error("Oturum süresi doldu, lütfen tekrar giriş yapın.");
    }
    if (!response.ok) {
      throw new Error("Veriler listelenirken sunucu hatası oluştu.");
    }
    const posts = await response.json();
    return posts.map(toEntry);
  }

  async getEntry(path) {
    const match = /^posts\/(.+)\.json$/.exec(path || "");
    const slug = match ? match[1] : null;

    if (!slug) {
      throw new Error("Kayıt bulunamadı.");
    }

    const response = await this.apiFetch(`${POSTS_URL}/${encodeURIComponent(slug)}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Kayıt bulunamadı.");
    }
    const postData = await response.json();
    return toEntry(postData);
  }

  async persistEntry(entry) {
    const rawJsonString = entry.dataFiles[0].raw;
    const postData = JSON.parse(rawJsonString);

    let slug = entry.slug || entry.dataFiles[0].slug;
    if (!slug) {
      slug = slugify(postData.title) || `post-${Date.now()}`;
    }

    const payload = {
      slug: slug,
      title: postData.title,
      content: postData.body,
      image: postData.image || "",
    };

    const existingResponse = await this.apiFetch(
      `${POSTS_URL}/${encodeURIComponent(slug)}`,
      { method: "GET" },
    );

    let savedPost;
    if (existingResponse.ok) {
      const updateResponse = await this.apiFetch(
        `${POSTS_URL}/${encodeURIComponent(slug)}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );
      if (!updateResponse.ok) {
        const message = await extractErrorMessage(updateResponse, "Güncelleme reddedildi.");
        throw new Error(message);
      }
      savedPost = await updateResponse.json();
    } else {
      const createResponse = await this.apiFetch(POSTS_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!createResponse.ok) {
        const message = await extractErrorMessage(createResponse, "Sunucu işlemi reddetti.");
        throw new Error(message);
      }
      savedPost = await createResponse.json();
    }

    return toEntry(savedPost);
  }

  async deleteFiles(paths) {
    await Promise.all(
      paths.map((p) => {
        const match = /posts\/(.+)\.json$/.exec(p);
        const slug = match ? match[1] : p;
        return this.apiFetch(`${POSTS_URL}/${encodeURIComponent(slug)}`, {
          method: "DELETE",
        });
      }),
    );
  }

  // ---------- Media ----------

  async getMedia() {
    const response = await this.apiFetch(MEDIA_URL, { method: "GET" });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Oturum süresi doldu, lütfen tekrar giriş yapın.");
    }

    if (!response.ok) {
      throw new Error("Medya listesi alınamadı (sunucu hatası).");
    }

    const mediaFiles = await response.json();
    this.mediaList = mediaFiles.map((m) => ({
      id: m.id.toString(),
      name: m.name,
      size: m.size || 0,
      path: `/uploads/${m.name}`,
      url: m.url,
      displayURL: m.url,
    }));
    return this.mediaList;
  }

  async getMediaDisplayURL(displayURL) {
    if (!displayURL) return "";

    if (typeof displayURL === "string") {
      if (displayURL.startsWith("http")) return displayURL;
      const cleanPath = displayURL.replace(/^\/+/, "");
      return `${BASE_URL}/${cleanPath}`;
    }

    if (displayURL.url) return displayURL.url;
    if (displayURL.file) return URL.createObjectURL(displayURL.file);
    return displayURL;
  }

  async persistMedia(bigFile) {
    const file = bigFile.fileObj || bigFile.file || bigFile;

    if (typeof file === "string") {
      return {
        id: file,
        name: file,
        size: 0,
        path: file,
        url: file,
        displayURL: file,
      };
    }

    const formData = new FormData();
    formData.append("file", file, file.name || "image.jpg");

    try {
      const response = await this.apiFetchForm(MEDIA_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response, "Sunucu medyayı reddetti.");
        throw new Error(message);
      }

      const data = await response.json();
      const finalUrl = data.url;
      const fileName = data.name || file.name;

      const mediaItem = {
        id: data.id ? data.id.toString() : fileName,
        name: fileName,
        size: data.size || file.size || 0,
        path: `/uploads/${fileName}`,
        url: finalUrl,
        displayURL: finalUrl,
        file: file,
      };

      if (!this.mediaList) this.mediaList = [];
      this.mediaList.push(mediaItem);

      return mediaItem;
    } catch (error) {
      console.error("Medya yükleme hatası:", error);
      throw error;
    }
  }

  async deleteMedia(mediaFile) {
    const id = mediaFile && mediaFile.id;
    if (!id) return;

    try {
      const response = await this.apiFetch(`${MEDIA_URL}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const message = await extractErrorMessage(response, "Medya silinirken hata oluştu.");
        throw new Error(message);
      }
      this.mediaList = (this.mediaList || []).filter((m) => m.id !== id);
    } catch (error) {
      console.error("Medya silme hatası:", error);
      throw error;
    }
  }
}

CMS.registerBackend("my-custom-backend", MyCustomBackend);