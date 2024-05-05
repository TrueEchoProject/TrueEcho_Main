package te.trueEcho.domain.vote.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "votes")
public class Vote {

    @Id
    @Column(name = "vote_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vote_title")
    private String title;

    @Column(name = "vote_category")
    @Enumerated(EnumType.STRING)
    private VoteCategory category;

    @OneToMany(mappedBy = "vote", cascade = CascadeType.ALL)
    private List<VoteResult> voteResults;

    @Builder
    public Vote(String title, List<VoteResult> voteResults) {
        this.title = title;
        this.voteResults = voteResults;
    }
}
