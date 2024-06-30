package te.trueEcho.domain.setting.dto.mypage;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.setting.dto.pin.PinListResponse;

@Getter
@Builder
@Schema(description = "타 사용자 페이지 응답 DTO")
public class OtherPageResponse {

    @Schema(description = "사용자 ID", example = "123456", required = true)
    private final Long userId;

    @Schema(description = "마이페이지 정보", required = true)
    private final MyPageResponse pageInfo;

    @Schema(description = "친구 여부", example = "true", required = true)
    private final boolean isFriend;

    @Schema(description = "핀 목록", required = true)
    private final PinListResponse pinList;
}
