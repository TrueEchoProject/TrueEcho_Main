package te.trueEcho.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import te.trueEcho.domain.notification.entity.CommentNoti;
import te.trueEcho.domain.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "comments")
public class Comment {

    @Id
    @Column(name = "comment_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "comment_time")
    private LocalDateTime commentTime;

    @Lob
    @Column(name = "comment_content")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "subComment", cascade = CascadeType.ALL)
    private List<UnderComment> underComments;

    @OneToOne(mappedBy = "comment", cascade=CascadeType.ALL)
    private CommentNoti commentNoti;

    @Builder
    public Comment(LocalDateTime commentTime, String content, Post post, User user, CommentNoti commentNoti) {
        this.commentTime = commentTime;
        this.content = content;
        this.post = post;
        this.user = user;
        this.commentNoti = commentNoti;
    }
}
