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
    console.log(`Liste getiriliyor: ${collection.get('name')}`);
    return []; 
  }

  // Tekil veri ekranı
  async getEntry(collection, slug, path) {
    console.log(`Detay getiriliyor: ${slug}`);
    return {};
  }

  // Kaydet butonu
  async persistEntry(entry, options) {
    console.log("Kaydedilecek veri:", entry);
  }
}

// Sınıfı sisteme tanıtıyoruz
CMS.registerBackend('my-custom-backend', MyCustomBackend);