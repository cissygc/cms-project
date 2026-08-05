package com.example.scheduler;

import com.example.entity.Post;
import com.example.entity.PostStatus;
import com.example.repository.PostRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// Zamanlanmış yayın: her 60 saniyede bir, durumu hâlâ DRAFT olup yayın
// tarihi (publishAt) geçmişte/şimdi kalmış yazıları bulup otomatik olarak
// PUBLISHED'e çevirir. Editör bir yazıyı ileri bir tarihe zamanlayıp
// taslak olarak kaydettiğinde devreye giren mekanizma budur.
@Component
public class PostPublishScheduler {

    private final PostRepository postRepository;

    public PostPublishScheduler(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void publishDuePosts() {
        List<Post> duePosts = postRepository.findAllByStatusAndPublishAtLessThanEqual(
                PostStatus.DRAFT, LocalDateTime.now());

        if (duePosts.isEmpty()) {
            return;
        }

        for (Post post : duePosts) {
            post.setStatus(PostStatus.PUBLISHED);
            // Yazı artık yayında - eski zamanlama tarihinin orada unutulmuş
            // gibi durmasının bir anlamı kalmıyor (updatePost'taki mantıkla
            // tutarlı - bkz. PostServiceImpl).
            post.setPublishAt(null);
        }

        postRepository.saveAll(duePosts);
    }
}