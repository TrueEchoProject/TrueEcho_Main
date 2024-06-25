package te.trueEcho.domain.setting.dto.notiset;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "알림 설정 DTO")
public class NotificationSettingDto {

    @Schema(description = "커뮤니티 알림 설정", required = true)
    private CommunityNotiSet communityNotiSet;

    @Schema(description = "게시물 알림 설정", required = true)
    private PostNotiSet postNotiSet;

    @Schema(description = "친구 요청 알림 설정", example = "true", required = true)
    private boolean friendRequest;

    @Schema(description = "사진 시간 알림 설정", example = "true", required = true)
    private boolean photoTime;

    @Schema(description = "서비스 알림 설정", example = "true", required = true)
    private boolean service;
}
