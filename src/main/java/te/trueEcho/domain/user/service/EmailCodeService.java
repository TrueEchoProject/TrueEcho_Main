package te.trueEcho.domain.user.service;


import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Random;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import te.trueEcho.domain.user.dto.EmailUserDto;
import te.trueEcho.domain.user.repository.EmailMemoryRepository;
import te.trueEcho.domain.user.repository.UserRepository;
import te.trueEcho.infra.email.EmailService;

@Slf4j
@RequiredArgsConstructor
@Service
public class EmailCodeService {

    private static final int REGISTER_CODE_LENGTH = 6;
    private static final int RESET_PASSWORD_CODE_LENGTH = 30;
    private static final String REGISTER_EMAIL_SUBJECT_POSTFIX = " 님의 진실된 모습을 공유해주세요!";
    private static final String RESET_PASSWORD_EMAIL_SUBJECT_POSTFIX = " 님, 계정의 비밀번호를 복구해주세요";

    private final EmailMemoryRepository emailMemoryRepository;

    private final EmailService emailService;
    private String confirmEmailUI;

    public void sendRegisterCode(EmailUserDto emailUserDto) {
        final String code = generateRandomCode(); // 랜덤 번호 생성

        emailService.sendHtmlTextEmail(
                emailUserDto.getUsername() + REGISTER_EMAIL_SUBJECT_POSTFIX,
                getRegisterEmailText(emailUserDto.getEmail(), code),
                emailUserDto.getEmail()); // 메일 전송

        emailMemoryRepository.saveCheckCode(emailUserDto.getEmail(),code); // 랜덤 번호/이메일 저장.
    }

    public void deleteCheckCode(EmailUserDto emailUserDto){
        emailMemoryRepository.deleteCheckCode(emailUserDto.getEmail());
    }

    public boolean checkRegisterCode( String email, String code) {
        final String savedCode = emailMemoryRepository.findCheckCodeByEmail(email);

        return (savedCode != null) && (savedCode.equals(code));
    }


    private String getRegisterEmailText(String email, String code) {
        System.out.println("email = " + email);
        System.out.println("code = " + code);
        System.out.println("confirmEmailUIResource = " + confirmEmailUI);
        return String.format(confirmEmailUI, email, code);
    }

    private static String generateRandomCode() {
        Random random = new Random(System.currentTimeMillis()); // 시드를 현재 시간으로 설정
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < EmailCodeService.REGISTER_CODE_LENGTH; i++) {
            int randomNumber = random.nextInt(10); // 0부터 9까지의 랜덤한 숫자 생성
            code.append(randomNumber);
        }

        return code.toString();
    }
    @PostConstruct
    private void loadEmailUI() throws Exception {
        try {
            final ClassPathResource confirmEmailUIResource = new ClassPathResource("static/confirmEmailUI.html");
            confirmEmailUI = new String(confirmEmailUIResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            System.out.println("confirmEmailUIResource = " + confirmEmailUIResource);
        } catch (IOException e) {
            log.error("Error loading email UI template: {}", e.getMessage()); // 예외 발생 시 로그 출력
            throw new Exception("Error loading email UI template", e);
        }
    }
}