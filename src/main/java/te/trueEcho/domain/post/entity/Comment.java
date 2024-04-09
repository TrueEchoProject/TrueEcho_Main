package te.trueEcho.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import te.trueEcho.domain.notification.entity.CommentNoti;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.global.entity.Audit;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "comments")
public class Comment extends Audit {

    @Id
    @Column(name = "comment_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "comment_content")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_comment_id", nullable =true)
    private Comment mainComment;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "mainComment", cascade = CascadeType.ALL)
    private List<Comment> subComments = new ArrayList<>();

    @OneToOne(mappedBy = "comment", cascade= CascadeType.ALL)
    private CommentNoti commentNoti;

    @Builder
    public Comment( String content, Post post, User user, CommentNoti commentNoti) {

        this.content = content;
        this.post = post;
        this.user = user;
        this.commentNoti = commentNoti;
    }
}
