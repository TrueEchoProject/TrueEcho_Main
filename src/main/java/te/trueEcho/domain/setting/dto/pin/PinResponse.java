package te.trueEcho.domain.setting.dto.pin;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Schema(description = "핀 응답 DTO")
@Builder
@Getter
public class PinResponse {

    @Schema(description = "핀 ID", example = "1", required = true)
    private final Long pinId;

    @Schema(description = "게시물 ID", example = "123", required = true)
    private final Long postId;

    @Schema(description = "핀 생성 날짜", example = "2023-05-20T15:30:00", required = true)
    private final LocalDateTime createdAt;

    @Schema(description = "게시물 앞면 URL", example = "http://example.com/postFront.jpg", required = true)
    private final String postFrontUrl;

    @Schema(description = "게시물 뒷면 URL", example = "http://example.com/postBack.jpg", required = true)
    private final String postBackUrl;
}
