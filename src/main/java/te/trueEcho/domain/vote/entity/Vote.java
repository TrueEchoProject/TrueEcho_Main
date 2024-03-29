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
    @Column(name = "vote id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "vote_title")
    private String title;

    @OneToMany(mappedBy = "vote", cascade = CascadeType.ALL)
    private List<VoteResult> voteResults;

    @Builder
    public Vote(String title, List<VoteResult> voteResults) {
        this.title = title;
        this.voteResults = voteResults;
    }
}
