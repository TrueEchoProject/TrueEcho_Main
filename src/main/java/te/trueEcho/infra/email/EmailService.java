package te.trueEcho.infra.email;


import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String ENCODING_UTF8 = "UTF-8";

    private final JavaMailSender javaMailSender; // 스프링에서 구현체 자동 빈 등록

    @Async
    public void sendHtmlTextEmail(String subject, String content, String email) {
        final MimeMessage message = javaMailSender.createMimeMessage();
        try {
            final MimeMessageHelper messageHelper = new MimeMessageHelper(message, true, ENCODING_UTF8);
            messageHelper.setTo(email);
            messageHelper.setSubject(subject);
            messageHelper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            log.error("Error0----->: {}", e.getMessage()); // 예외 발생 시 로그 출력
            throw new RuntimeException() ;
        }
    }

}