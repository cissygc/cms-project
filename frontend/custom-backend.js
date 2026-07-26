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
    // Decap CMS, farklı bir hesapla giriş yapıldığında entries/media
    // önbelleğini kendi başına temizlemiyor (bilinen davranış). Bu yüzden
    // çıkışta sayfayı tamamen yeniliyoruz ki yeni hesap temiz başlasın.
    setTimeout(function () {
      window.location.reload();
    }, 50);
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
  async traverseCursor(cursor, action) {
    return {
        entries: this.mediaList || [],
        cursor: null,
    };
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

      if (p.startsWith("/uploads/")) {

        const media = this.mediaList.find(m => m.path === p);

        if (!media) {
          throw new Error(`Media bulunamadı: ${p}`);
        }

        return this.apiFetch(
          `${MEDIA_URL}/${media.id}`,
          {
            method: "DELETE",
          }
        );
      }

      const match = /posts\/(.+)\.json$/.exec(p);
      const slug = match ? match[1] : p;

      return this.apiFetch(
        `${POSTS_URL}/${encodeURIComponent(slug)}`,
        {
          method: "DELETE",
        }
      );
    })
  );
}
  // ---------- Media ----------

  async getMedia() {
  const response = await this.apiFetch(MEDIA_URL, { method: "GET" });

  const mediaFiles = await response.json();

  console.log("API RESPONSE:", mediaFiles);

  this.mediaList = mediaFiles.map((m) => ({
    id: m.id.toString(),
    name: m.name,
    size: m.size || 0,
    path: `/uploads/${m.name}`,
    url: m.url,
    displayURL: m.url,
  }));

  console.log("RETURNING:", this.mediaList);

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
    console.log("PERSIST MEDIA ÇALIŞTI");
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

return {
    id: mediaItem.id,
    name: mediaItem.name,
    path: mediaItem.path,
    url: mediaItem.url,
    displayURL: mediaItem.displayURL,
};
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

/* ============================================================
 * Custom "Görsel Seç" widget'ı
 * ------------------------------------------------------------
 * Decap CMS'in kendi built-in "Choose an image" popup'ı, field
 * içinden açıldığında medya listesini boş gösteriyor (bilinen,
 * bizim düzeltemediğimiz bir Decap iç davranışı). Bu widget onu
 * tamamen devre dışı bırakıp doğrudan /api/media ile konuşan
 * kendi basit medya seçici penceremizi kullanıyor.
 * ============================================================ */

function getAuthHeaders() {
  const headers = { "ngrok-skip-browser-warning": "true" };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      if (user && user.token) {
        headers["Authorization"] = `${user.type || "Bearer"} ${user.token}`;
      }
    }
  } catch (e) {
    // yoksay
  }
  return headers;
}

