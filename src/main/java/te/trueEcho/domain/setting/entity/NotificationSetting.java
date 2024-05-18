package te.trueEcho.domain.setting.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.user.entity.NotiTimeStatus;
import te.trueEcho.domain.user.entity.User;



@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "notification_setting")
public class NotificationSetting {

    @Id
    @Column(name = "notification_setting_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "setting_noti_time")
    @Enumerated(EnumType.STRING)
    private NotiTimeStatus notificationTime;

    @Column(name = "setting_noti_comment")
    private Boolean commentNotification;

    @Column(name = "setting_noti_like")
    private Boolean likeNotification;

    @Column(name = "setting_noti_rank")
    private Boolean rankingNotification;

    @Column(name = "setting_noti_vote")
    private Boolean voteResultNotification;

    @Column(name = "setting_noti_random")
    private Boolean photoTimeNotification;

    @Column(name = "setting_noti_friend")
    private Boolean friendRequestNotification;

    @Builder
    public NotificationSetting(User user, NotiTimeStatus notificationTime) {
        this.user = user;
        this.notificationTime = notificationTime;
        this.commentNotification = true;
        this.likeNotification = true;
        this.rankingNotification = true;
        this.voteResultNotification = true;
        this.photoTimeNotification = true;
        this.friendRequestNotification = true;
    }

}

