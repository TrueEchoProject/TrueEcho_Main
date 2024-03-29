package te.trueEcho.domain.notification.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.rank.entity.Rank;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("rank_notis")
public class RankNoti extends Notification{

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rank_id")
    private Rank rank;

    @Builder
    public RankNoti(Rank rank) {
        this.rank = rank;
    }
}
