package te.trueEcho.domain.user.converter;

import lombok.NoArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.user.dto.RegisterRequest;
import te.trueEcho.domain.user.entity.Role;
import te.trueEcho.domain.user.entity.User;


@Component
@NoArgsConstructor
public class SignUpDtoToUserConverter {
    public static User converter(RegisterRequest registerRequest) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String encryptedPassword = passwordEncoder.encode(registerRequest.getPassword());
        return User.builder()
                .role(Role.USER) //default 권한
                .nickname(registerRequest.getNickname())
                .name(registerRequest.getName())
                .password(encryptedPassword)
                .email(registerRequest.getEmail())
                .birthday(registerRequest.getDob())
                .gender(registerRequest.getGender())
                .location(registerRequest.getLocation())
                .notificationTime(registerRequest.getNotificationTime())
                .build();
    }
}