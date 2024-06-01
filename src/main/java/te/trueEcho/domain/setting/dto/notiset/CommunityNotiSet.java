package te.trueEcho.domain.setting.dto.notiset;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "커뮤니티 알림 설정 DTO")
public class CommunityNotiSet {

    @Schema(description = "랭킹 진입 알림 여부", example = "true", required = true)
    private final boolean inRank;

    @Schema(description = "새로운 랭킹 알림 여부", example = "true", required = true)
    private final boolean newRank;

    @Schema(description = "투표 결과 알림 여부", example = "true", required = true)
    private final boolean voteResult;
}
