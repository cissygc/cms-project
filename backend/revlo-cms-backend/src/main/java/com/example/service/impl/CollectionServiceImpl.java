package com.example.service.impl;

import com.example.dto.collection.CollectionRequestDto;
import com.example.dto.collection.CollectionResponseDto;
import com.example.entity.Collection;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.repository.CollectionRepository;
import com.example.repository.PostRepository;
import com.example.service.ICollectionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CollectionServiceImpl implements ICollectionService {

    private final CollectionRepository collectionRepository;
    private final PostRepository postRepository;

    public CollectionServiceImpl(CollectionRepository collectionRepository, PostRepository postRepository) {
        this.collectionRepository = collectionRepository;
        this.postRepository = postRepository;
    }

    @Override
    public List<CollectionResponseDto> getAllCollections() {
        // Herhangi bir giriş yapmış kullanıcı (ADMIN veya EDITOR) görebilir -
        // post oluştururken/düzenlerken hangi koleksiyonlar var diye seçim yapabilmesi için.
        return collectionRepository.findAll().stream()
                .map(c -> new CollectionResponseDto(
                        c.getId(),
                        c.getName(),
                        c.getSlug(),
                        postRepository.countByCollections_Id(c.getId())
                ))
                .collect(Collectors.toList());
    }

    @Override
    public CollectionResponseDto createCollection(CollectionRequestDto dto, boolean isAdmin) {
        // Koleksiyon (kategori/taksonomi) yönetimi sadece ADMIN'e açık - editörler
        // sadece var olan koleksiyonlara post atayabilir, yeni koleksiyon oluşturamaz.
        if (!isAdmin) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Koleksiyon oluşturma yetkiniz yok"));
        }

        if (collectionRepository.existsByName(dto.getName())) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Bu isimde bir koleksiyon zaten var"));
        }

        Collection collection = new Collection();
        collection.setName(dto.getName());
        collection.setSlug(resolveSlug(dto.getSlug(), dto.getName()));

        Collection saved = collectionRepository.save(collection);
        return new CollectionResponseDto(saved.getId(), saved.getName(), saved.getSlug(), 0);
    }

    @Override
    public void deleteCollection(Long id, boolean isAdmin) {
        if (!isAdmin) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Koleksiyon silme yetkiniz yok"));
        }

        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Koleksiyon bulunamadı")));

        // İçinde post olan bir koleksiyonun sessizce silinmesini engelle - post'lar
        // "kategorisiz" kalıp fark edilmeyebilir. Önce post'ları başka koleksiyona
        // taşımaları/çıkarmaları gerekiyor.
        long postCount = postRepository.countByCollections_Id(id);
        if (postCount > 0) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR,
                    "Bu koleksiyonda " + postCount + " adet yazı var. Önce yazıları başka koleksiyona taşıyın veya bu koleksiyondan çıkarın"));
        }

        collectionRepository.delete(collection);
    }

    private String resolveSlug(String requestedSlug, String name) {
        if (requestedSlug != null && !requestedSlug.isBlank()) {
            if (collectionRepository.existsBySlug(requestedSlug)) {
                throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Bu slug zaten kullanımda"));
            }
            return requestedSlug;
        }

        String baseSlug = toSlug(name);
        String candidate = baseSlug;
        int suffix = 2;
        while (collectionRepository.existsBySlug(candidate)) {
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    // Türkçe karakterleri (ş, ç, ğ, ü, ö, ı, İ) ASCII karşılıklarına çevirip
    // ardından slug formatına indirger.
    private String toSlug(String input) {
        String transliterated = input
                .replace('ı', 'i').replace('İ', 'I')
                .replace('ş', 's').replace('Ş', 'S')
                .replace('ğ', 'g').replace('Ğ', 'G')
                .replace('ü', 'u').replace('Ü', 'U')
                .replace('ö', 'o').replace('Ö', 'O')
                .replace('ç', 'c').replace('Ç', 'C');

        return transliterated.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}