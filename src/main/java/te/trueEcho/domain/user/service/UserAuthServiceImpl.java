package te.trueEcho.domain.user.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.converter.SignUpDtoToUserConverter;
import te.trueEcho.domain.user.dto.EditUserDto;
import te.trueEcho.domain.user.dto.EmailUserDto;
import te.trueEcho.domain.user.dto.SignUpUserDto;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.EmailMemoryRepository;
import te.trueEcho.domain.user.repository.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAuthServiceImpl implements UserAuthService {

    private final EmailCodeService emailCodeService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final SignUpDtoToUserConverter signUpToUser;
    private final EmailMemoryRepository emailMemoryRepository;

    @Transactional(readOnly = true)
    public boolean isDuplicated(EmailUserDto email) {
        return userRepository.checkDuplication(email.getEmail());
    }

    /**
     *     public boolean registerUser : HeeJohn
     *    * @param : signUpUserDto( 회원가입 시 필요한 데이터)
     *    ! 이메일 인증이 완료됐는데,
     *    TODO: 이메일 인증을 완료했는지 체크
     *    created_at 자료
     *    last edit: 24.03.28
     */

    @Transactional
    public boolean registerUser(SignUpUserDto signUpUserDTO) {
        final String registerdCode =emailMemoryRepository.findCheckCodeByEmail(signUpUserDTO.getEmail());
        log.info("registseredCode = {}", registerdCode);
        boolean isVerified = signUpUserDTO.getCheckCode().equals(registerdCode) ;
        log.info("isVerified = {}", isVerified);
        if(isVerified){
            final User newUser = signUpToUser.converter(signUpUserDTO);
            userRepository.save(newUser);
            return true;
        }else{
            return false;
        }
    }

    @Override
    public User findUserByID(Long id) {
        return userRepository.findUserById(id);
    }

    @Override
    public boolean checkEmailCode(EmailUserDto emailUserDto) {
        return false;
    }

    @Override
    public boolean sendEmailCode(EmailUserDto emailUserDto) {
        emailCodeService.sendRegisterCode(emailUserDto);
        return true;
    }

    @Override
    public User updateUser(EditUserDto editUserDTO) {
        return null;
    }


    /**
     *     public User updateUserInfoWithEmail : HeeJohn
     *    * @param : email, editUserDto(수정이 가능한 데이터만)
     *    ! 이메일로 유저를 식별하는 로직이 필요함.
     *    TODO: 이메일로 유저를 식별하여 넘어온 데이터로 업데이트
     *    created_at 자료
     *    last edit: 24.03.28
     */


}
