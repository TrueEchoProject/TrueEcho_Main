package te.trueEcho.domain.notification.service;


import te.trueEcho.domain.notification.dto.PostFeedNotiResponse;
import te.trueEcho.domain.notification.dto.CommunityFeedNotiResponse;
import te.trueEcho.domain.notification.dto.NotificationDto;

public interface NotificationService  {

    boolean sendNotificationCtoStoC(NotificationDto request);

    CommunityFeedNotiResponse getCommunityNotification(int page, int size);

    PostFeedNotiResponse getPostNotification(int page, int size);
}

