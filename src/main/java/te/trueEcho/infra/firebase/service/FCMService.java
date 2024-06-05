package te.trueEcho.infra.firebase.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import te.trueEcho.domain.notification.dto.NotificationDto;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.global.util.AuthUtil;

import java.util.HashMap;
import java.util.Map;


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

    public String getToken(User user) {

        if (user == null) {
            log.error("User not found");
            return null;
        }

        return user.getFcmToken();
    }

    @Transactional
    public void removeToken(User user) {
        user.setFcmToken(null);
        userAuthRepository.save(user);
    }

    private final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    public void sendNotification(String expoPushToken, NotificationDto dto) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json");
        headers.set("Accept-Encoding", "gzip, deflate");
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("to", expoPushToken);
        body.put("sound", "default");
        body.put("title", dto.getTitle());
        body.put("body", dto.getBody());
        body.put("data", Map.of("userId", String.valueOf(dto.getData().getUserId()),
                "contentId", String.valueOf(dto.getData().getContentId()),
                "notiType", String.valueOf(dto.getData().getNotiType())));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(EXPO_PUSH_URL, HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Push notification sent successfully!");
            } else {
                log.error("Failed to send push notification. Response: " + response.getBody());
            }
        } catch (Exception e) {
            if (e instanceof FirebaseMessagingException) {
                handleFirebaseMessagingException((FirebaseMessagingException) e, expoPushToken);
            } else {
                log.error("Error sending message", e);
            }
        }
    }

    private void handleFirebaseMessagingException(FirebaseMessagingException e, String token) {
        String errorCode = String.valueOf(e.getErrorCode());
        switch (errorCode) {
            case "invalid-registration-token":
                log.error("Invalid registration token", e);
                removeToken(userAuthRepository.findUserByFcmToken(token));
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
