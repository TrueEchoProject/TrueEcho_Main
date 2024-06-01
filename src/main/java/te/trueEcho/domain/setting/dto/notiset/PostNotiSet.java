package te.trueEcho.domain.setting.dto.notiset;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "게시물 알림 설정 DTO")
public class PostNotiSet {

    @Schema(description = "게시물 좋아요 알림 여부", example = "true", required = true)
    private final boolean postLike;

    @Schema(description = "새 댓글 알림 여부", example = "true", required = true)
    private final boolean newComment;

    @Schema(description = "댓글에 대한 답글 알림 여부", example = "true", required = true)
    private final boolean subComment;
}
