package te.trueEcho.domain.vote.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "투표 응답 DTO")
@Builder
@Getter
public class VoteResponse {

    @Schema(description = "투표 ID", example = "1")
    Long id;

    @Schema(description = "투표 제목", example = "Best Programming Language")
    String title;

    @Schema(description = "투표 카테고리", example = "Technology")
    String category;
}
