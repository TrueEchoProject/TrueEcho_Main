package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.post.entity.PostStatus;

import java.time.LocalDateTime;


@Getter
@Builder
public class ReadPostResponse {
        private String username;
        private Long userId;
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

