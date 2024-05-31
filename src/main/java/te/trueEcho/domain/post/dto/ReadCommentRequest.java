package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ReadCommentRequest {

    Long postId;
    int index;
    int pageCount;
}
