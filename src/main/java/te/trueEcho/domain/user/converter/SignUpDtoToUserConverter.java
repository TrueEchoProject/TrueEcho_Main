package te.trueEcho.domain.user.converter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.user.dto.SignUpUserDto;
import te.trueEcho.domain.user.entity.Role;
import te.trueEcho.domain.user.entity.User;


@Component
public class SignUpDtoToUserConverter {
    public User converter(SignUpUserDto signUpUserDto) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String encryptedPassword = passwordEncoder.encode(signUpUserDto.getPassword());
        return User.builder()
                .role(Role.USER) //default 권한
                .nickname(signUpUserDto.getNickname())
                .password(encryptedPassword)
                .email(signUpUserDto.getEmail())
                .birthday(signUpUserDto.getDob())
                .gender(signUpUserDto.getGender())
                .location(signUpUserDto.getLocation())
                .notificationTime(signUpUserDto.getNotificationTime())
                .build();
    }
}
