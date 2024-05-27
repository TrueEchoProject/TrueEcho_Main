package te.trueEcho.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.service.spi.ServiceException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.dto.EditUserRequest;
import te.trueEcho.domain.user.dto.EditUserResponse;
import te.trueEcho.domain.user.entity.SuspendedUser;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.SuspendedUserRepository;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.global.util.AuthUtil;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

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
        return Objects.equals(user.getName(), userAuthRepository.findUserById(user.getId()).getName());
    }

    public boolean getBoolEditUser() {
        final User user = authUtil.getLoginUser();
        return user != null;
    }
    @Transactional
    public boolean deleteUser(String email) {
        try {
            final User user = authUtil.getLoginUser();
            if (!user.getEmail().equals(email)) {
                throw new ServiceException("Invalid user");
            }
            SuspendedUser suspendedUser = userToSuspendedUser(user);
            suspendedUserRepository.save(suspendedUser);
            suspendedUserRepository.deleteSuspendedUsers();
            return true;
        } catch (Exception e) {
            log.error("Error occurred while deleting user: ", e);
            return false;
        }
    }

    @Transactional
    public boolean cancelDeleteUser(SuspendedUser suspendedUser) {

        try {
            LocalDate now = LocalDate.now();
            log.info("suspendedUser: {}", suspendedUser);
            LocalDate suspendDate = suspendedUser.getSuspendDate();
            long daysBetween = ChronoUnit.DAYS.between(suspendDate, now);
            if (daysBetween < 7) {
                suspendedUserRepository.cancelSuspend(suspendedUser);
            }
            return true;
        } catch (Exception e) {
            log.error("Error occurred while cancel the Deleting user: ", e);
            return false;
        }
    }

    private SuspendedUser userToSuspendedUser(User user) {
        return SuspendedUser.builder()
                .user(user)
                .suspendDate(LocalDate.now())
                .build();
    }

    private void updateUser(User user, EditUserRequest editUserRequest) {
        user.updateName(editUserRequest.getName());
        user.updatePassword(editUserRequest.getPassword());
        user.updateGender(editUserRequest.getGender());
        user.updateBirthDay(editUserRequest.getBirthday());
    }
}
