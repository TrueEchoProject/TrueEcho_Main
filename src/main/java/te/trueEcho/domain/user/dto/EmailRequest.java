package te.trueEcho.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class EmailRequest {
    @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "이메일", example = "trueEcho@gmail.com",requiredMode = Schema.RequiredMode.REQUIRED)
    private String nickname;
    @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "이메일", example = "trueEcho@gmail.com",requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;
}
