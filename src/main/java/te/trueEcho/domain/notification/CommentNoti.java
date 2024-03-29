package te.trueEcho.domain.notification;

import jakarta.persistence.*;
import te.trueEcho.domain.post.Comment;

@Entity
@DiscriminatorValue("comment_notis")
public class CommentNoti extends Notification {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;
}