const cmsWidgetStyles = {
  wrapper: { fontFamily: "sans-serif" },
  preview: {
    maxWidth: "220px",
    maxHeight: "160px",
    display: "block",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #eee",
    objectFit: "cover",
  },
  placeholder: {
    width: "220px",
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px dashed #ccc",
    color: "#999",
    fontSize: "13px",
  },
  buttonRow: { display: "flex", gap: "8px" },
  selectBtn: {
    padding: "8px 14px",
    background: "#1e88e5",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  removeBtn: {
    padding: "8px 14px",
    background: "#fdecea",
    color: "#c0392b",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    borderRadius: "6px",
    padding: "20px",
    width: "600px",
    maxWidth: "90vw",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  closeBtn: {
    border: "none",
    background: "none",
    fontSize: "22px",
    cursor: "pointer",
    lineHeight: 1,
  },
  uploadLabel: {
    display: "inline-block",
    padding: "10px 14px",
    background: "#2e7d32",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
    gap: "10px",
  },
  thumb: {
    width: "100%",
    height: "90px",
    objectFit: "cover",
    borderRadius: "4px",
    cursor: "pointer",
    border: "2px solid transparent",
  },
};

const CustomImageControl = createClass({
  getInitialState: function () {
    return { modalOpen: false, loading: false, uploading: false, mediaList: [], error: null };
  },

  openModal: function () {
    this.setState({ modalOpen: true, loading: true, error: null });
    const self = this;
    fetch(MEDIA_URL, { headers: getAuthHeaders() })
      .then(function (res) {
        if (!res.ok) throw new Error("Medya listesi alınamadı.");
        return res.json();
      })
      .then(function (data) {
        self.setState({ mediaList: data, loading: false });
      })
      .catch(function () {
        self.setState({ loading: false, error: "Medya listesi yüklenemedi." });
      });
  },

  closeModal: function () {
    this.setState({ modalOpen: false });
  },

  handleSelect: function (url) {
    this.props.onChange(url);
    this.closeModal();
  },

  handleRemove: function (e) {
    e.stopPropagation();
    this.props.onChange("");
  },

  handleUpload: function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const self = this;
    this.setState({ uploading: true, error: null });

    const formData = new FormData();
    formData.append("file", file, file.name);

    fetch(MEDIA_URL, { method: "POST", headers: getAuthHeaders(), body: formData })
      .then(function (res) {
        if (!res.ok) throw new Error("Yükleme başarısız oldu.");
        return res.json();
      })
      .then(function (data) {
        self.setState({ uploading: false });
        self.props.onChange(data.url);
        self.closeModal();
      })
      .catch(function () {
        self.setState({ uploading: false, error: "Yükleme başarısız oldu." });
      });
  },

  render: function () {
    const value = this.props.value;
    const self = this;

    const preview = value
      ? window.h("img", { src: value, style: cmsWidgetStyles.preview })
      : window.h("div", { style: cmsWidgetStyles.placeholder }, "Görsel seçilmedi");

    const buttons = window.h(
      "div",
      { style: cmsWidgetStyles.buttonRow },
      window.h(
        "button",
        { type: "button", onClick: this.openModal, style: cmsWidgetStyles.selectBtn },
        value ? "Görseli Değiştir" : "Görsel Seç",
      ),
      value &&
        window.h(
          "button",
          { type: "button", onClick: this.handleRemove, style: cmsWidgetStyles.removeBtn },
          "Kaldır",
        ),
    );

    let modalBody;
    if (this.state.loading) {
      modalBody = window.h("p", null, "Yükleniyor...");
    } else if (this.state.error) {
      modalBody = window.h("p", { style: { color: "#c0392b" } }, this.state.error);
    } else if (!this.state.mediaList || this.state.mediaList.length === 0) {
      modalBody = window.h("p", { style: { color: "#999" } }, "Henüz yüklenmiş medya yok.");
    } else {
      modalBody = window.h(
        "div",
        { style: cmsWidgetStyles.grid },
        this.state.mediaList.map(function (item) {
          return window.h("img", {
            key: item.id,
            src: item.url,
            title: item.name,
            onClick: function () {
              self.handleSelect(item.url);
            },
            style: cmsWidgetStyles.thumb,
          });
        }),
      );
    }

    const modal = this.state.modalOpen
      ? window.h(
          "div",
          { style: cmsWidgetStyles.overlay, onClick: this.closeModal },
          window.h(
            "div",
            { style: cmsWidgetStyles.modal, onClick: function (e) { e.stopPropagation(); } },
            window.h(
              "div",
              { style: cmsWidgetStyles.modalHeader },
              window.h("h3", { style: { margin: 0 } }, "Medya Seç"),
              window.h("button", { type: "button", onClick: this.closeModal, style: cmsWidgetStyles.closeBtn }, "×"),
            ),
            window.h(
              "label",
              { style: cmsWidgetStyles.uploadLabel },
              this.state.uploading ? "Yükleniyor..." : "+ Yeni Görsel Yükle",
              window.h("input", {
                type: "file",
                accept: "image/*",
                onChange: this.handleUpload,
                style: { display: "none" },
                disabled: this.state.uploading,
              }),
            ),
            modalBody,
          ),
        )
      : null;

    return window.h("div", { style: cmsWidgetStyles.wrapper }, preview, buttons, modal);
  },
});

const CustomImagePreview = createClass({
  render: function () {
    return this.props.value
      ? window.h("img", { src: this.props.value, style: { maxWidth: "100%", borderRadius: "4px" } })
      : null;
  },
});

CMS.registerWidget("customImage", CustomImageControl, CustomImagePreview);

/* ============================================================
 * Decap CMS, bir post kaydedildikten sonra "Yazılar" listesini kendi
 * başına tazelemiyor (entriesByFolder'ı tekrar çağırmıyor) - bu yüzden
 * yeni/güncellenen post, sayfa manuel yenilenmeden listede görünmüyor.
 * postSave event'inde sayfayı yeniliyoruz ki liste her zaman güncel olsun.
 * ============================================================ */
CMS.registerEventListener({
  name: "postSave",
  handler: function () {
    setTimeout(function () {
      window.location.reload();
    }, 400);
  },
});

/* ============================================================
 * Sadece ADMIN rolündeki kullanıcıya görünen, sabit (fixed) konumlu
 * "Kullanıcı Ekle" butonu. Decap CMS'in kendi nav bar'ına resmi olarak
 * eleman ekleme desteği yok, bu yüzden Decap'in DOM'una bağımlı
 * olmayan, sayfanın üstünde sabit duran ayrı bir buton kullanıyoruz.
 * localStorage her saniye kontrol edilir; giriş/çıkış yapıldığında
 * (biz zaten sayfayı yeniliyoruz) buton otomatik doğru görünür.
 * ============================================================ */
(function () {
  function ensureAdminButton() {
    const existing = document.getElementById("revlo-add-user-btn");
    let user = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      user = stored ? JSON.parse(stored) : null;
    } catch (e) {
      // yoksay
    }

    const shouldShow = !!(user && user.role === "ADMIN");

    if (shouldShow && !existing) {
      const btn = document.createElement("a");
      btn.id = "revlo-add-user-btn";
      btn.href = "add-editor.html";
      btn.textContent = "👤 Kullanıcı Ekle";
      Object.assign(btn.style, {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: "10000",
        background: "#1e88e5",
        color: "#fff",
        padding: "14px 20px",
        borderRadius: "999px",
        fontFamily: "sans-serif",
        fontSize: "14px",
        fontWeight: "600",
        textDecoration: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      });
      document.body.appendChild(btn);
    } else if (!shouldShow && existing) {
      existing.remove();
    }
  }

  document.addEventListener("DOMContentLoaded", ensureAdminButton);
  setInterval(ensureAdminButton, 1000);
})();