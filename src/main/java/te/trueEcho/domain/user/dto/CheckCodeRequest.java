package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
@Schema(description = "이메일 인증코드 요청 DTO")
@Getter
@Builder
public class CheckCodeRequest {
    @Schema(description = "이메일 인증코드", example = "24325", required = true)
    private String checkCode;

    @Schema(description = "이메일 주소", example = "trueEcho@gmail.com", required = true)
    private String email;
}
