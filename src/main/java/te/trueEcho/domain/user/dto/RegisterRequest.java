package te.trueEcho.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.validation.annotation.Validated;
import te.trueEcho.domain.user.entity.Gender;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;

import java.time.LocalDate;

@Schema(description = "회원가입 요청 DTO")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Validated
public class RegisterRequest {

        @Schema(description = "닉네임", example = "홍길동이지", required = true)
        @NotNull
        @Size(min = 3, max = 50)
        private String nickname;

        @Schema(description = "비밀번호", example = "truefalse02!", required = true)
        @NotNull
        @Size(min = 3, max = 100)
        private String password;

        @Schema(description = "이름", example = "홍길동", required = true)
        @NotNull
        @Size(min = 2, max = 12)
        private String name;

        @Schema(description = "이메일", example = "trueEcho@gmail.com", required = true)
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        @NotNull
        @Size(min = 3, max = 50)
        private String email;

        @Schema(description = "성별", example = "MALE", required = true)
        private Gender gender;

        @Schema(description = "생년월일", example = "2000-01-01", required = true)
        @NotNull
        private LocalDate dob;

        @Schema(description = "알림 시간", example = "MORNING", required = true)
        private int notificationTime;

        @Schema(description = "경도 x 좌표", example = "127.0", required = true)
        private double x;

        @Schema(description = "위도 y 좌표", example = "37.5", required = true)
        private double y;
}
