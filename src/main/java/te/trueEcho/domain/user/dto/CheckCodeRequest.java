package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CheckCodeRequest {
    @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "이메일 인증코드", example = "24325",requiredMode = Schema.RequiredMode.REQUIRED)
    private String checkCode;
    @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "이메일", example = "trueEcho@gmail.com",requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;
}
