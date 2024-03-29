package te.trueEcho.domain.post;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "under_comments")
public class UnderComment {

    @Id
    @Column(name = "main_comment_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_comment_id")
    private Comment subComment;

    public UnderComment(Long id, Comment subComment) {
        this.id = id;
        this.subComment = subComment;
    }
}
