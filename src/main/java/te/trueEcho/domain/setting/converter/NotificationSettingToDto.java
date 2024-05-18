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
                                .rankResult(notificationSetting.getRankingNotification())
                                .voteResult(notificationSetting.getVoteResultNotification())
                                .build())
                .postNotiSet(
                        PostNotiSet.builder()
                                .postLike(notificationSetting.getLikeNotification())
                                .newComment(notificationSetting.getCommentNotification())
                                .build())
                .friendRequest(notificationSetting.getFriendRequestNotification())
                .PhotoTime(notificationSetting.getPhotoTimeNotification())
                .service(notificationSetting.getServiceNotification())
                .build();

    }
}
