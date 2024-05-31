package te.trueEcho.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdatePasswordRequest {
    private final String email;
    private final String newPassword;
}
