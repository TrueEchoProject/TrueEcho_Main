package te.trueEcho.global.security.jwt.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.antlr.v4.runtime.Token;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.dto.LoginUserDto;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserRepository;
import te.trueEcho.global.security.jwt.Repository.RefreshTokenRepository;
import te.trueEcho.global.security.jwt.TokenProvider;
import te.trueEcho.global.security.jwt.dto.TokenType;
import te.trueEcho.global.security.jwt.dto.TokenDto;

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
        setAuthentication(loginUserDto); // 인증 & 인가

        return createToken();
    }

    private void setAuthentication(LoginUserDto loginUserDto) {

        // 1. Login ID/PW 를 기반으로 Authentication 객체 생성
        // 이때 authentication 는 인증 여부를 확인하는 authenticated 값이 false
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginUserDto.getEmail(), loginUserDto.getPassword());

        // 2. 실제 검증 (사용자 비밀번호 체크)이 이루어지는 부분
        // authenticate 매서드가 실행될 때 CustomUserDetailsService 에서 만든 loadUserByUsername 메서드가 실행
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        // 해당 객체를 SecurityContextHolder에 저장
        SecurityContextHolder.getContext().setAuthentication(authentication);

    }


    public boolean deleteRefreshToken(){
        Authentication authentication =  SecurityContextHolder.getContext().getAuthentication();
        log.info("authentication.name ={}", authentication.getName());
        User foundUser = userRepository.findUserByEmail(authentication.getName());
        refreshTokenRepository.deleteTokenByUser(foundUser);
        return refreshTokenRepository.findTokenByUser(foundUser) == null;
    }


    public TokenDto createToken(){

        if(!deleteRefreshToken())  return TokenDto.builder().accessToken("").refreshToken("").build();


        // authentication 객체를 createToken 메소드를 통해서 JWT Token을 생성
        Authentication authentication =  SecurityContextHolder.getContext().getAuthentication();
        deleteRefreshToken();
        String accessToken = tokenProvider.createToken(authentication, TokenType.ACCESS);
        String refreshToken = tokenProvider.createToken(authentication, TokenType.REFRESH);
        refreshTokenRepository.saveTokenByUsername(refreshToken,authentication.getName());
        return TokenDto.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }
    
}