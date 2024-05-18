package te.trueEcho.domain.notification.service;


import te.trueEcho.domain.notification.dto.NotificationRequest;

public interface NotificationService  {

    void sendNotificationCtoStoC(NotificationRequest request);
}

