package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReadPostRequest {
    private final int pageCount;
    private final int index;
    private final String location;
    private final FeedType type;
    private final boolean requireRefresh;
}



