package te.trueEcho.domain.vote;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import te.trueEcho.domain.notification.VoteResultNoti;
import te.trueEcho.domain.user.User;
import java.time.LocalDateTime;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "vote_results")
public class VoteResult {

    @Id
    @Column(name = "vote_result_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(name = "vote_time")
    private LocalDateTime voteTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id_voter")
    private User userVoter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id_target")
    private User userTarget;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id")
    private Vote vote;

    @OneToOne(mappedBy = "voteResult", cascade=CascadeType.ALL)
    private VoteResultNoti voteResultNoti;

    @Builder
    public VoteResult(User userVoter, User userTarget, Vote vote, VoteResultNoti voteResultNoti) {
        this.userVoter = userVoter;
        this.userTarget = userTarget;
        this.vote = vote;
        this.voteResultNoti = voteResultNoti;
    }
}
