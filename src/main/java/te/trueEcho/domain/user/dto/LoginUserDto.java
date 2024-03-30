package te.trueEcho.domain.user.dto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class LoginUserDto {

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, name = "이메일", example = "trueEcho@gmail.com",requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, name = "비밀번호", example = "a12341234",requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;
}