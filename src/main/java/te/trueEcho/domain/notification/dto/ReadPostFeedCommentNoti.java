package te.trueEcho.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReadPostFeedCommentNoti {

    private Long id;
    private int type; // 4
    private String profile_url;
    private String post_back_url;
    private String username;
    private String comment;
    private Long post_id;
    private String created_at;
}
