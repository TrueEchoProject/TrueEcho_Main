package te.trueEcho.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReadCommunityFeedNewRankNoti {

            private Long id;
            private int type; // 2
            private String created_at;
}
