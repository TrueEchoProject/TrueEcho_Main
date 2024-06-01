package te.trueEcho.domain.setting.dto.mypage;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "개인 정보 응답 DTO")
@Builder
@Getter
public class MyInfoResponse {

    @Schema(description = "닉네임", example = "nicknameExample", required = true)
    private final String nickname;

    @Schema(description = "사용자 이름", example = "usernameExample", required = true)
    private final String username;

    @Schema(description = "프로필 URL", example = "http://example.com/profile.jpg", required = true)
    private final String profileUrl;

    @Schema(description = "사용자의 위치", example = "서울광역시 용산구", required = true)
    private final String yourLocation;

    @Schema(description = "경도 x 좌표", example = "127.0", required = true)
    private final double x;

    @Schema(description = "위도 y 좌표", example = "37.5", required = true)
    private final double y;
}
