package te.trueEcho.domain.user.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class EmailUserDto {
    @ApiModelProperty(value = "이메일", example = "trueEcho@gmail.com", required = true)
    private String username;
    private String email;
    private String checkCode;
}
