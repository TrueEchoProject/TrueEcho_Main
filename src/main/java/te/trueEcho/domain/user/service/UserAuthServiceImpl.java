package te.trueEcho.domain.user.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.converter.SignUpDtoToUser;
import te.trueEcho.domain.user.dto.*;
import te.trueEcho.domain.user.entity.Coordinate;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.EmailMemoryRepository;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.infra.kakao.dto.KakaoResponse;
import te.trueEcho.infra.kakao.service.KakaoService;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAuthServiceImpl implements UserAuthService {

    private final EmailCodeService emailCodeService;
    private final UserAuthRepository userAuthRepository;
    private final EmailMemoryRepository emailMemoryRepository;
    private final SignUpDtoToUser signUpDtoToUser;
    private final KakaoService kakaoService;
    private final BCryptPasswordEncoder passwordEncoder;

    public boolean isTypeDuplicated(UserCheckRequest emailRequestDto, ValidationType target) {
        if(target == ValidationType.EMAIL) {
            if (emailRequestDto.getEmail() == null) return false;

            return  userAuthRepository.findUserByEmail(emailRequestDto.getEmail())!=null;
        }

        if(target == ValidationType.NICKNAME) {
            if (emailRequestDto.getNickname() == null) return false;
            User user = userAuthRepository.findUserByNickName(emailRequestDto.getNickname()) ;

            return user != null;
        }

        return false;
    }

    @Transactional
    public boolean registerUser(RegisterRequest registerRequest) {
        final boolean status =emailMemoryRepository.checkStatusByEmail(registerRequest.getEmail());
        log.info("email status = {}",status);
        if(status){

            KakaoResponse kakaoResponse = kakaoService.getRegionByCoordinates(
                            registerRequest.getX(),registerRequest.getY());

            String location = kakaoResponse.getDocuments().get(0).getAddressName();
            Coordinate coordinate = new Coordinate(kakaoResponse.getDocuments().get(0).getX(),
                    kakaoResponse.getDocuments().get(0).getY());
            final User newUser = signUpDtoToUser.converter(registerRequest,location,coordinate);
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
        final String registeredCode =emailMemoryRepository.findCheckCodeByEmail(emailCheckCodeDto.getEmail());

       if (emailCheckCodeDto.getCheckCode().equals(registeredCode)){
           emailMemoryRepository.verifyEmail(emailCheckCodeDto.getEmail());
           return true;
       }

       return false;
    }

    @Transactional
    @Override
    public boolean updatePassword(UpdatePasswordRequest updatePasswordRequest) {

        try {
            User user = userAuthRepository.findUserByEmail(updatePasswordRequest.getEmail());
            if (user == null) return false;
            user.updatePassword(passwordEncoder.encode(updatePasswordRequest.getNewPassword()));
            return true;

        }catch (Exception e){
            log.error("updatePassword error : {}",e.getMessage());
            return false;
        }
    }

    @Override
    public boolean sendEmailCode(UserCheckRequest emailRequestDto) {
       return emailCodeService.sendRegisterCode(emailRequestDto);
    }




    @Override
    public boolean  login(LoginRequest loginRequest){
      return true;
    }


}
