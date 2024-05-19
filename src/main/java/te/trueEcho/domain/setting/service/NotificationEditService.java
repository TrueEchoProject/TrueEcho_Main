package te.trueEcho.domain.setting.service;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.notification.dto.NotiType;
import te.trueEcho.domain.notification.repository.NotificationRepository;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import te.trueEcho.domain.setting.repository.SettingJpaRepository;
import te.trueEcho.domain.setting.entity.NotificationSetting;
import te.trueEcho.domain.setting.repository.SettingRepository;
import te.trueEcho.domain.user.entity.User;

@RequiredArgsConstructor
@Service
@Slf4j
public class NotificationEditService {
    private static final int MAX_WAITING_HOUR = 7;
    private static final ConcurrentHashMap<User, NotiTimeStatus> waitingMap = new ConcurrentHashMap<>();
    private static final ConcurrentLinkedQueue<PermittedClient> waitingQueue = new ConcurrentLinkedQueue<>();
    private final NotificationRepository notificationRepository;
    private final SettingRepository settingRepository;
    private final SettingJpaRepository settingJpaRepository;

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
            authorizeUserToModify(user);
        } else {
            putUserToWaitingMap(user, notiTimeStatus);
        }
    }

    @Transactional
    protected void putUserToWaitingMap(User user, NotiTimeStatus notiTimeStatus) {
        waitingMap.put(user, notiTimeStatus);
    }

    @Transactional
    protected void authorizeUserToModify(User user) {
        waitingQueue.add(
                new PermittedClient(waitingMap.get(user),
                        user, LocalTime.now().plusHours(MAX_WAITING_HOUR)));
    }

    @Scheduled(fixedRate = 1000 * 60 * 60, initialDelay = 1000 * 60 * 60)
    @Transactional
    void processPermittedUser() {

        if(waitingQueue.isEmpty()){
            log.info("대기 큐에 있는 유저가 없습니다.");
            return;
        }else if(waitingQueue.peek()
                .getScheduledTime().isAfter(LocalTime.now())){
            log.info("대기 큐에 있는 유저가 아직 알림을 받을 시간이 아닙니다.");
            return;
        }else{

            List<NotificationSetting> settingList = new ArrayList<>();

            while (!waitingQueue.isEmpty() && waitingQueue.peek()
                    .getScheduledTime().isBefore(LocalTime.now())){
                    PermittedClient permittedClient = waitingQueue.poll();
                    log.info("알림을 받을 수 있는 유저가 있습니다. = {}", permittedClient.getUser().getNickname());
                    NotificationSetting notificationSetting =
                            permittedClient.getUser().getNotificationSetting();
                    notificationSetting.editNotificationTimeStatus(permittedClient.getNotiTimeStatus());
                    settingList.add(notificationSetting);
            }
            if(!settingList.isEmpty()) {
                settingJpaRepository.saveAll(settingList);
            }

        }
    }

    // 케이스 2: 특정 유저에게 랜덤 알림을 보낸 후 [준형이형]
    @Transactional
    public void checkIfUserIsWaitingAfterNotification(User user) { // receiver
        if( waitingMap.containsKey(user) ) {
            authorizeUserToModify(user);
        }
    }

    @Getter
    private static class PermittedClient {
        private final User user;
        private final NotiTimeStatus notiTimeStatus;
        private final LocalTime scheduledTime; // 기다려야 햐는 시간

        private PermittedClient(NotiTimeStatus notiTimeStatus, User user, LocalTime scheduledTime) {
            this.notiTimeStatus = notiTimeStatus;
            this.user = user;
            this.scheduledTime = scheduledTime;
        }

    }
}