package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import te.trueEcho.domain.user.entity.Gender;
import te.trueEcho.domain.user.entity.User;

import java.time.LocalDate;

@Schema(description = "사용자 정보 수정 응답 DTO")
@Getter
@Setter
@AllArgsConstructor
public class EditUserResponse {

    @Schema(description = "이름", example = "John Doe")
    private String name;

    @Schema(description = "성별", example = "MALE")
    private Gender gender;

    @Schema(description = "생년월일", example = "1990-01-01")
    private LocalDate birthday;

    @Schema(description = "위치", example = "Seoul")
    private String location;

    public EditUserResponse(User user) {
        this.name = user.getName();
        this.gender = user.getGender();
        this.birthday = user.getBirthday();
        this.location = user.getLocation();
    }
}
