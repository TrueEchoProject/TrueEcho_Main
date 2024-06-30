package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;



@Getter
@Builder
public class PostListResponse {
    private final String yourLocation;
    private final int postCount;
    private final List<ReadPostResponse> readPostResponse;
    private final PostedIn24H postedIn24H;
}
