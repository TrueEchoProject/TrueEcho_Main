package te.trueEcho.domain.setting.dto;


import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BlockedUserListResponse {
    private final int blockedUserNum;
    private final List<BlockedUserResponse> blockedUserList;
}
