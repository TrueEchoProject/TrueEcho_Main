package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(description = "사용자 확인 요청 DTO")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class UserCheckRequest {

    @Schema(description = "닉네임", example = "trueEchoUser", required = true)
    private String nickname;

    @Schema(description = "이메일", example = "trueEcho@gmail.com", required = true)
    private String email;
}
