package com.example.service.impl;

import com.example.dto.tag.TagDeleteResultDto;
import com.example.dto.tag.TagResponseDto;
import com.example.entity.Post;
import com.example.entity.Tag;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.repository.PostRepository;
import com.example.repository.TagRepository;
import com.example.service.ITagService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagServiceImpl implements ITagService {

    private final TagRepository tagRepository;
    private final PostRepository postRepository;

    public TagServiceImpl(TagRepository tagRepository, PostRepository postRepository) {
        this.tagRepository = tagRepository;
        this.postRepository = postRepository;
    }

    @Override
    public List<TagResponseDto> getAllTags() {
        // Herhangi bir giriş yapmış kullanıcı görebilir - post yazarken
        // otomatik tamamlama (autocomplete) listesi olarak kullanılacak.
        return tagRepository.findAll().stream()
                .map(t -> new TagResponseDto(t.getId(), t.getName(), t.getSlug(), postRepository.findAllByTags_Id(t.getId()).size()))
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public TagDeleteResultDto deleteTag(Long id, boolean isAdmin, boolean confirm) {
        // Tag'ler serbestçe editörler tarafından oluşturulabiliyor ama SİLİNMESİ
        // (temizlik/moderasyon amaçlı) yine de ADMIN'e kısıtlı - aksi halde bir
        // editör başka bir editörün yazılarında kullandığı tag'i silebilirdi.
        if (!isAdmin) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Tag silme yetkiniz yok"));
        }

        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Tag bulunamadı")));

        List<Post> affectedPosts = postRepository.findAllByTags_Id(id);

        // Collections'daki ile aynı iki aşamalı onay deseni.
        if (!affectedPosts.isEmpty() && !confirm) {
            return new TagDeleteResultDto(
                    false,
                    affectedPosts.size(),
                    "Bu etiket " + affectedPosts.size() + " yazıda kullanılıyor. Silmeye devam etmek için isteği confirm=true parametresiyle tekrar gönderin. Yazıların kendisi silinmeyecek, sadece bu etiketten çıkarılacak."
            );
        }

        for (Post post : affectedPosts) {
            post.getTags().remove(tag);
        }
        postRepository.saveAll(affectedPosts);

        tagRepository.delete(tag);

        return new TagDeleteResultDto(true, affectedPosts.size(), "Etiket silindi.");
    }
}