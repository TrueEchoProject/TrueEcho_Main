package te.trueEcho.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.user.entity.Gender;

@Getter
@Builder
public class ReadCommunityFeedVoteResultNoti {

    private Long id;
    private int type; // 3
    private String profile_url;
    private String username;
    private String vote;
    private Gender gender;
    private int age;
    private Long sender_id;
    private String created_at;
}

