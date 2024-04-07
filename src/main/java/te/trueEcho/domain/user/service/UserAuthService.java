package te.trueEcho.domain.user.service;

import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.dto.*;
import te.trueEcho.domain.user.entity.User;

public interface UserAuthService {

    //회원가입
    @Transactional
    boolean registerUser(SignUpUserDto signUpUserDTO);

    boolean isTypeDuplicated(EmailUserDto email, String type) ;


    // 유저 찾기
    User findUserByID(Long id);

    // 이메일 인증코드 확인
    boolean checkEmailCode(EmailCheckCodeDto emailCheckCodeDto);

    @Transactional
    // 이메일 인증코드 전송
    boolean sendEmailCode(EmailUserDto emailUserDto);
    //개인정보 수정
    @Transactional
    User updateUser(EditUserDto editUserDTO);

    boolean login(LoginUserDto loginUserDto);
}
