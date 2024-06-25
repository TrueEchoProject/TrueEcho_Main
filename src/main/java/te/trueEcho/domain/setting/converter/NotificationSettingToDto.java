package te.trueEcho.domain.setting.converter;


import lombok.NoArgsConstructor;
import te.trueEcho.domain.setting.dto.notiset.CommunityNotiSet;
import te.trueEcho.domain.setting.dto.notiset.NotificationSettingDto;
import te.trueEcho.domain.setting.dto.notiset.PostNotiSet;
import te.trueEcho.domain.setting.entity.NotificationSetting;

@NoArgsConstructor
public class NotificationSettingToDto {
    public NotificationSettingDto converter(NotificationSetting notificationSetting) {
        return NotificationSettingDto.builder()
                .communityNotiSet(
                        CommunityNotiSet.builder()
                                .newRank(notificationSetting.getNewRankNotification())
                                .voteResult(notificationSetting.getVoteResultNotification())
                                .inRank(notificationSetting.getInRankNotification())
                                .build())
                .postNotiSet(
                        PostNotiSet.builder()
                                .postLike(notificationSetting.getLikeNotification())
                                .newComment(notificationSetting.getCommentNotification())
                                .subComment(notificationSetting.getSubCommentNotification())
                                .build())
                .friendRequest(notificationSetting.getFriendRequestNotification())
                .photoTime(notificationSetting.getPhotoTimeNotification())
                .service(notificationSetting.getServiceNotification())
                .build();
    }
}
