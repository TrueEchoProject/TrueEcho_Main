package te.trueEcho.domain.setting.dto.random;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;

@Getter
@Builder
@Schema(description = "랜덤 알림 시간 응답 DTO")
public class RandomNotifyTResponse {

    @Schema(description = "랜덤 알림 시간 상태", required = true)
    private final NotiTimeStatus randomNotifyTime;

    @Schema(description = "응답 메시지")
    private final String msg;
}
