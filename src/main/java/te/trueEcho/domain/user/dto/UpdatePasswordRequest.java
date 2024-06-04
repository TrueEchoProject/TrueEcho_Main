package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "비밀번호 수정 요청 DTO")
@Getter
@Builder
public class UpdatePasswordRequest {

    @Schema(description = "이메일", example = "trueEcho@gmail.com", required = true)
    private final String email;

    @Schema(description = "새 비밀번호", example = "newSecurePassword123!", required = true)
    private final String newPassword;
}
