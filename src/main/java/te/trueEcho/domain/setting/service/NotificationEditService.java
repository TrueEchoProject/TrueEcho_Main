package te.trueEcho.domain.setting.service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.notification.dto.NotiType;
import te.trueEcho.domain.notification.repository.NotificationRepository;
import te.trueEcho.domain.setting.dto.random.RandomNotifyTResponse;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;
import java.time.LocalDate;
import java.util.concurrent.ConcurrentHashMap;

import te.trueEcho.domain.setting.entity.NotificationSetting;
import te.trueEcho.domain.setting.repository.SettingRepository;
import te.trueEcho.domain.user.entity.User;

@RequiredArgsConstructor
@Service
public class NotificationEditService {
    private static final ConcurrentHashMap<User, NotiTimeStatus> waitingMap = new ConcurrentHashMap<>();
    private final NotificationRepository notificationRepository;
    private final SettingRepository settingRepository;

    /* 케이스 1 : 알림 수정 요청이 올 때
        * 단계별 설계
        * 1. 사용자가 알림을 받았는지 확인
        * 2. 사용자가 알림을 받았다면 알림 시간 상태를 변경
        * 3. 사용자가 알림을 받지 않았다면 대기 큐에 넣기
        *
     * 케이스 2: 특정 유저에게 랜덤 알림을 보낸 후 [준형이형]
        * 경우의 수 1. 현재 알림을 받은 유저가 대기 목록에 있는지 확인
        * 경우의 수 2. 대기 목록에 없는 경우 -> 그냥 함수 탈출
        * 경우의 수 3. 대기 목록에 있는 경우 -> 알림 시간 상태 변경
        *
     */

    // 케이스 1 : 알림 수정 요청이 올 때
    @Transactional
    public void isUserReceivedNotification(User user, NotiTimeStatus notiTimeStatus) {
        boolean exists =
                notificationRepository.existsNotificationWithNotiTypeZero(
                        user, NotiType.PHOTO_TIME.getCode(), LocalDate.now());
        if (exists) {
            modifyNotificationTimeStatus(user);
        } else {
            putUserToWaitingMap(user, notiTimeStatus);
        }
    }

    @Transactional
    protected void putUserToWaitingMap(User user, NotiTimeStatus notiTimeStatus) {
        waitingMap.put(user, notiTimeStatus);
    }

    @Transactional
    protected void modifyNotificationTimeStatus(User user) {
        NotiTimeStatus requestedTime =  waitingMap.get(user) ;
        NotificationSetting notificationSetting =  user.getNotificationSetting();
        notificationSetting.editNotificationTimeStatus(requestedTime);
        settingRepository.editNotificationSetting(notificationSetting);
    }

    // 케이스 2: 특정 유저에게 랜덤 알림을 보낸 후 [준형이형]
    @Transactional
    public void checkIfUserIsWaiting(User user) {
        if( waitingMap.containsKey(user) ) {
            modifyNotificationTimeStatus(user);
        }
    }
}