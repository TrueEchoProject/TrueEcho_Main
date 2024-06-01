package te.trueEcho.infra.firebase.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(description = "FCM 토큰 응답 DTO")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class FCMTokenResponse {

    @Schema(description = "사용자 ID", example = "123")
    private Long userId;

    @Schema(description = "FCM 토큰", example = "fcm_token_example")
    private String fcmToken;
}
