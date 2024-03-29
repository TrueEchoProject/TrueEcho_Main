package te.trueEcho.domain.user.dto;
import lombok.*;

@Getter
@Setter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class LoginUserDto {

    private String userName;
    private String password;
}