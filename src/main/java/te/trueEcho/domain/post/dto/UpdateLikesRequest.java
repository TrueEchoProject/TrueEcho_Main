package te.trueEcho.domain.post.dto;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateLikesRequest {
    private final Long postId;
    private final boolean isLike;
}
