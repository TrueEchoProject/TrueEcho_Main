package te.trueEcho.domain.post.dto;


import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.notification.dto.NotificationDto;

@Builder
@Getter
public class WriteCommentRequest {

    private final Long postId;
    private final String content;
    private final Long parentCommentId;
    private final Long receiverId;
}
