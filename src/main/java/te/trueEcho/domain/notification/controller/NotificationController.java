package te.trueEcho.domain.notification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.notification.dto.CommunityFeedNotiResponse;
import te.trueEcho.domain.notification.dto.NotificationDto;
import te.trueEcho.domain.notification.dto.PostFeedNotiResponse;
import te.trueEcho.domain.notification.service.NotificationService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

@Tag(name = "Notification API", description = "알림 관리 API")
@Slf4j
@Validated
@RestController
@RequestMapping("/noti")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    @Operation(summary = "FCM 알림 전송", description = "FCM을 통해 알림을 전송합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "SEND_NOTIFICATION_SUCCESS - 알림 전송 성공"),
            @ApiResponse(responseCode = "400", description = "SEND_NOTIFICATION_FAIL - 알림 전송 실패")
    })
    @PostMapping("/sendToFCM")
    public ResponseEntity<ResponseForm> sendNotification(@RequestBody NotificationDto request) {
        boolean isSent = notificationService.sendNotificationCtoStoC(request);

        return isSent ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.SEND_NOTIFICATION_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.SEND_NOTIFICATION_FAIL));
    }
    @Operation(summary = "커뮤니티 알림 조회", description = "커뮤니티 피드 알림을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_COMMUNITIFEED_NOTIFICATION_SUCCESS - 커뮤니티 알림 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_COMMUNITIFEED_NOTIFICATION_FAIL - 커뮤니티 알림 조회 실패")
    })
    @GetMapping("/readCommunity")
    public ResponseEntity<ResponseForm> readCommunityNotification(@RequestParam int index,
                                                                  @RequestParam int pageCount) {

        CommunityFeedNotiResponse communityNotiList = notificationService.getCommunityNotification(index, pageCount);

        return !communityNotiList.getAllNotis().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMUNITIFEED_NOTIFICATION_SUCCESS, communityNotiList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMUNITIFEED_NOTIFICATION_FAIL));
    }
    @Operation(summary = "게시물 알림 조회", description = "게시물 피드 알림을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_POST_NOTIFICATION_SUCCESS - 게시물 알림 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_POST_NOTIFICATION_FAIL - 게시물 알림 조회 실패")
    })
    @GetMapping("/readPost")
    public ResponseEntity<ResponseForm> readPostNotification(@RequestParam int index,
                                                             @RequestParam int pageCount) {

        PostFeedNotiResponse postNotiList  = notificationService.getPostNotification(index, pageCount);

        return !postNotiList.getAllNotis().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_NOTIFICATION_SUCCESS, postNotiList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_NOTIFICATION_FAIL));
    }
}
