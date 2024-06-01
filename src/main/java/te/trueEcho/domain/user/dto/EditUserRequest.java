package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import te.trueEcho.domain.user.entity.Gender;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;

import java.time.LocalDate;

@Schema(description = "사용자 정보 수정 요청 DTO")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class EditUserRequest {

    @Schema(description = "이름", example = "John Doe", required = true)
    @Length(min = 2, max = 12, message = "이름은 2문자 이상 12문자 이하여야 합니다")
    private String name;

    @Schema(description = "비밀번호", example = "securepassword123", required = true)
    @Length(min = 4, max = 12, message = "비밀번호는 4문자 이상 12문자 이하여야 합니다")
    @NotBlank(message = "비밀번호를 입력해주세요")
    private String password;

    @Schema(description = "성별", example = "MALE", required = true)
    private Gender gender;

    @Schema(description = "알림 시간 설정", example = "MORNING", required = true)
    private NotiTimeStatus notificationTime;

    @Schema(description = "알림 설정 여부", example = "true", required = true)
    private boolean notificationSetting;

    @Schema(description = "생년월일", example = "1990-01-01", required = true)
    private LocalDate birthday;
}
