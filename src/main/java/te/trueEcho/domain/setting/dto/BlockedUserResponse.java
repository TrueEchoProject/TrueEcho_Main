package te.trueEcho.domain.setting.dto;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BlockedUserResponse {
    private final Long blockedUserId;
    private final String blockedUserName;
    private final String blockedUserProfileUrl;
}
