package te.trueEcho.domain.rank;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.notification.RankNoti;
import te.trueEcho.domain.user.User;
import te.trueEcho.domain.vote.Vote;

import java.time.LocalDate;
import java.util.List;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "ranks")
public class Rank {

    @Id
    @Column(name = "rank_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rank_level")
    private int rankLevel;

    @Column(name = "rank_week")
    private LocalDate rankWeek;

    @OneToMany(mappedBy = "rank" , cascade= CascadeType.ALL)
    private List<User> users;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", unique = true)
    private Vote vote;

    @OneToOne(mappedBy = "rank", cascade=CascadeType.ALL)
    private RankNoti rankNoti;

    @Builder
    public Rank(int rankLevel, LocalDate rankWeek, List<User> users, Vote vote, RankNoti rankNoti) {
        this.rankLevel = rankLevel;
        this.rankWeek = rankWeek;
        this.users = users;
        this.vote = vote;
        this.rankNoti = rankNoti;
    }
}