package te.trueEcho.domain.rank.dto;

import lombok.Builder;
import lombok.Getter;
import org.apache.catalina.User;
import te.trueEcho.domain.post.dto.CommentResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Builder
@Getter
public class RankResponse {
    private final Long voteId;
    private final String title;
    private final String category;
    private final List<RankUserResponse> topRankList;
}
