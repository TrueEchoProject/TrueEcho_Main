package te.trueEcho.domain.setting.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.setting.dto.notiset.NotificationSettingDto;
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

    @Column(name = "setting_noti_time_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotiTimeStatus notificationTimeStatus;

    @Column(name = "setting_noti_comment", nullable = false)
    private Boolean commentNotification;

    @Column(name = "setting_noti_subcomment", nullable = false)
    private Boolean subCommentNotification;

    @Column(name = "setting_noti_like", nullable = false)
    private Boolean likeNotification;

    @Column(name = "setting_noti_in_rank", nullable = false)
    private Boolean inRankNotification;

    @Column(name = "setting_noti_new_rank", nullable = false)
    private Boolean newRankNotification;

    @Column(name = "setting_noti_vote", nullable = false)
    private Boolean voteResultNotification;

    @Column(name = "setting_noti_random", nullable = false)
    private Boolean photoTimeNotification;

    @Column(name = "setting_noti_friend", nullable = false)
    private Boolean friendRequestNotification;

    @Column(name = "setting_noti_service", nullable = false)
    private Boolean serviceNotification;

    @Builder
    public NotificationSetting(NotiTimeStatus notificationTimeStatus) {
        this.notificationTimeStatus = notificationTimeStatus;
        this.serviceNotification = true;
        this.commentNotification = true;
        this.likeNotification = true;
        this.inRankNotification = true;
        this.newRankNotification = true;
        this.subCommentNotification = true;
        this.voteResultNotification = true;
        this.photoTimeNotification = true;
        this.friendRequestNotification = true;
    }

    public void editNotificationSetting(NotificationSettingDto dto) {
        this.inRankNotification = dto.getCommunityNotiSet().isNewRank();
        this.newRankNotification= dto.getCommunityNotiSet().isInRank();
        this.voteResultNotification = dto.getCommunityNotiSet().isVoteResult();
        this.likeNotification=dto.getPostNotiSet().isPostLike();
        this.commentNotification=dto.getPostNotiSet().isNewComment();
        this.subCommentNotification=dto.getPostNotiSet().isSubComment();
        this.photoTimeNotification=dto.isPhotoTime();
        this.friendRequestNotification=dto.isFriendRequest();
        this.serviceNotification=dto.isService();
    }

    public void editNotificationTimeStatus(NotiTimeStatus notiTimeStatus) {
        this.notificationTimeStatus = notiTimeStatus;
    }
}

