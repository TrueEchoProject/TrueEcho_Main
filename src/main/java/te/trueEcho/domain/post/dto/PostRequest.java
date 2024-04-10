package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostRequest {
    private int pageCount;
    private int index;
    private String location;
    private FeedType type;

}



