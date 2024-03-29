package te.trueEcho.domain.user.converter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.user.dto.SignUpUserDto;
import te.trueEcho.domain.user.entity.User;


@Component
public class SignUpDtoToUserConverter {
    public User converter(SignUpUserDto signUpUserDto) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String role = "ROLE_ADMIN"; // 기본 권한 설정
        String encryptedPassword = passwordEncoder.encode(signUpUserDto.getPassword());
        return User.builder()
                .name(signUpUserDto.getUsername())
                .password(signUpUserDto.getPassword())
                .email(signUpUserDto.getEmail())
                .birthday(signUpUserDto.getDob())
                .gender(signUpUserDto.getGender())
                .location(signUpUserDto.getLocation())
                .notificationTime(signUpUserDto.getNotificationTime())
                .build();
    }
}
