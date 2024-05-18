package te.trueEcho.global.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthUtil {

    private final UserAuthRepository userAuthRepository;

    public String getLoginUserEmailOrNull() {
        try {
            final String email  = SecurityContextHolder.getContext().getAuthentication().getName();
            return String.valueOf(email);
        } catch (Exception e) {
            return null;
        }
    }

    public String getLoginUserEmail() {
        try {
            final String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return String.valueOf(email);
        } catch (Exception e) {
            throw new RuntimeException();
        }
    }

    public User getLoginUser() {
        try {
            final String email = SecurityContextHolder.getContext().getAuthentication().getName();
            log.info("email : {}", email);
            return userAuthRepository.findUserByEmail(email);
        } catch (Exception e) {
            throw new RuntimeException();
        }
    }
}
