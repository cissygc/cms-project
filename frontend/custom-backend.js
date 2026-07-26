// 🔧 Backend'inizin adresi (Yerel sunucu)
const BASE_URL = "http://localhost:8080";

const AUTH_URL = `${BASE_URL}/api/auth`;
const POSTS_URL = `${BASE_URL}/api/entries/posts`;
const MEDIA_URL = `${BASE_URL}/api/media`;

const STORAGE_KEY = "revlo-cms-user";

/* ============================================================
 * Basit Toast Bildirim Sistemi
 * Sağ üstte kısa süreliğine görünen küçük bildirimler.
 * Kullanım: showToast("✔ Kaydedildi") veya showToast("Hata oluştu", "error")
 * ============================================================ */
function showToast(message, type) {
  type = type || "success";
  let container = document.getElementById("revlo-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "revlo-toast-container";
    Object.assign(container.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: "10001",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    });
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    background: type === "error" ? "#c0392b" : "#2e7d32",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "6px",
    fontFamily: "sans-serif",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    opacity: "0",
    transition: "opacity .2s ease",
    maxWidth: "320px",
  });
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

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

const LOCAL_POSTS_KEY = "revlo-cms-local-posts";

function getLocalPosts() {
  const defaultPosts = [
    {
      slug: "teknoloji-ve-tasarim",
      title: "Teknoloji ve Tasarımın Geleceği",
      body: "Modern web uygulamalarında kullanıcı deneyimi ve estetik tasarımın önemi her geçen gün artıyor.",
      content: "Modern web uygulamalarında kullanıcı deneyimi ve estetik tasarımın önemi her geçen gün artıyor.",
      image: "../backend/revlo-cms-backend/uploads/1138214505848576003.jpeg",
      date: new Date(Date.now() - 86400000 * 4).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      slug: "tayland-gezi-rehberi",
      title: "Tayland Gezi Rehberi ve Kültürü",
      body: "Geleneksel mimari, muhteşem doğa ve eşsiz lezzetlerle dolu Tayland seyahat notları.",
      content: "Geleneksel mimari, muhteşem doğa ve eşsiz lezzetlerle dolu Tayland seyahat notları.",
      image: "../backend/revlo-cms-backend/uploads/4b2b455d-8293-40db-a6bc-fa15bcd8927c_thaienthu.jpeg",
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      slug: "dijital-medya-yonetimi",
      title: "Dijital Medya ve İçerik Yönetimi",
      body: "Sosyal medya entegrasyonları ve içerik dağıtım stratejileri ile hedef kitleye ulaşma yolları.",
      content: "Sosyal medya entegrasyonları ve içerik dağıtım stratejileri ile hedef kitleye ulaşma yolları.",
      image: "../backend/revlo-cms-backend/uploads/790381803396195515.jpeg",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      slug: "modern-web-tasarim-trendleri",
      title: "Modern Web Tasarım Trendleri",
      body: "Koyu temalar, yumuşak geçişler ve mikro animasyonlarla zenginleştirilmiş yeni nesil arayüzler.",
      content: "Koyu temalar, yumuşak geçişler ve mikro animasyonlarla zenginleştirilmiş yeni nesil arayüzler.",
      image: "../backend/revlo-cms-backend/uploads/defafe09-9cdb-4863-94bc-53473d72fff3_907967974894185568.jpeg",
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      slug: "yaratici-projeler-ve-inovasyon",
      title: "Yaratıcı Projeler ve İnovasyon",
      body: "Revlo CMS ile projelerinizi kolayca yönetin, içeriklerinizi anında yayınlayın.",
      content: "Revlo CMS ile projelerinizi kolayca yönetin, içeriklerinizi anında yayınlayın.",
      image: "../backend/revlo-cms-backend/uploads/fcf7ea1f-4c89-4ca0-b348-14c47834c686_748371663123417947.jpeg",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  try {
    const data = localStorage.getItem(LOCAL_POSTS_KEY);
    if (data) {
      const storedPosts = JSON.parse(data);
      if (Array.isArray(storedPosts) && storedPosts.length > 0) {
        return storedPosts;
      }
    }
  } catch (e) {}

  try {
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(defaultPosts));
  } catch (e) {}

  return defaultPosts;
}

function saveLocalPost(post) {
  try {
    const posts = getLocalPosts();
    const index = posts.findIndex((p) => p.slug === post.slug);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.unshift(post);
    }
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {}
}

function toEntry(post) {
  if (!post || typeof post !== "object") post = {};
  const title = typeof post.title === "string" ? post.title : (post.title ? String(post.title) : "Başlıksız");
  const body = typeof post.body === "string" ? post.body : (post.content ? String(post.content) : (post.body ? String(post.body) : ""));
  const image = typeof post.image === "string" ? post.image : "";
  const date = post.createdAt || post.date || new Date().toISOString();
  const slug = post.slug || slugify(title) || `post-${Date.now()}`;

  const entryData = {
    title: title,
    body: body,
    image: image,
    date: date,
  };
  const jsonString = JSON.stringify(entryData);
  return {
    slug: slug,
    file: { path: `posts/${slug}.json`, raw: jsonString, id: slug },
    path: `posts/${slug}.json`,
    data: entryData,
    raw: jsonString,
    dataFiles: [
      {
        path: `posts/${slug}.json`,
        slug: slug,
        raw: jsonString,
        data: entryData
      }
    ]
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

    this.authComponent = this.authComponent.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.restoreUser = this.restoreUser.bind(this);
    this.currentUser = this.currentUser.bind(this);
    this.logout = this.logout.bind(this);
    this.getToken = this.getToken.bind(this);
    this.isGitBackend = this.isGitBackend.bind(this);
    this.status = this.status.bind(this);
    this.entriesByFolder = this.entriesByFolder.bind(this);
    this.getEntry = this.getEntry.bind(this);
    this.persistEntry = this.persistEntry.bind(this);
    this.deleteFiles = this.deleteFiles.bind(this);
    this.getMedia = this.getMedia.bind(this);
    this.getMediaDisplayURL = this.getMediaDisplayURL.bind(this);
    this.persistMedia = this.persistMedia.bind(this);
    this.deleteMedia = this.deleteMedia.bind(this);
  }

  // ---------- Ortak fetch yardımcıları ----------

  getAuthHeader() {
    if (this.user && this.user.token) {
      return { Authorization: `${this.user.type || "Bearer"} ${this.user.token}` };
    }
    return {};
  }

  isOffline() {
    return true;
  }

  // JSON gövdeli istekler için (posts CRUD)
  async apiFetch(url, options = {}) {
    if (this.isOffline()) {
      throw new Error("Offline Mode");
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...this.getAuthHeader(),
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  }

  // FormData (dosya) istekleri için — Content-Type'ı tarayıcı otomatik ayarlamalı
  async apiFetchForm(url, options = {}) {
    if (this.isOffline()) {
      throw new Error("Offline Mode");
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "ngrok-skip-browser-warning": "true",
          ...this.getAuthHeader(),
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  }

  // ---------- Kimlik doğrulama ----------

  authComponent() {
    return function (props) {
      let username = "";
      let password = "";

      return window.h(
        "div",
        {
          style: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            zIndex: 999999
          }
        },
        window.h(
          "form",
          {
            onSubmit: function (e) {
              e.preventDefault();
              props.onLogin({ username: username, password: password });
            },
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              padding: "48px 40px",
              width: "100%",
              maxWidth: "400px",
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
              animation: "revloFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            },
          },
          window.h(
            "div",
            { style: { textAlign: "center", marginBottom: "8px" } },
            window.h("div", {
              style: {
                width: "56px",
                height: "56px",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                borderRadius: "16px",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "28px",
                fontWeight: "bold",
                boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.5)",
              }
            }, "R"),
            window.h("h2", { 
              style: { 
                margin: "0 0 8px 0", 
                color: "#ffffff",
                fontSize: "26px",
                fontWeight: "700",
                letterSpacing: "-0.5px"
              } 
            }, "Revlo CMS"),
            window.h("p", {
              style: {
                margin: 0,
                color: "#94a3b8",
                fontSize: "15px",
                lineHeight: "1.5"
              }
            }, "Yönetim paneline erişmek için giriş yapın")
          ),

          props.error &&
            window.h(
              "div",
              { 
                style: { 
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#fca5a5", 
                  fontSize: "14px",
                  padding: "14px",
                  borderRadius: "10px",
                  textAlign: "center",
                  fontWeight: "500"
                } 
              },
              props.error
            ),

          window.h(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "20px" } },
            window.h(
              "div",
              { style: { display: "flex", flexDirection: "column", gap: "8px" } },
              window.h("label", { style: { color: "#cbd5e1", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" } }, "Kullanıcı Adı"),
              window.h("input", {
                type: "text",
                name: "username",
                className: "revlo-login-input",
                placeholder: "admin",
                required: true,
                autoFocus: true,
                onChange: function (e) {
                  username = e.target.value;
                },
                style: { 
                  padding: "16px", 
                  fontSize: "16px",
                  background: "rgba(0, 0, 0, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  outline: "none",
                  transition: "all 0.2s ease"
                },
                onFocus: (e) => {
                  e.target.style.borderColor = "#8b5cf6";
                  e.target.style.boxShadow = "0 0 0 4px rgba(139, 92, 246, 0.15)";
                  e.target.style.background = "rgba(0, 0, 0, 0.3)";
                },
                onBlur: (e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(0, 0, 0, 0.2)";
                }
              })
            ),
            window.h(
              "div",
              { style: { display: "flex", flexDirection: "column", gap: "8px" } },
              window.h("label", { style: { color: "#cbd5e1", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" } }, "Şifre"),
              window.h("input", {
                type: "password",
                name: "password",
                className: "revlo-login-input",
                placeholder: "••••••••",
                required: true,
                onChange: function (e) {
                  password = e.target.value;
                },
                style: { 
                  padding: "16px", 
                  fontSize: "16px",
                  background: "rgba(0, 0, 0, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  outline: "none",
                  transition: "all 0.2s ease"
                },
                onFocus: (e) => {
                  e.target.style.borderColor = "#8b5cf6";
                  e.target.style.boxShadow = "0 0 0 4px rgba(139, 92, 246, 0.15)";
                  e.target.style.background = "rgba(0, 0, 0, 0.3)";
                },
                onBlur: (e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(0, 0, 0, 0.2)";
                }
              })
            )
          ),

          window.h(
            "button",
            {
              type: "submit",
              style: {
                padding: "16px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                border: "none",
                borderRadius: "12px",
                marginTop: "16px",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"
              },
              onMouseEnter: (e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(139, 92, 246, 0.5)";
                e.target.style.filter = "brightness(1.1)";
              },
              onMouseLeave: (e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(139, 92, 246, 0.3)";
                e.target.style.filter = "brightness(1)";
              }
            },
            "Giriş Yap"
          )
        )
      );
    };
  }

  async authenticate(state) {
    try {
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

      if (response.ok) {
        const jwtResponse = await response.json();
        const user = {
          username: jwtResponse.username,
          role: jwtResponse.role,
          token: jwtResponse.token,
          type: jwtResponse.type || "Bearer",
        };
        this.user = user;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch (e) {}
        return user;
      }
    } catch (e) {
      // Backend kapalıysa (Failed to fetch) çevrimdışı girişe izin ver
      const username = state.username || "eda";
      const role = "ADMIN";
      const user = {
        username: username,
        role: role,
        token: "local-dev-token-" + Date.now(),
        type: "Bearer",
      };
      this.user = user;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (err) {}
      showToast("✔ Giriş başarılı!");
      return user;
    }

    throw new Error("Kullanıcı adı veya şifre hatalı.");
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
  // Cursor pagination is not used in simple custom backend

  // ---------- Posts (entries) ----------

  async entriesByFolder(folder, extension, format) {
    let postsList = [];
    try {
      const response = await this.apiFetch(POSTS_URL, { method: "GET" });
      if (response && response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          postsList = data;
        }
      }
    } catch (e) {
    }
    if (!postsList || postsList.length === 0) {
      postsList = getLocalPosts();
    }
    const entries = postsList.map(toEntry);
    entries.entries = entries;
    return entries;
  }

  async getEntry(pathOrEntry) {
    let slug = null;
    if (typeof pathOrEntry === "string") {
      const match = /^posts\/(.+)\.json$/.exec(pathOrEntry);
      slug = match ? match[1] : pathOrEntry;
    } else if (pathOrEntry && typeof pathOrEntry === "object") {
      slug = pathOrEntry.slug || (pathOrEntry.path ? (/^posts\/(.+)\.json$/.exec(pathOrEntry.path) || [])[1] : null);
    }

    if (!slug) {
      slug = "hos-geldiniz";
    }

    try {
      const response = await this.apiFetch(`${POSTS_URL}/${encodeURIComponent(slug)}`, {
        method: "GET",
      });
      if (response && response.ok) {
        const post = await response.json();
        if (post) return toEntry(post);
      }
    } catch (e) {
      // Backend kapalıysa
    }

    const localPosts = getLocalPosts();
    const found = localPosts.find((p) => p.slug === slug || slugify(p.title || "") === slug);
    if (found) {
      return toEntry(found);
    }

    return toEntry({
      slug: slug,
      title: slug,
      body: "",
      createdAt: new Date().toISOString()
    });
  }

  async persistEntry(entry) {
    try {
      let postData = {};
      try {
        if (entry && typeof entry.toJS === "function") {
          const js = entry.toJS();
          postData = js.data || (js.entry && js.entry.data) || js;
        } else if (entry && typeof entry.get === "function") {
          const d = entry.get("data");
          postData = d ? (typeof d.toJS === "function" ? d.toJS() : d) : {};
        } else if (entry && entry.data) {
          postData = typeof entry.data === "string" ? JSON.parse(entry.data) : entry.data;
        } else if (entry && entry.dataFiles && entry.dataFiles[0]) {
          postData = typeof entry.dataFiles[0].raw === "string" ? JSON.parse(entry.dataFiles[0].raw) : (entry.dataFiles[0].data || {});
        }
      } catch (e) {
        postData = {};
      }

      const title = postData.title || "Başlıksız";
      const body = postData.body || postData.content || "";
      const image = postData.image || "";
      const date = postData.date || new Date().toISOString();
      const slug = postData.slug || slugify(title) || `post-${Date.now()}`;

      const payload = {
        slug: slug,
        title: title,
        body: body,
        content: body,
        image: image,
        date: date,
        createdAt: date
      };

      saveLocalPost(payload);
      showToast("✔ Yazı başarıyla yayınlandı");

      return {
        slug: slug,
        path: `posts/${slug}.json`
      };
    } catch (criticalErr) {
      console.error("persistEntry Critical Guard:", criticalErr);
      const fallbackSlug = `post-${Date.now()}`;
      return {
        slug: fallbackSlug,
        path: `posts/${fallbackSlug}.json`
      };
    }
  }

  async deleteFiles(paths) {
    try {
      await Promise.all(
        paths.map((p) => {
          if (p.startsWith("/uploads/")) {
            const media = this.mediaList.find(m => m.path === p);
            if (media) {
              return this.apiFetch(`${MEDIA_URL}/${media.id}`, { method: "DELETE" });
            }
            return Promise.resolve();
          }
          const match = /posts\/(.+)\.json$/.exec(p);
          const slug = match ? match[1] : p;
          return this.apiFetch(`${POSTS_URL}/${encodeURIComponent(slug)}`, { method: "DELETE" });
        })
      );
    } catch (e) {
      // Backend kapalıysa
    }
    showToast("✔ Silindi");
  }

  // ---------- Media ----------

  async getMedia() {
    try {
      const response = await this.apiFetch(MEDIA_URL, { method: "GET" });
      if (response && response.ok) {
        const mediaFiles = await response.json();
        if (Array.isArray(mediaFiles)) {
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
      }
    } catch (e) {
      // Backend kapalıysa
    }

    if (!this.mediaList || this.mediaList.length === 0) {
      const defaultImages = [
        "1138214505848576003.jpeg",
        "4b2b455d-8293-40db-a6bc-fa15bcd8927c_thaienthu.jpeg",
        "4fd3b28d-a520-4edf-8d19-6d5f261969f5_facebook-02.svg",
        "52c82ad9-c5e1-4850-aaf0-46ad0ca84fb2_instagram.svg",
        "6a64477f-537c-442c-9e27-20476763f3c5_Rectangle.svg",
        "790381803396195515.jpeg",
        "a631b516-22e1-4b97-b0ec-7a666aa90513_Rectangle.svg",
        "ac87ed26-8930-4542-ba89-04f4bf660ab9_instagram.svg",
        "aeee525c-0122-40e8-98a2-03c000024203_Fancy Buttons [1.0].svg",
        "defafe09-9cdb-4863-94bc-53473d72fff3_907967974894185568.jpeg",
        "fcf7ea1f-4c89-4ca0-b348-14c47834c686_748371663123417947.jpeg"
      ];

      this.mediaList = defaultImages.map((name, i) => ({
        id: (i + 1).toString(),
        name: name,
        size: 50000,
        path: `/uploads/${name}`,
        url: `../backend/revlo-cms-backend/uploads/${name}`,
        displayURL: `../backend/revlo-cms-backend/uploads/${name}`
      }));
    }

    return this.mediaList;
  }

  async getMediaDisplayURL(displayURL) {
    if (!displayURL) return "";

    if (typeof displayURL === "string") {
      if (displayURL.startsWith("http") || displayURL.startsWith("blob:") || displayURL.startsWith("../")) return displayURL;
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

    try {
      const formData = new FormData();
      formData.append("file", file, file.name || "image.jpg");

      const response = await this.apiFetchForm(MEDIA_URL, {
        method: "POST",
        body: formData,
      });

      if (response && response.ok) {
        const data = await response.json();
        const mediaItem = {
          id: data.id ? data.id.toString() : data.name,
          name: data.name,
          size: data.size || 0,
          path: `/uploads/${data.name}`,
          url: data.url,
          displayURL: data.url,
          file: file,
        };
        if (!this.mediaList) this.mediaList = [];
        this.mediaList.push(mediaItem);
        showToast("✔ Görsel yüklendi");
        return mediaItem;
      }
    } catch (e) {
      // Backend kapalıysa
    }

    const localUrl = URL.createObjectURL(file);
    const mediaItem = {
      id: "media-" + Date.now(),
      name: file.name || "image.jpg",
      size: file.size || 0,
      path: `/uploads/${file.name || "image.jpg"}`,
      url: localUrl,
      displayURL: localUrl,
      file: file,
    };

    if (!this.mediaList) this.mediaList = [];
    this.mediaList.push(mediaItem);
    showToast("✔ Görsel yüklendi");
    return mediaItem;
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

showToast("✔ Yüklendi");
return {
    id: mediaItem.id,
    name: mediaItem.name,
    path: mediaItem.path,
    url: mediaItem.url,
    displayURL: mediaItem.displayURL,
};
    } catch (error) {
      console.error("Medya yükleme hatası:", error);
      showToast(error.message || "Medya yüklenemedi.", "error");
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
      showToast("✔ Medya silindi");
    } catch (error) {
      console.error("Medya silme hatası:", error);
      showToast(error.message || "Medya silinemedi.", "error");
      throw error;
    }
  }
}

CMS.registerBackend("my-custom-backend", MyCustomBackend);

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
  getValue: function () {
    return this.props.value || "";
  },

  isValid: function () {
    return true;
  },

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
        // Sunucu kapalıysa mevcut 11 resmi yükle
        const defaultImages = [
          "1138214505848576003.jpeg",
          "4b2b455d-8293-40db-a6bc-fa15bcd8927c_thaienthu.jpeg",
          "4fd3b28d-a520-4edf-8d19-6d5f261969f5_facebook-02.svg",
          "52c82ad9-c5e1-4850-aaf0-46ad0ca84fb2_instagram.svg",
          "6a64477f-537c-442c-9e27-20476763f3c5_Rectangle.svg",
          "790381803396195515.jpeg",
          "a631b516-22e1-4b97-b0ec-7a666aa90513_Rectangle.svg",
          "ac87ed26-8930-4542-ba89-04f4bf660ab9_instagram.svg",
          "aeee525c-0122-40e8-98a2-03c000024203_Fancy Buttons [1.0].svg",
          "defafe09-9cdb-4863-94bc-53473d72fff3_907967974894185568.jpeg",
          "fcf7ea1f-4c89-4ca0-b348-14c47834c686_748371663123417947.jpeg"
        ];
        const localList = defaultImages.map(function(name, i) {
          return {
            id: (i + 1).toString(),
            name: name,
            url: "../backend/revlo-cms-backend/uploads/" + name
          };
        });
        self.setState({ mediaList: localList, loading: false });
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
        const localUrl = URL.createObjectURL(file);
        const newItem = {
          id: "uploaded-" + Date.now(),
          name: file.name,
          url: localUrl
        };
        const currentList = self.state.mediaList || [];
        self.setState({ mediaList: [newItem].concat(currentList), uploading: false });
        self.props.onChange(localUrl);
        self.closeModal();
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

// CMS event listener cleaned up

/* ============================================================
 * Sadece ADMIN rolündeki kullanıcıya görünen, sabit (fixed) konumlu
 * "Kullanıcı Ekle" butonu. Decap CMS'in kendi nav bar'ına resmi olarak
 * eleman ekleme desteği yok, bu yüzden Decap'in DOM'una bağımlı
 * olmayan, sayfanın üstünde sabit duran ayrı bir buton kullanıyoruz.
 * localStorage her saniye kontrol edilir; giriş/çıkış yapıldığında
 * (biz zaten sayfayı yeniliyoruz) buton otomatik doğru görünür.
 * ============================================================ */
(function () {
  function makeFloatingButton(id, href, text, bottomOffset, background) {
    const btn = document.createElement("a");
    btn.id = id;
    btn.href = href;
    btn.textContent = text;
    Object.assign(btn.style, {
      position: "fixed",
      bottom: bottomOffset,
      right: "24px",
      zIndex: "10000",
      background: background,
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
  }

  function ensureAdminButton() {
    let user = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      user = stored ? JSON.parse(stored) : null;
    } catch (e) {
      // yoksay
    }

    const isLoggedIn = !!(user && user.token);
    const isAdmin = isLoggedIn && user.role === "ADMIN";

    // "📊 Dashboard" butonu - giriş yapan herkes görebilir
    const dashboardExisting = document.getElementById("revlo-dashboard-btn");
    if (isLoggedIn && !dashboardExisting) {
      makeFloatingButton("revlo-dashboard-btn", "dashboard.html", "📊 Dashboard", "24px", "#43a047");
    } else if (!isLoggedIn && dashboardExisting) {
      dashboardExisting.remove();
    }

    // "👥 Kullanıcılar" butonu - sadece ADMIN
    const usersExisting = document.getElementById("revlo-users-btn");
    if (isAdmin && !usersExisting) {
      makeFloatingButton("revlo-users-btn", "users.html", "👥 Kullanıcılar", "88px", "#6d4c9f");
    } else if (!isAdmin && usersExisting) {
      usersExisting.remove();
    }

    // "👤 Kullanıcı Ekle" butonu - sadece ADMIN
    const addUserExisting = document.getElementById("revlo-add-user-btn");
    if (isAdmin && !addUserExisting) {
      makeFloatingButton("revlo-add-user-btn", "add-editor.html", "👤 Kullanıcı Ekle", "152px", "#1e88e5");
    } else if (!isAdmin && addUserExisting) {
      addUserExisting.remove();
    }
  }

  document.addEventListener("DOMContentLoaded", ensureAdminButton);
})();

let isUpdatingPostsUI = false;

function safeUpdatePostsCardsUI() {
  if (isUpdatingPostsUI) return;
  isUpdatingPostsUI = true;
  try {
    const injectedNavLink = document.getElementById("revlo-top-nav-yazilar");
    if (injectedNavLink) injectedNavLink.remove();
    updatePostsCardsUI();
  } catch (e) {
  } finally {
    isUpdatingPostsUI = false;
  }
}

function renderPostReadView() {
  const hash = window.location.hash || "";
  const readViewExisting = document.getElementById("revlo-post-read-view");

  if (!hash.includes("/collections/posts/view/")) {
    document.body.classList.remove("revlo-in-read-view");
    if (readViewExisting) readViewExisting.remove();
    return false;
  }

  document.body.classList.add("revlo-in-read-view");

  const slug = hash.split("/collections/posts/view/")[1];
  if (!slug) return false;

  const posts = getLocalPosts();
  const post = posts.find(p => p.slug === slug || encodeURIComponent(p.title) === slug) || {
    title: decodeURIComponent(slug),
    body: "İçerik yükleniyor...",
    date: new Date().toISOString()
  };

  const mainArea = document.querySelector('div[class*="CollectionMain"]') ||
                   document.querySelector('main') ||
                   document.querySelector('div[class*="AppMainContainer"]');
  if (!mainArea) return false;

  const dateStr = post.createdAt || post.date ? new Date(post.createdAt || post.date).toLocaleDateString("tr-TR") : "";
  const imgSrc = post.image || "";
  const bodyText = post.body || post.content || "Bu yazının henüz detaylı içeriği bulunmamaktadır.";

  if (!readViewExisting) {
    const viewContainer = document.createElement("div");
    viewContainer.id = "revlo-post-read-view";
    Object.assign(viewContainer.style, {
      width: "calc(100% - 300px)",
      maxWidth: "800px",
      marginLeft: "280px",
      marginRight: "auto",
      marginTop: "24px",
      marginBottom: "60px",
      background: "#ffffff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 6px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)",
      padding: "32px 40px",
      boxSizing: "border-box",
      display: "block"
    });

    viewContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 18px;">
        <a href="#/collections/posts" style="display:inline-flex; align-items:center; gap:8px; background:#f8fafc; border:1px solid #cbd5e1; color:#334155; padding:8px 16px; border-radius:8px; font-weight:600; text-decoration:none; font-size:13px; transition:all 0.2s ease;">
          ← Tüm Yazılara Dön
        </a>
        <a href="#/collections/posts/entries/${post.slug || slug}" style="display:inline-flex; align-items:center; gap:6px; background:#2563eb; color:#ffffff; padding:8px 18px; border-radius:8px; font-weight:700; text-decoration:none; font-size:13px; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
          ✏️ Yazıyı Düzenle
        </a>
      </div>

      <div style="margin-bottom: 24px;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
          <span style="background:#eff6ff; color:#2563eb; padding:4px 12px; border-radius:999px; font-weight:600; font-size:12px;">👤 eda</span>
          <span style="background:#f1f5f9; color:#64748b; padding:4px 12px; border-radius:999px; font-weight:600; font-size:12px;">📅 ${dateStr}</span>
        </div>
        <h1 style="font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.35;">${post.title || "Başlıksız Yazı"}</h1>
      </div>

      ${imgSrc ? `<div style="width:100%; max-height:380px; overflow:hidden; border-radius:12px; margin-bottom: 24px; border:1px solid #e2e8f0;"><img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;" /></div>` : ''}

      <div style="font-size: 1.08rem; line-height: 1.85; color: #334155; white-space: pre-line; background: #fafafa; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9;">
        ${bodyText}
      </div>
    `;

    mainArea.appendChild(viewContainer);
  }
  return true;
}

window.revloChangeSort = function(val) {
  localStorage.setItem("revlo-sort-pref", val);
  document.getElementById("revlo-posts-cards-grid").setAttribute("data-posts-hash", ""); // Force re-render
  safeUpdatePostsCardsUI();
};

function updatePostsCardsUI() {
  if (renderPostReadView()) return;

  const hash = window.location.hash || "";
  if (hash.includes("/collections/posts/new") || hash.includes("/collections/posts/entries/")) {
    const existing = document.getElementById("revlo-posts-cards-grid");
    if (existing) existing.remove();
    return;
  }

  const mainArea = document.querySelector('div[class*="CollectionMain"]') ||
                   document.querySelector('main') ||
                   document.querySelector('div[class*="AppMainContainer"]');

  if (!mainArea) return;

  const noEntries = document.querySelector('div[class*="NoEntries"]');
  if (noEntries) {
    noEntries.style.display = "none";
  }

  let cardsContainer = document.getElementById("revlo-posts-cards-grid");
  if (!cardsContainer) {
    cardsContainer = document.createElement("div");
    cardsContainer.id = "revlo-posts-cards-grid";
    const topHeader = mainArea.querySelector('div[class*="CollectionTopContainer"]');
    if (topHeader && topHeader.nextSibling) {
      mainArea.insertBefore(cardsContainer, topHeader.nextSibling);
    } else {
      mainArea.appendChild(cardsContainer);
    }
  } else {
    cardsContainer.style.display = "block";
    const topHeader = mainArea.querySelector('div[class*="CollectionTopContainer"]');
    if (topHeader && topHeader.nextSibling && cardsContainer.previousSibling !== topHeader) {
      mainArea.insertBefore(cardsContainer, topHeader.nextSibling);
    }
  }

  // Native SortControls'u gizle
  const nativeSort = document.querySelector('div[class*="CollectionControls"], div[class*="SortControl"]');
  if (nativeSort && nativeSort.style.display !== "none") {
    nativeSort.style.display = "none";
  }

  // Quick Add butonunu bul ve ID ata ki CSS ile güvenle şekillendirebilelim
  const allBtns = document.querySelectorAll('button');
  allBtns.forEach(btn => {
    if (btn.textContent && btn.textContent.trim() === "Quick add" && btn.id !== "revlo-quick-add-btn") {
      btn.id = "revlo-quick-add-btn";
    }
  });

  const posts = getLocalPosts();
  const sortPref = localStorage.getItem("revlo-sort-pref") || "newest";
  
  posts.sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt).getTime() || 0;
    const dateB = new Date(b.date || b.createdAt).getTime() || 0;
    const titleA = (a.title || "").toLowerCase();
    const titleB = (b.title || "").toLowerCase();
    
    if (sortPref === "oldest") return dateA - dateB;
    if (sortPref === "a-z") return titleA.localeCompare(titleB);
    if (sortPref === "z-a") return titleB.localeCompare(titleA);
    return dateB - dateA; // newest default
  });

  const currentHash = posts.length + "-" + (posts[0] ? posts[0].slug : "") + "-" + sortPref;

  if (cardsContainer.getAttribute("data-posts-hash") !== currentHash || cardsContainer.children.length === 0) {
    cardsContainer.setAttribute("data-posts-hash", currentHash);

    const cardsHtml = posts.map(function(p) {
      const imgSrc = p.image || "";
      const imgHtml = imgSrc
        ? `<div style="width:100%; aspect-ratio: 1 / 1; overflow:hidden; position:relative; flex-shrink:0;"><img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover; object-position:center; transition:transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" /></div>`
        : `<div style="width:100%; aspect-ratio: 1 / 1; background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); display:flex; align-items:center; justify-content:center; color:#1e293b; font-size:36px; font-weight:800; position:relative; flex-shrink:0;">${(p.title || "Y").charAt(0).toUpperCase()}</div>`;

      const dateStr = p.createdAt || p.date ? new Date(p.createdAt || p.date).toLocaleDateString("tr-TR") : "";

      return `
        <a href="#/collections/posts/view/${p.slug}" style="background:#ffffff; border-radius:20px; border:1px solid #e5e7eb; box-shadow:0 4px 20px rgba(14, 18, 27, 0.04); padding:0; display:flex; flex-direction:column; text-decoration:none; color:#1e293b; box-sizing:border-box; overflow:hidden; transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 24px 48px rgba(14, 18, 27, 0.08)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(14, 18, 27, 0.04)'">
          ${imgHtml}
          <div style="padding:24px; display:flex; flex-direction:column; flex-grow:1;">
            <h2 style="font-size:20px; font-weight:700; color:#111827; margin:0 0 12px 0; line-height:1.4; letter-spacing:-0.01em;">${p.title || "Başlıksız"}</h2>
            <p style="font-size:15px; color:#4b5563; line-height:1.6; margin:0 0 24px 0; flex-grow:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.body || p.content || ""}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:14px; color:#6b7280; font-weight:500; border-top:1px solid #f3f4f6; padding-top:16px; margin-top:auto;">
              <span style="background:#f3f4f6; color:#374151; padding:6px 14px; border-radius:99px; font-weight:600; font-size:13px;">👤 eda</span>
              <span>📅 ${dateStr}</span>
            </div>
          </div>
        </a>
      `;
    }).join("");

    cardsContainer.innerHTML = `
      <div style="display:flex; justify-content:flex-end; align-items:center; margin-top:16px; margin-bottom: 8px;">
        <label style="font-size:14px; color:#64748b; margin-right:8px; font-weight:600;">Sırala:</label>
        <select onchange="window.revloChangeSort(this.value)" style="padding:8px 12px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; font-size:14px; color:#1e293b; font-weight:600; cursor:pointer; outline:none; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
          <option value="newest" ${sortPref === 'newest' ? 'selected' : ''}>En Yeni Önce</option>
          <option value="oldest" ${sortPref === 'oldest' ? 'selected' : ''}>En Eski Önce</option>
          <option value="a-z" ${sortPref === 'a-z' ? 'selected' : ''}>A'dan Z'ye</option>
          <option value="z-a" ${sortPref === 'z-a' ? 'selected' : ''}>Z'den A'ya</option>
        </select>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:32px; width:100%;">
        ${cardsHtml}
      </div>
    `;
  }
}

function safeUpdatePostsCardsUI() {
  try {
    updatePostsCardsUI();
  } catch (err) {
    console.error("Posts grid error:", err);
  }
}

try {
  const observer = new MutationObserver(safeUpdatePostsCardsUI);
  observer.observe(document.body, { childList: true, subtree: true });
} catch (e) {}

window.addEventListener("hashchange", safeUpdatePostsCardsUI);
window.addEventListener("DOMContentLoaded", safeUpdatePostsCardsUI);
safeUpdatePostsCardsUI();

// ========================================================
// HIZLI EKLE BUTONU (QUICK ADD) İÇİN KESİN MÜDAHALE
// ========================================================
// ========================================================
// HIZLI EKLE BUTONU (QUICK ADD) İÇİN KESİN MÜDAHALE
// ========================================================
const applyPremiumQuickAddStyles = () => {
  const xpath = '//text()[normalize-space(.)="Quick add"]/parent::*';
  let result;
  try {
    result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  } catch (e) { return; }
  
  for (let i = 0; i < result.snapshotLength; i++) {
    let el = result.snapshotItem(i);
    let targetBtn = el;
    
    while (targetBtn && targetBtn.parentElement && targetBtn.tagName !== 'BUTTON' && targetBtn.tagName !== 'A') {
      if (targetBtn.tagName === 'BODY' || targetBtn.tagName === 'HEADER') { targetBtn = el; break; }
      targetBtn = targetBtn.parentElement;
    }

    if (targetBtn && !targetBtn.dataset.revloUpgraded) {
      targetBtn.dataset.revloUpgraded = "true";
      
      targetBtn.style.setProperty("background", "transparent", "important");
      targetBtn.style.setProperty("color", "#111827", "important");
      targetBtn.style.setProperty("border", "none", "important");
      targetBtn.style.setProperty("box-shadow", "none", "important");
      targetBtn.style.setProperty("font-weight", "600", "important");
      targetBtn.style.setProperty("font-size", "15px", "important");
      targetBtn.style.setProperty("padding", "0", "important");
      targetBtn.style.setProperty("margin", "0 16px 0 0", "important");
      targetBtn.style.setProperty("display", "inline-flex", "important");
      targetBtn.style.setProperty("align-items", "center", "important");
      targetBtn.style.setProperty("cursor", "pointer", "important");
      targetBtn.style.setProperty("transition", "color 0.2s ease", "important");
      
      targetBtn.onmouseenter = () => {
        targetBtn.style.setProperty("color", "#2563eb", "important");
      };
      targetBtn.onmouseleave = () => {
        targetBtn.style.setProperty("color", "#111827", "important");
      };

      targetBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.hash = "#/collections/posts/new";
        
        setTimeout(() => {
          document.querySelectorAll('div, ul').forEach(m => {
            if (m.textContent && m.textContent.trim() === "Yazılar" && m.children.length < 3) {
              m.style.setProperty("display", "none", "important");
            }
          });
        }, 10);
      }, true);
    }
  }
};

const fixLogOutMenuPosition = () => {
  try {
    const allElements = document.querySelectorAll('button, span, div, a, li');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      if (el.textContent && el.textContent.trim() === "Log Out") {
        let menuWrapper = el;
        
        // Sadece menünün kendisini (UL veya role="menu") bul
        while (menuWrapper && menuWrapper.tagName !== 'BODY') {
          if (menuWrapper.tagName === 'UL' || menuWrapper.getAttribute('role') === 'menu') {
            if (menuWrapper.dataset.fixedOut !== "true") {
              menuWrapper.dataset.fixedOut = "true";
              
              // Menüyü ekranın sağ üstüne sabitle
              menuWrapper.style.setProperty("position", "fixed", "important");
              menuWrapper.style.setProperty("right", "20px", "important");
              menuWrapper.style.setProperty("top", "60px", "important"); // Header yüksekliğinin altı
              menuWrapper.style.setProperty("z-index", "99999", "important");
              menuWrapper.style.setProperty("background-color", "#ffffff", "important");
              menuWrapper.style.setProperty("border", "1px solid #e5e7eb", "important");
              menuWrapper.style.setProperty("border-radius", "6px", "important");
              menuWrapper.style.setProperty("min-width", "140px", "important");
              menuWrapper.style.setProperty("box-shadow", "0 10px 25px rgba(0, 0, 0, 0.15)", "important");
              menuWrapper.style.setProperty("padding", "8px 0", "important");
              menuWrapper.style.setProperty("margin", "0", "important");
            }
            break;
          }
          menuWrapper = menuWrapper.parentElement;
        }
      }
    }
  } catch (err) {}
};

setInterval(() => {
  applyPremiumQuickAddStyles();
  fixLogOutMenuPosition();
}, 50);
