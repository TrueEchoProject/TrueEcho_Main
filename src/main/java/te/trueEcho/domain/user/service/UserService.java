package te.trueEcho.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.service.spi.ServiceException;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.user.dto.EditUserRequest;
import te.trueEcho.domain.user.dto.EditUserResponse;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.global.util.AuthUtil;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final AuthUtil authUtil;
    private final UserAuthRepository userAuthRepository;

    public EditUserResponse getEditUser() {

        final User user = authUtil.getLoginUser();
        return new EditUserResponse(user);
    }

    public boolean editUser(EditUserRequest editUserRequest) {

        final User user = authUtil.getLoginUser();
        updateUser(user, editUserRequest);
        userAuthRepository.updateUser(user);
        if (user.getName() == userAuthRepository.findUserById(user.getId()).getName()) {
            return true;
        } else {
            return false;
        }
    }

    public boolean getBoolEditUser() {
        final User user = authUtil.getLoginUser();
        if (user == null) {
            return false;
        }
        return true;
    }

    private void updateUser(User user, EditUserRequest editUserRequest) {
        user.updateName(editUserRequest.getName());
        user.updatePassword(editUserRequest.getPassword());
        user.updateGender(editUserRequest.getGender());
        user.updateNotificationTime(editUserRequest.getNotificationTime());
        user.updateNotificationSetting(editUserRequest.isNotificationSetting());
        user.updateBirthDay(editUserRequest.getBirthday());
        user.updateLocation(editUserRequest.getLocation());
    }
}
