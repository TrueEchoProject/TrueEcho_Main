package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.bind.annotation.GetMapping;
import te.trueEcho.domain.post.entity.PostStatus;

import java.time.LocalDateTime;
import java.util.List;


@Getter
@Builder
public class PostDto {
        private String username;
        private String profileUrl;
        private Long postId;
        private String title;
        private PostStatus status;
        private int likesCount;
        private String postFrontUrl;
        private String postBackUrl;
        private LocalDateTime createdAt;
        private int commentCount;
    }

