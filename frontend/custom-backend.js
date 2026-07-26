const API_BASE = "https://YENI-NGROK-ADRESINIZ.ngrok-free.dev/rest/api/posts";

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
  const entryData = {
    title: post.title,
    body: post.body,
    author: post.author,
    image: post.image || "",
    date: post.date || post.createdAt || new Date().toISOString(),
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

function getLocalPosts() {
  try {
    const data = localStorage.getItem("demo_posts");
    return data ? JSON.parse(data) : [
      {
        slug: "ota-review-management",
        title: "OTA review management without the Friday scramble",
        author: "Revlo AI",
        date: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
        body: "Filters, claim workflows, and faster replies in Revlo Reputation — so Booking and Tripadvisor don't pile up until week's end."
      },
      {
        slug: "deneme2-111111",
        title: "deneme2 111111",
        author: "Revlo Team",
        date: new Date().toISOString(),
        image: "",
        body: "psenfpiasnpiansgv sndv sdvdjv nsjdv fkj dvkjsndfknasfnşiosdmfs fnf fvpmvğpom dbfomdvmdpfodf fldmvlkdmrgğolm"
      }
    ];
  } catch (e) {
    return [];
  }
}

function saveLocalPosts(posts) {
  try {
    localStorage.setItem("demo_posts", JSON.stringify(posts));
  } catch (e) {}
}

class MyCustomBackend {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
    this.mediaList = [];
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
  async entriesByFiles(files) {
    return [];
  }
  async traverseCursor() {
    return { entries: [], cursor: null };
  }

  // 1. Tüm yazıları listele (GET)
  async entriesByFolder(collection, extension, depth) {
    try {
      const response = await apiFetch("/list", { method: "GET" });
      if (response.ok) {
        const posts = await response.json();
        return posts.map(toEntry);
      }
    } catch (e) {
      console.warn("Backend kapalı, yerel test verileri kullanılıyor.", e);
    }
    const localPosts = getLocalPosts();
    return localPosts.map(toEntry);
  }

  // 2. Tekil kayıt
  async getEntry(path) {
    const match = /^posts\/(.+)\.json$/.exec(path || "");
    const slug = match ? match[1] : null;

    if (!slug) {
      throw new Error("Kayıt bulunamadı.");
    }

    try {
      const response = await apiFetch(`/slug/${encodeURIComponent(slug)}`, { method: "GET" });
      if (response.ok) {
        const postData = await response.json();
        return toEntry(postData);
      }
    } catch (e) {
      console.warn("Backend kapalı, yerel hafızadan okunuyor.", e);
    }

    const localPosts = getLocalPosts();
    const found = localPosts.find((p) => p.slug === slug);
    if (found) {
      return toEntry(found);
    }
    return toEntry({
      slug: slug,
      title: slug,
      author: "Revlo Team",
      date: new Date().toISOString(),
      image: "",
      body: "Detay metni henüz yüklenmedi."
    });
  }

  async getMedia(mediaPath) {
    return this.mediaList || [];
  }

  async getMediaDisplayURL(displayURL) {
    if (typeof displayURL === "string") return displayURL;
    if (displayURL && displayURL.url) return displayURL.url;
    if (displayURL && displayURL.file) return URL.createObjectURL(displayURL.file);
    return displayURL;
  }

  async persistMedia(bigFile, options = {}) {
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

  async deleteFiles(paths, commitMessage) {
    await Promise.all(
      paths.map(async (p) => {
        const match = /posts\/(.+)\.json$/.exec(p);
        const slug = match ? match[1] : p;
        try {
          await apiFetch(`/slug/${encodeURIComponent(slug)}`, { method: "DELETE" });
        } catch (e) {}
        const localPosts = getLocalPosts().filter((item) => item.slug !== slug);
        saveLocalPosts(localPosts);
      }),
    );
  }

  async persistEntry(entry, options) {
    const rawJsonString = entry.dataFiles[0].raw;
    const postData = JSON.parse(rawJsonString);

    let slug = entry.slug || entry.dataFiles[0].slug;
    if (!slug) {
      slug = slugify(postData.title) || `post-${Date.now()}`;
    }

    try {
      const existingResponse = await apiFetch(`/slug/${encodeURIComponent(slug)}`, { method: "GET" });

      if (existingResponse.ok) {
        const updateResponse = await apiFetch(`/slug/${encodeURIComponent(slug)}`, {
          method: "PUT",
          body: JSON.stringify(postData),
        });
        if (updateResponse.ok) {
          const savedPost = await updateResponse.json();
          return toEntry(savedPost);
        }
      } else {
        const createResponse = await apiFetch("/create-post", {
          method: "POST",
          body: JSON.stringify({ ...postData, slug }),
        });
        if (createResponse.ok) {
          const savedPost = await createResponse.json();
          return toEntry(savedPost);
        }
      }
    } catch (e) {
      console.warn("Backend kapalı, yerel test hafızasına kaydediliyor.", e);
    }

    const localPosts = getLocalPosts();
    const existingIndex = localPosts.findIndex((p) => p.slug === slug);
    const postToSave = { ...postData, slug };
    if (existingIndex >= 0) {
      localPosts[existingIndex] = postToSave;
    } else {
      localPosts.push(postToSave);
    }
    saveLocalPosts(localPosts);
    return toEntry(postToSave);
  }
}

CMS.registerBackend("my-custom-backend", MyCustomBackend);

// ======================================================
// OKUMA EKRANI VE DÜZENLE BUTONU (PREVIEW TEMPLATE)
// ======================================================
const PostPreview = createClass({
  render: function () {
    const entry = this.props.entry;
    const title = entry.getIn(["data", "title"]) || "Başlıksız Yazı";
    const author = entry.getIn(["data", "author"]) || "Yazar";
    const date = entry.getIn(["data", "date"]) || "";
    const image = entry.getIn(["data", "image"]) || "";
    const widgetForBody = this.props.widgetFor("body");

    return window.h(
      "div",
      { className: "post-reader-container" },
      // Blog Detay İçerik Kartı
      window.h(
        "article",
        { className: "post-reader-article" },
        // 1. Kapak Fotoğrafı
        image
          ? window.h("img", {
              src: image,
              alt: title,
              className: "reader-cover-image",
            })
          : window.h("div", { className: "reader-cover-placeholder" }, "Kapak Fotoğrafı Yok"),
        // 2. Yazar & Tarih Rozeti
        window.h(
          "div",
          { className: "reader-meta-bar" },
          window.h("span", { className: "reader-author" }, `✍️ ${author}`),
          date ? window.h("span", { className: "reader-date" }, `📅 ${new Date(date).toLocaleDateString("tr-TR")}`) : null
        ),
        // 3. Başlık
        window.h("h1", { className: "reader-title" }, title),
        // 4. Metin İçeriği
        window.h("div", { className: "reader-body-content" }, widgetForBody)
      )
    );
  },
});

CMS.registerPreviewTemplate("posts", PostPreview);

// Header'daki "Delete entry" butonunun kapsayıcısını doğrudan flex row yapan kod
function ensureEditButtonInHeader() {
  const allButtons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
  const deleteBtn = allButtons.find(b => {
    const text = (b.textContent || '').toLowerCase();
    const cls = (b.className || '').toString().toLowerCase();
    return text.includes('delete') || text.includes('sil') || cls.includes('delete');
  });

  if (deleteBtn && !document.getElementById('custom-header-edit-btn')) {
    if (deleteBtn.parentNode) {
      deleteBtn.parentNode.style.display = 'flex';
      deleteBtn.parentNode.style.flexDirection = 'row';
      deleteBtn.parentNode.style.alignItems = 'center';
      deleteBtn.parentNode.style.gap = '8px';
    }

    const editBtn = document.createElement('button');
    editBtn.id = 'custom-header-edit-btn';
    editBtn.type = 'button';
    editBtn.className = 'btn-header-edit-custom';
    editBtn.innerHTML = '✏️ Yazıyı Düzenle Formu';
    editBtn.onclick = function (e) {
      e.preventDefault();
      var overlay = document.getElementById('post-reading-overlay');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('overlay-active');
    };
    deleteBtn.parentNode.insertBefore(editBtn, deleteBtn.nextSibling);
  }
}

setInterval(ensureEditButtonInHeader, 300);

// ======================================================
// OVERLAY OKUMA SAYFASI — Pane1/Pane2'ye dokunmaz
// ======================================================

function getOrCreateOverlay() {
  var el = document.getElementById('post-reading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'post-reading-overlay';
    document.body.appendChild(el);
  }
  return el;
}

function showReadingOverlay(slug) {
  var overlay = getOrCreateOverlay();
  var posts = getLocalPosts();
  var post = null;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].slug === slug) { post = posts[i]; break; }
  }
  if (!post) { overlay.classList.remove('active'); return; }

  var dateStr = '';
  if (post.date) {
    try { dateStr = new Date(post.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }); } catch(e) {}
  }

  var imageHtml = post.image
    ? '<img class="reader-cover-image" src="' + post.image + '" alt="" />'
    : '<div class="reader-cover-placeholder">📷 Kapak Fotoğrafı Yok</div>';

  var bodyHtml = (post.body || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

  overlay.innerHTML =
    '<div class="post-reader-container">' +
      '<div class="post-reader-article">' +
        imageHtml +
        '<div class="reader-meta-bar">' +
          '<span>✍️ ' + (post.author || '') + '</span>' +
          (dateStr ? '<span>📅 ' + dateStr + '</span>' : '') +
        '</div>' +
        '<h1 class="reader-title">' + post.title + '</h1>' +
        '<div class="reader-body-content">' + bodyHtml + '</div>' +
      '</div>' +
    '</div>';

  overlay.classList.add('active');
  document.body.classList.add('overlay-active');
}

