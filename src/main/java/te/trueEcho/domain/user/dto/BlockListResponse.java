package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "차단된 사용자 목록 응답 DTO")
@Getter
@Builder
public class BlockListResponse {

    @Schema(description = "사용자 ID", example = "123")
    private Long userId;

    @Schema(description = "사용자 프로필 URL", example = "http://example.com/profile.jpg")
    private String userProfileUrl;

    @Schema(description = "닉네임", example = "userNickname")
    private String nickname;
}
