package te.trueEcho.infra.firebase.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.notification.entity.NotificationEntity;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.global.util.AuthUtil;
import te.trueEcho.infra.firebase.dto.FCMTokenResponse;



@Slf4j
@Service
@RequiredArgsConstructor
public class FCMService {
    private final AuthUtil authUtil;
    private final UserAuthRepository userAuthRepository;

    @Transactional
    public boolean saveToken(String token) {
        try {
            final User user = authUtil.getLoginUser();

            if (user == null) {
                log.error("User not found");
                return false;
            } else if (token == null) {
                log.error("token not found");
                return false;
            }

            user.setFcmToken(token);
            userAuthRepository.save(user);

            return true;

        } catch (Exception e) {
            log.error("Error occurred while saving FCM token", e);
            return false;
        }
    }

    public FCMTokenResponse getToken() {
        final User user = authUtil.getLoginUser();

        if (user == null) {
            log.error("User not found");
            return null;
        }

        return FCMTokenResponse.builder()
                .userId(user.getId())
                .fcmToken(user.getFcmToken())
                .build();
    }

    @Transactional
    public void removeToken() {
        final User user = authUtil.getLoginUser();
        user.setFcmToken(null);
        userAuthRepository.save(user);
    }

    public void sendNotification(String token, String title, String body, NotificationEntity.Data data) {
        Message message = Message.builder()
                .setToken(token)
                .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                .putData("sendUserId", String.valueOf(data.getSendUserId()))
                .putData("postId", String.valueOf(data.getPostId()))
                .putData("notiType", String.valueOf(data.getNotiType()))
                .putData("logicType", data.getLogicType())
                .build();

        try {
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent message: {}", response);
        } catch (FirebaseMessagingException e) {
            handleFirebaseMessagingException(e, token);
        } catch (Exception e) {
            log.error("Error sending message", e);
        }
    }

    private void handleFirebaseMessagingException(FirebaseMessagingException e, String token) {
        String errorCode = String.valueOf(e.getErrorCode());
        switch (errorCode) {
            case "invalid-registration-token":
            case "registration-token-not-registered":
                log.warn("Invalid or expired token: " + token);
                removeToken();
                break;
            case "messaging/invalid-argument":
                log.error("Invalid argument provided for sending message", e);
                break;
            case "messaging/invalid-recipient":
                log.error("Invalid recipient", e);
                break;
            case "messaging/invalid-payload":
                log.error("Invalid payload", e);
                break;
            default:
                log.error("FirebaseMessagingException occurred", e);
        }
    }
}
