package te.trueEcho.domain.notification.service;


import te.trueEcho.domain.notification.dto.NotificationDto;

public interface NotificationService  {

    void sendNotificationCtoStoC(NotificationDto request);
}

