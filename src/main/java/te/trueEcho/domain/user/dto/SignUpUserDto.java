package te.trueEcho.domain.user.dto;


import io.swagger.annotations.ApiModelProperty;
import lombok.*;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Validated
public class SignUpUserDto {
    @ApiModelProperty(value = "닉네임", example = "홍길동이지", required = true)
    private String username;

    @ApiModelProperty(value = "비밀번호", example = "truefalse02!", required = true)
    private String password;

    @ApiModelProperty(value = "이메일", example = "trueEcho@gmail.com", required = true)
    private String email;

    @ApiModelProperty(value = "이메일 인증코드", example = "true00", required = true)
    private String code;

    @ApiModelProperty(value = "성별", example = "남자(1)/여자(0)", required = true)
    private int gender;

    @ApiModelProperty(value = "생년월일", example = "2000-1-1", required = true)
    private String dob;

    @ApiModelProperty(value = "성별", example = "00-05(0)/06-11(1)/12-17(2)/18-23(3)", required = true)
    private int notificationTime;

    @ApiModelProperty(value = "지역", example = "서울광역시 용산구", required = true)
    private String location;

    @ApiModelProperty(value = "이메일 인증번호", example = "123123", required = true)
    private int checkCode;
}
