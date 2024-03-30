package te.trueEcho.domain.user.dto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class LoginUserDto {

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, name = "이메일", example = "trueEcho@gmail.com",requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull
    @Size(min = 3, max = 50)
    private String email;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, name = "비밀번호", example = "a12341234",requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull
    @Size(min = 3, max = 100)
    private String password;
}