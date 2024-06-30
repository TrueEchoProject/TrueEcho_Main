package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Schema(description = "로그인 요청 DTO")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class LoginRequest {

    @Schema(description = "이메일", example = "trueEcho@gmail.com", required = true)
    @NotNull(message = "이메일을 입력해주세요")
    @Size(min = 3, max = 50, message = "이메일은 3자 이상 50자 이하여야 합니다")
    private String email;

    @Schema(description = "비밀번호", example = "a12341234", required = true)
    @NotNull(message = "비밀번호를 입력해주세요")
    @Size(min = 3, max = 100, message = "비밀번호는 3자 이상 100자 이하여야 합니다")
    private String password;
}
