package te.trueEcho.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import te.trueEcho.domain.user.entity.Gender;
import te.trueEcho.domain.user.entity.NotiTimeStatus;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class EditUserRequest {

    @Length(min = 2, max = 12, message = "이름은 2문자 이상 12문자 이하여야 합니다")
    private String name;

    @Length(min = 4, max = 12, message = "비밀번호는 4문자 이상 12문자 이하여야 합니다")
    @NotBlank(message = "비밀번호를 입력해주세요")
    private String password;

//    @Pattern(regexp = "^MALE|FEMALE|PRIVATE$", message = "올바르지 않는 성별입니다")
    private Gender gender;

    private NotiTimeStatus notificationTime;

    private boolean notificationSetting;

    //    @Pattern(regexp = "^\\d{3}-\\d{3,4}-\\d{4}$", message = "휴대폰 번호 양식이 맞지 않습니다") 차후 패턴 추가
    private LocalDate birthday;

    private String location;
}
