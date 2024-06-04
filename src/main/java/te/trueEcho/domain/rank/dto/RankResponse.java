package te.trueEcho.domain.rank.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import org.apache.catalina.User;
import te.trueEcho.domain.post.dto.CommentResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Builder
@Getter
@Schema(description = "랭킹 응답 DTO")
public class RankResponse {
    @Schema(description = "투표 ID", example = "1", required = true)
    private final Long voteId;

    @Schema(description = "제목", example = "Best Movie of the Year", required = true)
    private final String title;

    @Schema(description = "카테고리", example = "Movies", required = true)
    private final String category;

    @Schema(description = "상위 랭킹 리스트", required = true)
    private final List<RankUserResponse> topRankList;
}
