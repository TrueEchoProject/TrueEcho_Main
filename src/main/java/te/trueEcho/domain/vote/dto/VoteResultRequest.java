package te.trueEcho.domain.vote.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "투표 결과 요청 DTO")
@Builder
@Getter
public class VoteResultRequest {

    @Schema(description = "사용자 ID", example = "1")
    Long userId;

    @Schema(description = "투표 ID", example = "101")
    Long voteId;
}
