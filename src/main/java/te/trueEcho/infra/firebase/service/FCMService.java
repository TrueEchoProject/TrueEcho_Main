package te.trueEcho.infra.firebase.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.notification.dto.NotificationDto;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.global.util.AuthUtil;

//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class FCMService {
//    private final AuthUtil authUtil;
//    private final UserAuthRepository userAuthRepository;
//
//    @Transactional
//    public boolean saveToken(String token) {
//        try {
//            final User user = authUtil.getLoginUser();
//
//            if (user == null) {
//                log.error("User not found");
//                return false;
//            } else if (token == null || !isValidExpoPushToken(token)) {
//                log.error("Invalid ExpoPushToken: " + token);
//                return false;
//            }
//
//            user.setFcmToken(token);  // fcmToken 필드를 사용하고 있지만, 실제로는 ExpoPushToken을 저장
//            userAuthRepository.save(user);
//
//            return true;
//
//        } catch (Exception e) {
//            log.error("Error occurred while saving ExpoPushToken", e);
//            return false;
//        }
//    }
//
//    private boolean isValidExpoPushToken(String token) {
//        // ExpoPushToken 형식 검증 로직 추가 (예: ExpoPushToken은 "ExponentPushToken["로 시작함)
//        return token.startsWith("ExponentPushToken[") && token.endsWith("]");
//    }
//
//    public String getToken(User user) {
//
//        if (user == null) {
//            log.error("User not found");
//            return null;
//        }
//
//        return user.getFcmToken();
//    }
//
//    @Transactional
//    public void removeToken(User user) {
//        user.setFcmToken(null);
//        userAuthRepository.save(user);
//    }
//
//    public void sendNotification(String token, NotificationDto dto) {
//        if (token == null || dto == null || dto.getTitle() == null || dto.getBody() == null) {
//            log.error("Invalid notification request: token or dto is null");
//            return;
//        }
//
//        if (!isValidExpoPushToken(token)) {
//            log.error("Invalid ExpoPushToken: " + token);
//            return;
//        }
//
//        Message message = Message.builder()
//                .setToken(token)
//                .setNotification(Notification.builder().setTitle(dto.getTitle()).setBody(dto.getBody()).build())
//                .putData("userId", String.valueOf(dto.getData().getUserId()))
//                .putData("postId", String.valueOf(dto.getData().getContentId()))
//                .putData("notiType", String.valueOf(dto.getData().getNotiType()))
//                .build();
//
//        try {
//            String response = FirebaseMessaging.getInstance().send(message);
//            log.info("Successfully sent message: {}", response);
//        } catch (FirebaseMessagingException e) {
//            handleFirebaseMessagingException(e, token);
//        } catch (Exception e) {
//            log.error("Error sending message", e);
//        }
//    }
//
//    private void handleFirebaseMessagingException(FirebaseMessagingException e, String token) {
//        String errorCode = e.getMessagingErrorCode().toString();
//        switch (errorCode) {
//            case "invalid-registration-token":
//                log.error("Invalid ExpoPushToken", e);
//                User user = userAuthRepository.findUserByFcmToken(token);
//                if (user != null) {
//                    removeToken(user);
//                }
//                break;
//            case "messaging/invalid-argument":
//                log.error("Invalid argument provided for sending message", e);
//                break;
//            case "messaging/invalid-recipient":
//                log.error("Invalid recipient", e);
//                break;
//            case "messaging/invalid-payload":
//                log.error("Invalid payload", e);
//                break;
//            default:
//                log.error("FirebaseMessagingException occurred", e);
//        }
//    }
//}

import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FCMService {
    private final AuthUtil authUtil;
    private final UserAuthRepository userAuthRepository;
    private final RestTemplate restTemplate;

    @Transactional
    public boolean saveToken(String token) {
        try {
            final User user = authUtil.getLoginUser();

            if (user == null) {
                log.error("User not found");
                return false;
            } else if (token == null || !isValidExpoPushToken(token)) {
                log.error("Invalid ExpoPushToken: " + token);
                return false;
            }

            user.setFcmToken(token);  // ExpoPushToken 저장
            userAuthRepository.save(user);

            return true;

        } catch (Exception e) {
            log.error("Error occurred while saving ExpoPushToken", e);
            return false;
        }
    }

    private boolean isValidExpoPushToken(String token) {
        return token != null && token.startsWith("ExponentPushToken[") && token.endsWith("]");
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
        if (user != null) {
            user.setFcmToken(null);
            userAuthRepository.save(user);
        }
    }

    public void sendNotification(String token, NotificationDto dto) {
        if (token == null || !isValidExpoPushToken(token)) {
            log.error("Invalid ExpoPushToken: " + token);
            return;
        }

        if (dto == null || dto.getTitle() == null || dto.getBody() == null) {
            log.error("Invalid notification request: dto is null or incomplete");
            return;
        }

        // Expo 서버로 메시지 보내기
        sendExpoNotification(token, dto);
    }

    private void sendExpoNotification(String token, NotificationDto dto) {
        String expoPushEndpoint = "https://exp.host/--/api/v2/push/send";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("to", token);
        body.put("title", dto.getTitle());
        body.put("body", dto.getBody());
        body.put("data", dto.getData());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(expoPushEndpoint, HttpMethod.POST, request, String.class);
            log.info("Successfully sent message: {}", response.getBody());
        } catch (Exception e) {
            log.error("Error sending message", e);
        }
    }
}
