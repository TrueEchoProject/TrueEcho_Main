package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;


@Getter
@Builder
public class CommentListResponse {
    private Long postId;
    private int commentCount;
    private List<CommentResponse> comments;
}