var _prevOverlayHash = '';
function checkOverlay() {
  var hash = window.location.hash || '';
  if (hash === _prevOverlayHash) return;
  _prevOverlayHash = hash;

  var m = hash.match(/\/entries\/([^\/]+)$/);
  if (m) {
    showReadingOverlay(m[1]);
  } else {
    var overlay = document.getElementById('post-reading-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('overlay-active');
  }
}
setInterval(checkOverlay, 300);
function renderPostsGrid(posts) {
  const container = document.querySelector('div[class*="EntriesContainer"]');

  if (!container) return;

  container.innerHTML = "";

  posts.forEach(post => {

    const card = document.createElement("div");
    card.className = "custom-post-card";

    card.innerHTML = `
      <div class="custom-card-image">
        ${
          post.image
            ? `<img src="${post.image}" alt="${post.title}">`
            : `<div class="image-placeholder">📷</div>`
        }
      </div>

      <div class="custom-card-content">

        <h2>${post.title}</h2>

        <p>
          ${(post.body || "")
            .replace(/[#>*`]/g, "")
            .substring(0,140)}...
        </p>

        <span class="read-more">
          Read More →
        </span>

      </div>
    `;

    card.onclick = () => {
      location.hash = `#/collections/posts/entries/${post.slug}`;
    };

    container.appendChild(card);

  });
}
// ======================================================
// GİRİŞ EKRANINDAKİ YAZILARI KART YAPISINA DÖNÜŞTÜRÜCÜ (KESİN ÇÖZÜM)
// ======================================================
function applyCustomCardLayout() {
  // CMS'in kart konteynerini bul
  const container = document.querySelector('div[class*="EntriesContainer"]') || 
                    document.querySelector('ul[class*="CardsGrid"]') || 
                    document.querySelector('div[class*="CardsGrid"]');
                    
  if (!container) return;

  // Sadece ana liste sayfasındaysak çalış (Detay sayfasında veya overlay'de tetiklenme)
  if (window.location.hash.includes('/entries/')) {
    container.removeAttribute('data-custom-rendered');
    return;
  }

  // Zaten render edildiyse tekrar çalıştırma
  if (container.getAttribute('data-custom-rendered') === 'true') return;

  const posts = getLocalPosts();
  if (!posts || posts.length === 0) return;

  container.innerHTML = "";
  container.setAttribute('data-custom-rendered', 'true');

  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "custom-post-card";

    // Resim var mı kontrol et
    const imageHtml = post.image
      ? `<img src="${post.image}" alt="${post.title}" class="custom-card-img" />`
      : `<div class="image-placeholder">📷 Kapak Fotoğrafı Yok</div>`;

    // İçerik özet metni
    const cleanBody = (post.body || "").replace(/[#>*`]/g, "").trim();
    const shortBody = cleanBody.length > 120 ? cleanBody.substring(0, 120) + "..." : cleanBody;

    card.innerHTML = `
      <div class="custom-card-image-box">
        ${imageHtml}
      </div>
      <div class="custom-card-content-box">
        <h2 class="custom-card-title">${post.title}</h2>
        <p class="custom-card-desc">${shortBody || "Açıklama mevcut değil."}</p>
        <span class="custom-read-more">Read More &rarr;</span>
      </div>
    `;

    // Karta tıklanınca ilgili yazıya git
    card.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      location.hash = `#/collections/posts/entries/${post.slug}`;
    };

    container.appendChild(card);
  });
}

