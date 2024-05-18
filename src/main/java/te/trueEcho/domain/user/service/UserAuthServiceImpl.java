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
public class UserAuthServiceImpl implements UserAuthService {

    private final EmailCodeService emailCodeService;
    private final UserAuthRepository userAuthRepository;
    private final EmailMemoryRepository emailMemoryRepository;

    public boolean isTypeDuplicated(EmailRequest emailRequestDto, String target) {
        if( target.equals("email"))
             return  userAuthRepository.findUserByEmail(emailRequestDto.getEmail())!=null;
        if( target.equals("nickname"))
            return userAuthRepository.findUserByNickName(emailRequestDto.getNickname())!=null;

        return false;
    }

    @Transactional
    public boolean registerUser(RegisterRequest registerRequest) {
        final boolean status =emailMemoryRepository.checkStatusByEmail(registerRequest.getEmail());
        log.info("email status = {}",status);
        if(status){
            final User newUser = SignUpDtoToUserConverter.converter(registerRequest);
            log.info("user's nickname = {}",        newUser.getNickname());

            userAuthRepository.save(newUser);
            emailMemoryRepository.deleteEmail(registerRequest.getEmail());
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
    public boolean checkEmailCode(CheckCodeRequest emailCheckCodeDto) {
        final String registerdCode =emailMemoryRepository.findCheckCodeByEmail(emailCheckCodeDto.getEmail());

       if (emailCheckCodeDto.getCheckCode().equals(registerdCode)){
           emailMemoryRepository.verifyEmail(emailCheckCodeDto.getEmail());
           return true;
       }

       return false;
    }

    @Override
    public boolean sendEmailCode(EmailRequest emailRequestDto) {
        emailCodeService.sendRegisterCode(emailRequestDto);
        return true;
    }




    @Override
    public boolean  login(LoginRequest loginRequest){
      return true;
    }


}
