package te.trueEcho.domain.setting.dto;


import lombok.Builder;
import lombok.Getter;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Builder
@Getter
public class MonthlyPostResponse {
    private final Long postId;
    private final LocalDateTime createdAt;
    private final String postFrontUrl;
    private final String postBackUrl;
}
