class MyCustomBackend {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
  }

  // 1. Decap'in giriş ekranını çizen fonksiyon
  authComponent() {
    return function(props) {
      return window.h(
        "button", 
        {
          type: "button", 
          onClick: function(e) { 
            e.preventDefault(); 
            props.onLogin({ email: "admin@localhost" }); 
          },
          style: { padding: "10px", margin: "20px", cursor: "pointer", fontSize: "16px" }
        }, 
        "Sisteme Giriş Yap (Test)"
      );
    };
  }

  // 2. YENİ EKLENEN METOD: Giriş butonuna basıldığında Decap'in aradığı ve çalıştırdığı asıl metod
  async authenticate(state) {
    console.log("Decap oturum açıyor...", state);
    return { email: state.email || "admin@localhost" };
  }

  // 3. Sayfa yenilendiğinde oturumu açık tutmak için
  async restoreUser(user) {
    return user;
  }

  // 4. Çıkış yapma fonksiyonu
  async logout() {
    return null;
  }

  // 5. API istekleri için token
  async getToken() {
    return "test-token";
  }

  // Mevcut kullanıcı
  async currentUser() {
    return { email: "admin@localhost" };
  }

  // Liste ekranı verileri
  async entriesByFolder(collection, extension, depth) {
    const collectionName = typeof collection === 'string'
    ? collection 
    : (collection?.get ? collection.get('name') : collection?.name);

    console.log(`Liste getiriliyor: ${collectionName}`);
    return []; 
  }

  // Tekil veri ekranı
  async getEntry(collection, slug, path) {
    console.log(`Detay istendi: ${slug}`);
    return {
      file: { path: path || 'posts/test.md' },
      data: ""
    }
  }
// Medya/Görsel sorgusu 
  async getMedia(mediaPath) {
    console.log(`Medya istendi: ${mediaPath}`);
    return [];
  }

  //  Medya dosyası kaydetme
  async persistMedia(bigFile, options = {}) {
    console.log("Medya yükleniyor:", bigFile);
    return {};
  }

  // Kaydet butonu
  async persistEntry(entry, options) {

    console.log("Kaydedilecek veri:", entry);
    const data = entry.dataFiles?.[0]?.raw || entry.data || {};
    console.log("Formun içeriği:", data);

    return {
      file: {
        path: entry.path || `posts/${entry.slug || 'yeni-yazi'}.md`,
        slug: entry.slug || 'yeni-yazi',
      }
    };
    
  }
}

// Sınıfı sisteme tanıtıyoruz
CMS.registerBackend('my-custom-backend', MyCustomBackend);