package te.trueEcho.domain.setting.service;

import te.trueEcho.domain.setting.entity.NotiTimeStatus;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.global.response.ResponseCode;

public interface NotificationEditService {

    String updateNotiTimeStatus(User user, NotiTimeStatus notiTimeStatus);

    String checkIfUserIsWaiting(User user);
}
