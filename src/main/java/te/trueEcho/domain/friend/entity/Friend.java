package te.trueEcho.domain.friend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.user.entity.User;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "friends",   uniqueConstraints={
        @UniqueConstraint(
                name= "one-way-friendship",
                columnNames={"target_user_id", "user_id"}
        )
})

public class Friend {

    @Id
    @Column(name = "friend_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "friend_status")
    @Enumerated(EnumType.STRING)
    private FriendStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "send_user_id")
    private User sendUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser;

    @Builder
    public Friend(FriendStatus status, User sendUser, User targetUser) {
        this.status = status;
        this.sendUser = sendUser;
        this.targetUser = targetUser;
    }
}