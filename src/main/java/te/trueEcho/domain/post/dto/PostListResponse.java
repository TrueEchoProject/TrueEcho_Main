package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;



@Getter
@Builder
public class PostListResponse {
    String yourLocation;
    int postCount;
    List<ReadPostResponse> readPostRespons;
}
