package te.trueEcho.domain.setting.dto.pin;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;


@Builder
@Getter

public class PinResponse {
    private final Long pinId;
    private final Long postId;
    private final LocalDateTime createdAt;
    private final String postFrontUrl;
    private final String postBackUrl;
}