// Sayfa değişimlerini veya CMS yüklenmesini anlık dinle
setInterval(applyCustomCardLayout, 300);
// ======================================================
// GİRİŞ EKRANINDAKİ YAZILARI KART YAPISINA DÖNÜŞTÜRÜCÜ (GÜVENLİ FORM SÜRÜMÜ)
// ======================================================
function applyCustomCardLayout() {
  const hash = window.location.hash || "";

  // EĞER DETAY/OKUMA SAYFASINDAYSAK VEYA YENİ YAZI OLUŞTURMA SAYFASINDAYSAK HİÇBİR ŞEY YAPMA!
  if (hash.includes('/entries/') || hash.includes('/new')) {
    const container = document.querySelector('div[class*="EntriesContainer"]');
    if (container) container.removeAttribute('data-custom-rendered');
    return;
  }

  // Sadece ana liste sayfasındaysak devam et
  const container = document.querySelector('div[class*="EntriesContainer"]') || 
                    document.querySelector('ul[class*="CardsGrid"]') || 
                    document.querySelector('div[class*="CardsGrid"]');
                    
  if (!container) return;

  // Zaten render edildiyse tekrar çalıştırma
  if (container.getAttribute('data-custom-rendered') === 'true') return;

  const posts = getLocalPosts();
  if (!posts || posts.length === 0) return;

  container.innerHTML = "";
  container.setAttribute('data-custom-rendered', 'true');

  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "custom-post-card";

    const imageHtml = post.image
      ? `<img src="${post.image}" alt="${post.title}" class="custom-card-img" />`
      : `<div class="image-placeholder">📷 Kapak Fotoğrafı Yok</div>`;

    const cleanBody = (post.body || "").replace(/[#>*`]/g, "").trim();
    const shortBody = cleanBody.length > 120 ? cleanBody.substring(0, 120) + "..." : cleanBody;

    card.innerHTML = `
      <div class="custom-card-image-box">
        ${imageHtml}
      </div>
      <div class="custom-card-content-box">
        <h2 class="custom-card-title">${post.title}</h2>
        <p class="custom-card-desc">${shortBody || "Açıklama mevcut değil."}</p>
        <span class="custom-read-more">Read More &rarr;</span>
      </div>
    `;

    card.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      location.hash = `#/collections/posts/entries/${post.slug}`;
    };

    container.appendChild(card);
  });
}

setInterval(applyCustomCardLayout, 300);