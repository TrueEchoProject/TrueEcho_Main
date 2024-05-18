package te.trueEcho.domain.friend.dto;

import lombok.*;
import te.trueEcho.domain.friend.entity.FriendStatus;
import te.trueEcho.domain.user.entity.User;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class AddFriendRequest {

    private FriendStatus status;

    private User sendUser;

    private User targetUser;
}
