package com.example.service.impl;

import com.example.dto.postMedia.PostMediaRequestDto;
import com.example.dto.postMedia.PostMediaResponseDto;
import com.example.dto.post.PostRequestDto;
import com.example.dto.post.PostResponseDto;
import com.example.dto.postSeo.PostSeoRequestDto;
import com.example.dto.postSeo.PostSeoResponseDto;
import com.example.dto.collection.CollectionSummaryDto;
import com.example.dto.tag.TagSummaryDto;
import com.example.entity.Collection;
import com.example.entity.Language;
import com.example.entity.Media;
import com.example.entity.Post;
import com.example.entity.PostMedia;
import com.example.entity.PostStatus;
import com.example.entity.Tag;
import com.example.entity.User;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.repository.CollectionRepository;
import com.example.repository.MediaRepository;
import com.example.repository.PostRepository;
import com.example.repository.TagRepository;
import com.example.repository.UserRepository;
import com.example.service.IPostService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements IPostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CollectionRepository collectionRepository;
    private final MediaRepository mediaRepository;
    private final TagRepository tagRepository;

    // application.properties -> site.public-base-url (canonical URL üretimi için, bkz. buildCanonicalUrl)
    @Value("${site.public-base-url}")
    private String siteBaseUrl;

    // Ortalama okuma hızı - sektörde yaygın kullanılan varsayım (dakikada kelime, "words per minute")
    private static final int WORDS_PER_MINUTE = 200;

    public PostServiceImpl(PostRepository postRepository, UserRepository userRepository,
                           CollectionRepository collectionRepository, MediaRepository mediaRepository,
                           TagRepository tagRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.collectionRepository = collectionRepository;
        this.mediaRepository = mediaRepository;
        this.tagRepository = tagRepository;
    }

    @Override
    public PostResponseDto createPost(PostRequestDto postRequestDto, String username) {
        if (postRepository.existsBySlug(postRequestDto.getSlug())) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Bu slug (URL) zaten kullanımda"));
        }

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazar bulunamadı")));

        Post post = new Post();
        post.setSlug(postRequestDto.getSlug());
        post.setTitle(postRequestDto.getTitle());
        post.setContent(postRequestDto.getContent());
        post.setCoverMedia(resolveCoverMedia(postRequestDto.getCoverMediaId()));
        post.setAuthor(author);
        // Yeni yazılar için varsayılan DRAFT - editör bilerek yayınlamadıkça
        // yazı public API'de görünmesin.
        post.setStatus(parseStatus(postRequestDto.getStatus(), PostStatus.DRAFT));
        post.setLanguage(parseLanguage(postRequestDto.getLanguage(), Language.TR));
        post.setCollections(resolveCollections(postRequestDto.getCollectionIds()));
        post.setTags(resolveTags(postRequestDto.getTagNames()));
        post.setMedia(resolveMedia(post, postRequestDto.getMedia()));
        applySeo(post, postRequestDto.getSeo());
        post.setPublishAt(postRequestDto.getPublishAt());
        if (post.getStatus() == PostStatus.PUBLISHED) {
            post.setPublishAt(null);
        }

        Post savedPost = postRepository.save(post);
        return mapToDto(savedPost);
    }

    // coverMediaId verilmemişse (null) kapak görseli yok demektir - bu geçerli bir
    // durum (post kapaksız kalabilir). Verilmiş ama böyle bir medya yoksa hata fırlatır.
    private Media resolveCoverMedia(Long coverMediaId) {
        if (coverMediaId == null) {
            return null;
        }
        return mediaRepository.findById(coverMediaId)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST,
                        "Kapak görseli bulunamadı (id: " + coverMediaId + ")")));
    }

    // İstekten gelen SEO alanlarını post'a HAM olarak (fallback uygulamadan) yazar.
    // dto null gelirse (editör hiç seo objesi göndermediyse) hiçbir şeye dokunmaz -
    // mevcut değerler korunur (updatePost'ta önemli: SEO göndermeyen bir güncelleme
    // isteği, daha önce girilmiş SEO verisini silmemeli).
    private void applySeo(Post post, PostSeoRequestDto seo) {
        if (seo == null) {
            return;
        }
        post.setMetaTitle(seo.getMetaTitle());
        post.setMetaDescription(seo.getMetaDescription());
        post.setOgImageUrl(seo.getOgImageUrl());
        post.setCanonicalUrl(seo.getCanonicalUrl());
        post.setNoIndex(seo.isNoIndex());
    }

    // İstekten gelen dil metnini güvenli şekilde enum'a çevirir; boş/geçersizse
    // verilen varsayılana düşer.
    private Language parseLanguage(String rawLanguage, Language fallback) {
        if (rawLanguage == null || rawLanguage.isBlank()) {
            return fallback;
        }
        try {
            return Language.valueOf(rawLanguage.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR,
                    "Geçersiz dil: " + rawLanguage + " (izin verilenler: TR, EN, DE, RU)"));
        }
    }

    // Verilen id listesindeki koleksiyonları getirir; içlerinden biri bile
    // bulunamazsa hata fırlatır (post'un sessizce yanlış/eksik koleksiyona
    // atanmasını önlemek için).
    private Set<Collection> resolveCollections(List<Long> collectionIds) {
        if (collectionIds == null || collectionIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Collection> found = collectionRepository.findAllByIdIn(collectionIds);
        if (found.size() != new HashSet<>(collectionIds).size()) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Belirtilen koleksiyonlardan biri veya birkaçı bulunamadı"));
        }
        return new HashSet<>(found);
    }

    // Verilen serbest metin isimlerinden Tag'ler kurar - Collections'daki
    // resolveCollections'dan FARKI: id değil, İSİM alır ve yoksa OLUŞTURUR
    // ("find or create"). "AI" ile "ai" aynı tag sayılsın diye case-insensitive
    // arıyoruz (bkz. TagRepository.findByNameIgnoreCase).
    private Set<Tag> resolveTags(List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            return new HashSet<>();
        }

        Set<Tag> result = new HashSet<>();
        for (String rawName : tagNames) {
            if (rawName == null || rawName.isBlank()) {
                continue; // boş/whitespace isimleri sessizce atla
            }
            String name = rawName.trim();

            Tag tag = tagRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(name);
                        newTag.setSlug(resolveTagSlug(name));
                        return tagRepository.save(newTag);
                    });
            result.add(tag);
        }
        return result;
    }

    // CollectionServiceImpl.toSlug ile aynı Türkçe karakter dönüşümü - burada da
    // tekrar ediyoruz çünkü PostServiceImpl'in CollectionServiceImpl'e bağımlı
    // olmasını istemedik (iki servis birbirinden habersiz kalsın).
    private String resolveTagSlug(String name) {
        String transliterated = name
                .replace('ı', 'i').replace('İ', 'I')
                .replace('ş', 's').replace('Ş', 'S')
                .replace('ğ', 'g').replace('Ğ', 'G')
                .replace('ü', 'u').replace('Ü', 'U')
                .replace('ö', 'o').replace('Ö', 'O')
                .replace('ç', 'c').replace('Ç', 'C');

        String baseSlug = transliterated.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        String candidate = baseSlug;
        int suffix = 2;
        while (tagRepository.existsBySlug(candidate)) {
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    // Verilen sıralı medya referans listesinden PostMedia listesi kurar.
    // - null -> boş liste döner (createPost'ta "hiç görsel yok" anlamına gelir)
    // - Listedeki HERHANGİ bir mediaId veritabanında yoksa hata fırlatır
    //   (post'un sessizce eksik/kırık görselle kaydedilmesini önlemek için)
    // - sortOrder, listedeki SIRAYA göre otomatik atanır (0, 1, 2, ...)
    private List<PostMedia> resolveMedia(Post post, List<PostMediaRequestDto> mediaItems) {
        if (mediaItems == null || mediaItems.isEmpty()) {
            return new ArrayList<>();
        }

        List<PostMedia> result = new ArrayList<>();
        int order = 0;
        for (PostMediaRequestDto item : mediaItems) {
            Media media = mediaRepository.findById(item.getMediaId())
                    .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST,
                            "Medya bulunamadı (id: " + item.getMediaId() + ")")));

            PostMedia postMedia = new PostMedia();
            postMedia.setPost(post);
            postMedia.setMedia(media);
            postMedia.setCaption(item.getCaption());
            postMedia.setSortOrder(order++);
            result.add(postMedia);
        }
        return result;
    }

    // İstekten gelen status metnini güvenli şekilde enum'a çevirir; boş/geçersizse
    // verilen varsayılana düşer (yazı oluşturma sırasında hata fırlatıp editörü
    // takılı bırakmamak için).
    private PostStatus parseStatus(String rawStatus, PostStatus fallback) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return fallback;
        }
        try {
            return PostStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return fallback;
        }
    }

    @Override
    public PostResponseDto updatePost(String slug, PostRequestDto postRequestDto, String username, boolean isAdmin) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı")));

        // EDITOR sadece kendi yazısını güncelleyebilir; ADMIN hepsini güncelleyebilir
        if (!isAdmin && !post.getAuthor().getUsername().equals(username)) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Bu yazıyı düzenleme yetkiniz yok"));
        }

        // Eğer kullanıcı slug'ı da değiştirdiyse ve yeni slug başkasına aitse hata fırlat
        if (!post.getSlug().equals(postRequestDto.getSlug()) && postRepository.existsBySlug(postRequestDto.getSlug())) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Yeni slug zaten kullanımda"));
        }

        post.setSlug(postRequestDto.getSlug());
        post.setTitle(postRequestDto.getTitle());
        post.setContent(postRequestDto.getContent());
        post.setCoverMedia(resolveCoverMedia(postRequestDto.getCoverMediaId()));
        post.setStatus(parseStatus(postRequestDto.getStatus(), post.getStatus()));
        post.setLanguage(parseLanguage(postRequestDto.getLanguage(), post.getLanguage()));
        // NOT: collectionIds hiç gönderilmezse (null) mevcut atamalar korunur;
        // boş liste [] gönderilirse post bilerek tüm koleksiyonlardan çıkarılmış olur.
        if (postRequestDto.getCollectionIds() != null) {
            post.setCollections(resolveCollections(postRequestDto.getCollectionIds()));
        }
        // Aynı null-vs-boş-liste mantığı: tagNames hiç gönderilmezse mevcut
        // etiketler korunur, boş [] gönderilirse tüm etiketler kaldırılır.
        if (postRequestDto.getTagNames() != null) {
            post.setTags(resolveTags(postRequestDto.getTagNames()));
        }
        // Aynı null-vs-boş-liste mantığı: media hiç gönderilmezse mevcut görseller
        // korunur, boş [] gönderilirse post bilerek tüm içerik görsellerinden çıkarılır.
        if (postRequestDto.getMedia() != null) {
            post.setMedia(resolveMedia(post, postRequestDto.getMedia()));
        }
        applySeo(post, postRequestDto.getSeo());
        // Diğer basit alanlar (slug/title/image/content) gibi doğrudan üzerine yazılıyor -
        // liste alanlarındaki (media/tags/collections) null-korur mantığı burada geçerli değil.
        post.setPublishAt(postRequestDto.getPublishAt());
        // Yazı (elle ya da bu istekle) PUBLISHED durumuna geldiyse artık "zamanlanmış"
        // olmasının bir anlamı kalmıyor - eski bir tarih orada unutulmuş gibi durmasın.
        if (post.getStatus() == PostStatus.PUBLISHED) {
            post.setPublishAt(null);
        }

        Post updatedPost = postRepository.save(post);
        return mapToDto(updatedPost);
    }

    @Override
    public PostResponseDto getPostBySlug(String slug, String username, boolean isAdmin) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı")));

        if (!isAdmin && !post.getAuthor().getUsername().equals(username)) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Bu yazıyı görüntüleme yetkiniz yok"));
        }

        return mapToDto(post);
    }

    @Override
    public List<PostResponseDto> getAllPosts(String username, boolean isAdmin) {
        List<Post> posts = isAdmin
                ? postRepository.findAll()
                : postRepository.findAllByAuthor_Username(username);

        return posts.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deletePost(String slug, String username, boolean isAdmin) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı")));

        if (!isAdmin && !post.getAuthor().getUsername().equals(username)) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Bu yazıyı silme yetkiniz yok"));
        }

        postRepository.delete(post);
    }

    // ---------- CMS dışındaki (herkese açık) siteler için ----------

    @Override
    public List<PostResponseDto> getAllPublicPosts(String language, String collectionSlug) {
        Language languageFilter = null;
        if (language != null && !language.isBlank()) {
            try {
                languageFilter = Language.valueOf(language.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR,
                        "Geçersiz dil: " + language + " (izin verilenler: TR, EN, DE, RU)"));
            }
        }

        final Language finalLanguageFilter = languageFilter;

        // Sadece yayınlanmış yazılar public API'de görünür - draft'lar burada listelenmez.
        return postRepository.findAll().stream()
                .filter(post -> post.getStatus() == PostStatus.PUBLISHED)
                .filter(post -> finalLanguageFilter == null || post.getLanguage() == finalLanguageFilter)
                .filter(post -> collectionSlug == null || collectionSlug.isBlank()
                        || post.getCollections().stream().anyMatch(c -> c.getSlug().equals(collectionSlug)))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PostResponseDto getPublicPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı")));

        // Draft bir yazının linkini bilen biri direkt slug ile de erişemesin.
        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı"));
        }

        return mapToDto(post);
    }

    // ---------- SEO fallback zinciri ----------
    // Editör bir alanı boş bıraktıysa, o alan için mantıklı bir varsayım üretiyoruz.
    // Bu sayede hiçbir yazı "SEO'suz" kalmıyor, ama editör istediğinde ince ayar yapabiliyor.
    private PostSeoResponseDto resolveSeo(Post post) {
        String metaTitle = hasText(post.getMetaTitle()) ? post.getMetaTitle() : post.getTitle();

        String metaDescription = hasText(post.getMetaDescription())
                ? post.getMetaDescription()
                : buildExcerpt(post.getContent(), 155);

        String ogImageUrl = hasText(post.getOgImageUrl()) ? post.getOgImageUrl() : resolveMediaUrl(post.getCoverMedia());

        String canonicalUrl = hasText(post.getCanonicalUrl())
                ? post.getCanonicalUrl()
                : buildCanonicalUrl(post);

        return new PostSeoResponseDto(metaTitle, metaDescription, ogImageUrl, canonicalUrl, post.isNoIndex());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    // https://revloai.com/tr/blog/<slug> gibi - site.public-base-url + dil + /blog/ + slug.
    // Dil kodu küçük harfe çevriliyor çünkü URL segmentleri geleneksel olarak küçük harf olur (TR -> tr).
    private String buildCanonicalUrl(Post post) {
        return siteBaseUrl + "/" + post.getLanguage().name().toLowerCase() + "/blog/" + post.getSlug();
    }

    // İçerikten (markdown/html işaretlemesi temizlenmiş) otomatik meta açıklama üretir.
    // Kelime ortasından kesmemek için son kelimeyi tam bırakıp "..." ekliyoruz.
    private String buildExcerpt(String content, int maxLength) {
        if (content == null || content.isBlank()) {
            return null;
        }

        // Markdown/HTML işaretlemesini temizle (#, *, _, `, <tag> vb.) - basit ama etkili bir yaklaşım
        String plainText = content
                .replaceAll("<[^>]+>", " ")       // HTML tag'leri
                .replaceAll("[#*_`>]", " ")        // Yaygın markdown işaretleri
                .replaceAll("\\s+", " ")           // Fazla boşlukları teke indir
                .trim();

        if (plainText.length() <= maxLength) {
            return plainText;
        }

        // maxLength'te kes, sonra son (yarım kalmış) kelimeyi at
        String truncated = plainText.substring(0, maxLength);
        int lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) {
            truncated = truncated.substring(0, lastSpace);
        }
        return truncated + "...";
    }

    // Ortalama okuma hızı (200 kelime/dakika) üzerinden tahmini okuma süresi.
    // En az 1 dakika döner - 0 dakika göstermek garip kaçar (çok kısa yazılarda bile).
    private int calculateReadingTime(String content) {
        if (content == null || content.isBlank()) {
            return 1;
        }
        int wordCount = content.trim().split("\\s+").length;
        int minutes = (int) Math.ceil((double) wordCount / WORDS_PER_MINUTE);
        return Math.max(minutes, 1);
    }

    // Entity -> DTO Dönüşümünü yapan yardımcı metot (Boilerplate kodu engeller)
    private PostResponseDto mapToDto(Post post) {
        List<CollectionSummaryDto> collectionDtos = post.getCollections().stream()
                .map(c -> new CollectionSummaryDto(c.getId(), c.getName(), c.getSlug()))
                .collect(Collectors.toList());

        List<TagSummaryDto> tagDtos = post.getTags().stream()
                .map(t -> new TagSummaryDto(t.getId(), t.getName(), t.getSlug()))
                .collect(Collectors.toList());

        // post.getMedia() zaten @OrderBy("sortOrder ASC") ile sıralı geliyor
        List<PostMediaResponseDto> mediaDtos = post.getMedia().stream()
                .map(pm -> new PostMediaResponseDto(
                        pm.getMedia().getId(),
                        toAbsoluteUrl(pm.getMedia().getFileUrl()),
                        pm.getCaption(),
                        pm.getSortOrder()
                ))
                .collect(Collectors.toList());

        return new PostResponseDto(
                post.getId(),
                post.getSlug(),
                post.getTitle(),
                resolveMediaUrl(post.getCoverMedia()),
                post.getContent(),
                post.getStatus().name(),
                post.getLanguage().name(),
                collectionDtos,
                tagDtos,
                mediaDtos,
                resolveSeo(post),
                calculateReadingTime(post.getContent()),
                post.getPublishAt(),
                post.getAuthor().getUsername(), // Yazarın sadece adını dönüyoruz
                post.getAuthor().getFullName(),
                resolveMediaUrl(post.getAuthor().getAvatarMedia()),
                post.getAuthor().getSlug(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    // Media ilişkisini (kapak görseli ya da yazarın avatarı) mutlak URL'e çevirir.
    // Media null ise (görsel/avatar seçilmemişse) null döner - bu geçerli bir durum.
    private String resolveMediaUrl(Media media) {
        return media != null ? toAbsoluteUrl(media.getFileUrl()) : null;
    }

    // MediaServiceImpl'deki toAbsoluteUrl ile aynı mantık - göreli path'i
    // isteğin geldiği domain ile mutlak URL'e çevirir.
    private String toAbsoluteUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.startsWith("http")) {
            return fileUrl;
        }
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return baseUrl + fileUrl;
    }
}