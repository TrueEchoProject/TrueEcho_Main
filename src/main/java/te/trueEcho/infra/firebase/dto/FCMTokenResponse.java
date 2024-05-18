package te.trueEcho.infra.firebase.dto;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class FCMTokenResponse {
    private Long userId;
    private String fcmToken;
}
