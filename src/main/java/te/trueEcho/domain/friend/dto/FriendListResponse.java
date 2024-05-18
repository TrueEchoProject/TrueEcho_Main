package te.trueEcho.domain.friend.dto;

import lombok.*;

@Getter
@Builder
public class FriendListResponse {

    private Long userId;
    private String userProfileUrl;
    private String nickname;
}
