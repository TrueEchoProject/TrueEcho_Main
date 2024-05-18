package te.trueEcho.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import te.trueEcho.domain.user.entity.Gender;
import te.trueEcho.domain.user.entity.NotiTimeStatus;
import te.trueEcho.domain.user.entity.User;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class EditUserResponse {

    private String name;

    private Gender gender;

    //    @Pattern(regexp = "^\\d{3}-\\d{3,4}-\\d{4}$", message = "휴대폰 번호 양식이 맞지 않습니다") 차후 패턴 추가
    private LocalDate birthday;

    private String location;

    public EditUserResponse(User user) {
        this.name = user.getName();
        this.gender = user.getGender();
        this.birthday = user.getBirthday();
        this.location = user.getLocation();
    }
}
