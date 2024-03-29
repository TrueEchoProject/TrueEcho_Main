package te.trueEcho.domain.user.dto;

import lombok.*;
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class EditUserDto {
    private String userName;
    private String accountNumber;
    private String bankName;
    private String realName;
    private String pinNumber;
}
