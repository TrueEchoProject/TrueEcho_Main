package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.post.entity.PostStatus;
import te.trueEcho.global.response.ResponseInterface;

import java.time.LocalDateTime;


@Getter
@Builder
public class ReadPostResponse implements ResponseInterface {
        private  final String username;
        private final Long userId;
        private final boolean isMine;
        private  final String profileUrl;
        private final Long postId;
        private  final String title;
        private final  PostStatus status;
        private final int likesCount;
        private  final String postFrontUrl;
        private final String postBackUrl;
        private final LocalDateTime createdAt;
        private final int commentCount;
        private final boolean isFriend;
        private final boolean isMyLike;
    }

