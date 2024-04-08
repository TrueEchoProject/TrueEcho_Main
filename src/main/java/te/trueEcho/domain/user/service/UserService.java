package te.trueEcho.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.service.spi.ServiceException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.converter.SignUpDtoToUserConverter;
import te.trueEcho.domain.user.dto.EditUserRequest;
import te.trueEcho.domain.user.dto.EditUserResponse;
import te.trueEcho.domain.user.dto.SignUpUserDto;
import te.trueEcho.domain.user.entity.SuspendedUser;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.SuspendedUserRepository;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.global.util.AuthUtil;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final AuthUtil authUtil;
    private final UserAuthRepository userAuthRepository;
    private final SuspendedUserRepository suspendedUserRepository;

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
    @Transactional
    public boolean deleteUser(String email) {
        try {
            final User user = authUtil.getLoginUser();
            if (!user.getEmail().equals(email)) {
                throw new ServiceException("Invalid user");
            }
            SuspendedUser suspendedUser = userTOsuspendedUser(user);
            suspendedUserRepository.save(suspendedUser);
            suspendedUserRepository.deleteSuspendedUsers();
            return true;
        } catch (Exception e) {
            log.error("Error occurred while deleting user: ", e);
            return false;
        }
    }

    private SuspendedUser userTOsuspendedUser(User user) {
        return SuspendedUser.builder()
                .user(user)
                .suspendDate(LocalDate.now())
                .build();
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
