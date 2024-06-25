package te.trueEcho.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReadPostFeedPostLikeNoti {

    private Long id;
    private int type; // 6
    private String profile_url;
    private String post_back_url;
    private String like_username;
    private Long post_id;
    private String created_at;
}
