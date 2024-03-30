package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.validation.annotation.Validated;
import te.trueEcho.domain.user.entity.Gender;
import te.trueEcho.domain.user.entity.NotiTimeStatus;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Validated
public class SignUpUserDto {
        @Schema(accessMode = Schema.AccessMode.READ_ONLY, name = "닉네임", example = "홍길동이지",requiredMode = Schema.RequiredMode.REQUIRED)
        private String username;

        @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "비밀번호", example = "truefalse02!",requiredMode = Schema.RequiredMode.REQUIRED)
        private String password;

        @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "이메일", example = "trueEcho@gmail.com",requiredMode = Schema.RequiredMode.REQUIRED)
        private String email;

        @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "성별", example = "남자(1)/여자(0)",requiredMode = Schema.RequiredMode.REQUIRED)
        private Gender gender;

        @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "생년월일", example = "2000-1-1",requiredMode = Schema.RequiredMode.REQUIRED)
        private LocalDate dob;

        @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "성별", example = "00-05(0)/06-11(1)/12-17(2)/18-23(3)",requiredMode = Schema.RequiredMode.REQUIRED)
        private NotiTimeStatus notificationTime;

        @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "지역", example = "서울광역시 용산구",requiredMode = Schema.RequiredMode.REQUIRED)
        private String location;

        @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "이메일 인증번호", example = "123123",requiredMode = Schema.RequiredMode.REQUIRED)
        private String checkCode;
}
