package te.trueEcho.domain.setting.service;

import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.notification.repository.NotificationRepository;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;
import te.trueEcho.domain.setting.entity.NotificationSetting;
import te.trueEcho.domain.setting.repository.SettingJpaRepository;
import te.trueEcho.domain.setting.repository.SettingRepository;
import te.trueEcho.domain.user.entity.User;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;


@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationEditServiceImplV2 implements NotificationEditService{
    private static final ConcurrentHashMap<Long, PermittedClient> waitingMap = new ConcurrentHashMap<>();
    private final SettingJpaRepository settingJpaRepository;


    @Override
    public String updateNotiTimeStatus(User user, NotiTimeStatus notiTimeStatus) {
        if(!waitingMap.containsKey(user.getId())){
            waitingMap.put(user.getId(), new PermittedClient(user,notiTimeStatus));
            log.info("알림시간 변경이 예약되었습니다.(00시 예정)");
            return "알림시간 변경이 예약되었습니다.(00시 예정)";
        }else{
            String beforeTime = waitingMap.get(user.getId()).notiTimeStatus.toString();
            waitingMap.replace(user.getId(), new PermittedClient(user,notiTimeStatus));
            log.info("알림시간이 "+beforeTime+"에서 "+
                    notiTimeStatus.toString()+"으로 변경 예약되었습니다.(00시 예정)");
            return "알림시간이 "+beforeTime+"에서 "+
                    notiTimeStatus.toString() +"으로 변경 예약되었습니다.(00시 예정)";
        }
    }

    @Override
    public String checkIfUserIsWaiting(User user) {
        if(waitingMap.containsKey(user.getId())){
            log.info("예약된 변경시간이 있습니다. : "
                    + waitingMap.get(user.getId()).notiTimeStatus.toString()+ "(00시 예정)");
            return "예약된 변경시간이 있습니다. : "
                    + waitingMap.get(user.getId()).notiTimeStatus.toString()+ "(00시 예정)";
        }else{
            log.info("예약된 변경시간이 없습니다.");
            return null;
        }
    }


    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    void processPermittedUser() {
        if(waitingMap.isEmpty()){
            log.info("알림변경 예약유저가 없습니다.");
        }else{
            List<NotificationSetting> settingList = new ArrayList<>();
            for (PermittedClient pc : waitingMap.values()){
                NotificationSetting notificationSetting = pc.user.getNotificationSetting();
                notificationSetting.editNotificationTimeStatus(
                        waitingMap.get(pc.user.getId()).notiTimeStatus);
                settingList.add(notificationSetting);
            }
            log.info("대기 큐에 있는 유저의 알림 시간이 변경되었습니다.");
            settingJpaRepository.saveAll(settingList);
            waitingMap.clear();
        }
    }


    private static class PermittedClient {
        private final User user;
        private final NotiTimeStatus notiTimeStatus;

        private PermittedClient(User user, NotiTimeStatus notiTimeStatus) {
            this.notiTimeStatus = notiTimeStatus;
            this.user = user;

        }
    }
}
