package te.trueEcho.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReadCommunityFeedInRankNoti {

            private Long id;
            private int type; // 1
            private String rank_vote; // 질문지
            private int rank; // 순위
            private LocalDateTime created_at;
}
