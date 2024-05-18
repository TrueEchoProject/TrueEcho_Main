package te.trueEcho.domain.notification.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.notification.dto.NotificationDto;
import te.trueEcho.domain.notification.service.NotificationService;

@Tag(name = "USER API")
@Slf4j
@Validated
@RestController
@RequestMapping("/noti")
@RequiredArgsConstructor
public class NotificationController {
        private NotificationService notificationService;

    @PostMapping("/sendToFCM")
    public String sendNotification(@RequestBody NotificationDto request) {
        notificationService.sendNotificationCtoStoC(request);
        return "Notification request sent for type: " + request.getData().getNotiType();
    }
}
