package te.trueEcho.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReadPostFeedFriendRequestNoti {

    private Long id;
    private int type; // 7
    private String profile_url;
    private String friend_username;
    private String created_at;
}
