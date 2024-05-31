package te.trueEcho.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.global.entity.CreatedDateAudit;


import java.util.List;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "posts")

public class Post extends CreatedDateAudit {


    @Id
    @Column(name = "post_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_title")
    private String title;

    @Lob
    @Column(name = "post_url_front", columnDefinition = "TEXT")
    private String urlFront;

    @Lob
    @Column(name = "post_url_back", columnDefinition = "TEXT")
    private String urlBack;

    @Column(name = "post_status") // 2분 이내 답장 여부
    @Enumerated(EnumType.STRING)
    private PostStatus status;

    @OneToOne(mappedBy = "post",  cascade = CascadeType.ALL)
    private Pin pin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "post",  cascade = CascadeType.ALL)
    private List<Like> likes;

    @OneToMany(mappedBy = "post",  cascade = CascadeType.ALL)
    private List<Comment> comments;

    @Builder
    public Post(String title, String urlFront, String urlBack, PostStatus status, User user) {
        this.title = title;
        this.urlFront = urlFront;
        this.urlBack = urlBack;
        this.status = status;
        this.user = user;
    }
}
