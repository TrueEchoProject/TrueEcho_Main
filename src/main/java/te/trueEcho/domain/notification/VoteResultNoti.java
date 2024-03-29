package te.trueEcho.domain.notification;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.vote.VoteResult;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("vote_result_notis")
public class VoteResultNoti extends Notification{

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_result_id")
    private VoteResult voteResult;

    @Builder
    public VoteResultNoti(VoteResult voteResult) {
        this.voteResult = voteResult;
    }
}
