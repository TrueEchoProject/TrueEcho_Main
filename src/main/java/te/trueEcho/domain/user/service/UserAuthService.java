package te.trueEcho.domain.user.service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import te.trueEcho.domain.user.dto.EditUserDto;
import te.trueEcho.domain.user.dto.EmailUserDto;
import te.trueEcho.domain.user.dto.SignUpUserDto;
import te.trueEcho.domain.user.entity.User;

public interface UserAuthService {

    //회원가입
    @Transactional
    boolean registerUser(SignUpUserDto signUpUserDTO);

    boolean isDuplicated(EmailUserDto email) ;

    // 유저 찾기
    User findUserByID(Long id);

    // 이메일 인증코드 확인
    boolean checkEmailCode(EmailUserDto emailUserDto);

    @Transactional
    // 이메일 인증코드 전송
    boolean sendEmailCode(EmailUserDto emailUserDto);
    //개인정보 수정
    @Transactional
    User updateUser(EditUserDto editUserDTO);

}
