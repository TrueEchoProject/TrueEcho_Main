package te.trueEcho.domain.post.dto;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SinglePostRequest {
    private final Long postId;
    private final boolean requireRefresh;
}
