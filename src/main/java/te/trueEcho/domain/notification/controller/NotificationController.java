package te.trueEcho.domain.notification.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.notification.dto.CommunityFeedNotiResponse;
import te.trueEcho.domain.notification.dto.NotificationDto;
import te.trueEcho.domain.notification.service.NotificationService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

@Tag(name = "USER API")
@Slf4j
@Validated
@RestController
@RequestMapping("/noti")
@RequiredArgsConstructor
public class NotificationController {
    private NotificationService notificationService;

    @PostMapping("/sendToFCM")
    public ResponseEntity<ResponseForm> sendNotification(@RequestBody NotificationDto request) {
        boolean isSended = notificationService.sendNotificationCtoStoC(request);

        return isSended ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.SEND_NOTIFICATION_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.SEND_NOTIFICATION_FAIL));
    }

    @GetMapping("/readCommunity")
    public ResponseEntity<ResponseForm> readCommunityNotification() {

        CommunityFeedNotiResponse communityNotiList = notificationService.getCommunityNotification();

        return !communityNotiList.getAllNotis().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMUNITIFEED_NOTIFICATION_SUCCESS, communityNotiList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMUNITIFEED_NOTIFICATION_FAIL));
    }

    @GetMapping("/readPost")
    public ResponseEntity<ResponseForm> readPostNotification() {

        PostFeedNotiResponse postNotiList  = notificationService.getPostNotification();

        return !postNotiList.getAllNotis().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_NOTIFICATION_SUCCESS, postNotiList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_NOTIFICATION_FAIL));
    }
}
