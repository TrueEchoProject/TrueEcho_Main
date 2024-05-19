package te.trueEcho.domain.notification.service;


import te.trueEcho.domain.notification.controller.PostFeedNotiResponse;
import te.trueEcho.domain.notification.dto.CommunityFeedNotiResponse;
import te.trueEcho.domain.notification.dto.NotificationDto;

public interface NotificationService  {

    boolean sendNotificationCtoStoC(NotificationDto request);

    CommunityFeedNotiResponse getCommunityNotification();

    PostFeedNotiResponse getPostNotification();
}

