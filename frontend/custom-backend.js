class MyCustomBackend {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
  }

  // 1. Decap'in giriş ekranını çizen fonksiyon
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
          style: {
            padding: "10px",
            margin: "20px",
            cursor: "pointer",
            fontSize: "16px",
          },
        },
        "Sisteme Giriş Yap (Test)",
      );
    };
  }

  // 2. Giriş butonuna basıldığında Decap'in aradığı ve çalıştırdığı asıl metod
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

  // Liste ekranı verileri (GET İsteği)
  async entriesByFolder(collection, extension, depth) {
    try {
      const response = await fetch('https://provoking-dork-purchase.ngrok-free.dev/rest/api/posts/list', {
        headers: {
          'ngrok-skip-browser-warning': 'true' // Ngrok uyarı sayfasını engeller
        }
      });
      
      if (!response.ok) {
        console.error("Backend listeyi vermedi. HTTP Status:", response.status);
        return [];
      }

      const dtoList = await response.json();

      if (!Array.isArray(dtoList)) {
        console.error("Spring Boot'tan DTO dizisi gelmedi. Gelen veri:", dtoList);
        return [];
      }

      const collectionName = typeof collection === 'string' ? collection : "posts";

      const entries = dtoList.map(dto => ({
        file: {
          path: `${collectionName}/${dto.id}.json`,
          id: dto.id.toString()
        },
        data: JSON.stringify(dto)
      }));
      
      console.log("Decap UI'a listelenmek üzere giden veriler:", entries);
      return entries;

    } catch (error) {
      console.error("Listeleme Hatası:", error);
      return [];
    }
  }

  // Tekil veri ekranı (Detay)
  async getEntry(collection, slug, path) {
    if (!slug || slug === "undefined") return null;
    try {
      // URL düzeltildi (Fazlalık localhost silindi)
      const response = await fetch(
        `https://provoking-dork-purchase.ngrok-free.dev/rest/api/posts/${slug}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
      if (!response.ok) return null;

      const dto = await response.json();
      const collectionName = typeof collection === 'string' ? collection : (collection?.get ? collection.get("folder") : "posts");

      return {
        file: {
          path: `${collectionName}/${dto.id}.json`,
          id: dto.id.toString(),
        },
        data: JSON.stringify(dto),
      };
    } catch (error) {
      console.error("Detay Getirme Hatası:", error);
      return null;
    }
  }

  // Medya/Görsel sorgusu
  async getMedia(mediaPath) {
    console.log(`Medya istendi: ${mediaPath}`);
    return [];
  }

  // Medya dosyası kaydetme
  async persistMedia(bigFile, options = {}) {
    console.log("Medya yükleniyor:", bigFile);
    return {};
  }

  // Kaydet butonu (POST İsteği)
  async persistEntry(entry, options) {
    const rawJsonString = entry.dataFiles[0].raw;
    const postData = JSON.parse(rawJsonString);

    console.log("Spring Boot'a Giden GERÇEK Veri:", postData);

    try {
      const response = await fetch(
        "https://provoking-dork-purchase.ngrok-free.dev/rest/api/posts/create-post",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true" 
          },
          body: JSON.stringify(postData),
        },
      );

      if (!response.ok) throw new Error("Sunucu reddetti.");

      const savedPost = await response.json();
      console.log("MÜKEMMEL! Gerçek veri kaydedildi:", savedPost);
    } catch (error) {
      console.error("Kaydetme Hatası:", error);
      throw error;
    }
  }
}

// Sınıfı sisteme tanıtıyoruz
CMS.registerBackend("my-custom-backend", MyCustomBackend);