package te.trueEcho.domain.user.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.converter.SignUpDtoToUserConverter;
import te.trueEcho.domain.user.dto.*;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.EmailMemoryRepository;
import te.trueEcho.domain.user.repository.UserAuthRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAuthServiceImpl implements UserAuthService{

    private final EmailCodeService emailCodeService;
    private final UserAuthRepository userAuthRepository;
    private final EmailMemoryRepository emailMemoryRepository;

    public boolean isTypeDuplicated(EmailUserDto emailUserDto, String target) {
        if( target.equals("email"))
             return  userAuthRepository.findUserByEmail(emailUserDto.getEmail())!=null;
        if( target.equals("nickname"))
            return userAuthRepository.findUserByNickName(emailUserDto.getNickname())!=null;

        return false;
    }

    @Transactional
    public boolean registerUser(SignUpUserDto signUpUserDTO) {
        final boolean status =emailMemoryRepository.checkStatusByEmail(signUpUserDTO.getEmail());
        log.info("email status = {}",status);
        if(status){
            final User newUser = SignUpDtoToUserConverter.converter(signUpUserDTO);
            log.info("user's nickname = {}",        newUser.getNickname());

            userAuthRepository.save(newUser);
            emailMemoryRepository.deleteEmail(signUpUserDTO.getEmail());
            return true;
        }else{
            return false;
        }
    }

    @Override
    public User findUserByID(Long id) {
        return userAuthRepository.findUserById(id);
    }

    @Override
    public boolean checkEmailCode(EmailCheckCodeDto emailCheckCodeDto) {
        final String registerdCode =emailMemoryRepository.findCheckCodeByEmail(emailCheckCodeDto.getEmail());

       if (emailCheckCodeDto.getCheckCode().equals(registerdCode)){
           emailMemoryRepository.verifyEmail(emailCheckCodeDto.getEmail());
           return true;
       }

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


    @Override
    public boolean  login(LoginUserDto loginUserDto){
      return true;
    }


}
