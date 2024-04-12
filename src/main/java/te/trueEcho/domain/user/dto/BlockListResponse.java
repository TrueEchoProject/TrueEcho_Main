package te.trueEcho.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BlockListResponse {
    private Long userId;
    private String userProfileUrl;
    private String nickname;
}