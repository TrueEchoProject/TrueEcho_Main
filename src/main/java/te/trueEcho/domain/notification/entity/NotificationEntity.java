package te.trueEcho.domain.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Like;
import te.trueEcho.domain.rank.entity.Rank;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.entity.VoteResult;
import te.trueEcho.global.entity.CreatedDateAudit;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "notifications")
public class NotificationEntity extends CreatedDateAudit {

    @Id
    @Column(name = "notifications_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String title;
    private String body;
    private Data data;
    @Embeddable
    @Setter
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Data {

        private Long senderId; //알림 전송자
        private Long contentId;
        private int notiType;
    }

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User receiver; // 알림의 소유자 (받는 사람)

    @OneToOne(mappedBy = "notificationEntity" , cascade= CascadeType.ALL )
    private Comment comment;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "like_id")
    private Like like;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rank_id")
    private Rank rank;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_result_id")
    private VoteResult voteResult;
}