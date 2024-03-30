package te.trueEcho.global.security.jwt.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.dto.LoginUserDto;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserRepository;
import te.trueEcho.global.security.jwt.Repository.RefreshTokenRepository;
import te.trueEcho.global.security.jwt.TokenProvider;
import te.trueEcho.global.security.jwt.dto.Token;
import te.trueEcho.global.security.jwt.dto.TokenDto;
import te.trueEcho.global.security.jwt.entity.RefreshToken;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {

    private final TokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    @Transactional
    public TokenDto login(LoginUserDto loginUserDto){
        Authentication authentication = setAuthentication(loginUserDto);

        User regiseredUser = userRepository.findUserByEmail(loginUserDto.getEmail());

        if(regiseredUser!=null){
            log.info("기존의 존재하는 refresh 토큰 삭제");
            refreshTokenRepository.deleteByUser(regiseredUser);
        }
        // authentication 객체를 createToken 메소드를 통해서 JWT Token을 생성
        String accessToken = tokenProvider.createToken(authentication, Token.ACCESS);
        String refreshToken = tokenProvider.createToken(authentication, Token.REFRESH);
        RefreshToken token = RefreshToken.builder().refreshToken(refreshToken).user(regiseredUser).build();
        refreshTokenRepository.save(token);
        return TokenDto.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }

    private Authentication setAuthentication(LoginUserDto loginUserDto) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginUserDto.getEmail(), loginUserDto.getPassword());

        // authenticate 메소드가 실행이 될 때 CustomUserDetailsService class의 loadUserByUsername 메소드가 실행
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        // 해당 객체를 SecurityContextHolder에 저장
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return authentication;
    }

    public Optional<RefreshToken> getRefreshToken(String email){
        User foundUser = userRepository.findUserByEmail(email);
        return Optional.ofNullable(refreshTokenRepository.findByUser(foundUser));
    }


    public boolean deleteRefreshToken(String email){
        User foundUser = userRepository.findUserByEmail(email);
        refreshTokenRepository.deleteByUser(foundUser);
        return refreshTokenRepository.existsByUser(foundUser);
    }

    
}