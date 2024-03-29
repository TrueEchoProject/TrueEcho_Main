package te.trueEcho.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import te.trueEcho.domain.user.converter.SignUpDtoToUserConverter;

@Configuration
public class UtilConfig {
    @Bean
    public SignUpDtoToUserConverter signUpDtoToUserConverter() {
        return new SignUpDtoToUserConverter();
    }
}
