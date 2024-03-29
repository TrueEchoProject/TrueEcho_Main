package te.trueEcho.domain.user.dto;
import io.swagger.annotations.ApiModelProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class LoginUserDto {

    @ApiModelProperty(value = "이메일", example = "trueEcho@gmail.com", required = true)
    private String email;

    @ApiModelProperty(value = "비밀번호", example = "a12341234", required = true)
    private String password;
}