package te.trueEcho.domain.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.notification.dto.NotificationRequest;
import te.trueEcho.domain.notification.entity.NotificationEntity;
import te.trueEcho.domain.notification.repository.NotificationRepository;
import te.trueEcho.domain.user.entity.NotiTimeStatus;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.global.util.AuthUtil;
import te.trueEcho.infra.firebase.service.FCMService;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final FCMService fcmService;
    private final AuthUtil authUtil;
    private final UserAuthRepository userAuthRepository;

    @Override
    public void sendNotificationCtoStoC(NotificationRequest request) {
        // 데이터베이스에 알림 저장
        final User user = authUtil.getLoginUser();

        NotificationEntity notification = NotificationEntity.builder()
                .title(request.getTitle())
                .body(request.getBody())
                .targetUserId(user.getId())
                .data(NotificationEntity.Data.builder()
                        .sendUserId(request.getData().getSendUserId())
                        .postId(request.getData().getPostId())
                        .notiType(request.getData().getNotiType())
                        .logicType(request.getData().getLogicType())
                        .build())
                .build();
        notificationRepository.save(notification);

        // FCM을 통해 알림 전송
        String token = String.valueOf(fcmService.getToken()); // 토큰 가져오기
        if (token != null) {
            // NotificationRequest.Data 객체를 NotificationEntity.Data 객체로 변환
            NotificationEntity.Data fcmData = NotificationEntity.Data.builder()
                    .sendUserId(request.getData().getSendUserId())
                    .postId(request.getData().getPostId())
                    .notiType(request.getData().getNotiType())
                    .logicType(request.getData().getLogicType())
                    .build();

            // notiType에 따라 알림을 보낼지 말지 결정
            switch (request.getData().getNotiType()) {
                // 아래 메서드의 타입은 제외하고 다시 작성
                case 0:
                    // notiType이 0인 경우 PhotoTime 설정을 확인하고 알림을 보냄
                    fcmService.sendNotification(token, request.getTitle(), request.getBody(), fcmData);
                    break;
                case 1:
                    // notiType이 1인 경우 vote_ranking 설정을 확인하고 알림을 보냄
                    break;
                case 2:
                    // notiType이 2인 경우 vote_result 설정을 확인하고 알림을 보냄
                    break;
                case 3:
                    // notiType이 3인 경우 comment 설정을 확인하고 알림을 보냄
                    break;
                case 4:
                    // notiType이 4인 경우 postLike 설정을 확인하고 알림을 보냄
                    break;
                case 5:
                    // notiType이 5인 경우 friendRequest 설정을 확인하고 알림을 보냄
                    break;
                default:
                    // notiType이 예상 범위 밖인 경우 로그를 남김
                    log.warn("Unexpected notiType: {}", request.getData().getNotiType());
                    break;
            }
        } else {
            log.warn("User token not found for notiType: {}", request.getData().getNotiType());
        }
    }

//    public void sendNotificationStoC(List<User> users, NotiTimeStatus notiTimeStatus) {
//        for (User user : users) {
//            NotificationRequest request = NotificationRequest.builder()
//                    .title("Weekly Ranking Update")
//                    .body("The weekly ranking has been updated.")
//                    .data(NotificationRequest.Data.builder()
//                            .userId(user.getId().toString())
//                            .type("0")
//                            .build())
//                    .build();
//            this.sendNotificationCtoStoC(request);
//        }
//    }
}