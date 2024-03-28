package te.trueEcho.domain.post;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import te.trueEcho.domain.user.User;

import java.util.List;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "posts")
public class Post {

    @Id
    @Column(name = "post_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_title")
    private String title;

    @Column(name = "post_url_front")
    private String urlFront;

    @Column(name = "post_url_back")
    private String urlBack;

    @Column(name = "post_status") // 2분 이내 답장 여부
    private PostStatus postStatus;

    @Column(name = "post_scope") // 공개 범위
    private int postScope;

    @OneToOne(mappedBy = "post")
    private Pin pin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "post")
    private List<Like> likes;

    @OneToMany(mappedBy = "post")
    private List<Comment> comments;

    @Builder
    public Post(String title, String urlFront, String urlBack, PostStatus postStatus, int postScope, User user) {
        this.title = title;
        this.urlFront = urlFront;
        this.urlBack = urlBack;
        this.postStatus = postStatus;
        this.postScope = postScope;
        this.user = user;
    }
}
