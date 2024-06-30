package te.trueEcho.domain.user.service;

import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.dto.*;
import te.trueEcho.domain.user.entity.User;

public interface UserAuthService {

    //회원가입
    boolean registerUser(RegisterRequest registerRequest);

    boolean isTypeDuplicated(UserCheckRequest email, ValidationType type) ;

    // 유저 찾기
    User findUserByID(Long id);

    // 이메일 인증코드 확인
    boolean checkEmailCode(CheckCodeRequest emailCheckCodeDto);

    boolean updatePassword(UpdatePasswordRequest updatePasswordRequest);
    // 이메일 인증코드 전송
    boolean sendEmailCode(UserCheckRequest emailRequestDto);
    //개인정보 수정
    boolean login(LoginRequest loginRequest);
}
