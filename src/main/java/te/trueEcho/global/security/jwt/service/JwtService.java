package te.trueEcho.global.security.jwt.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.dto.LoginRequest;
import te.trueEcho.domain.user.repository.UserAuthRepository;
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
    private final UserAuthRepository userAuthRepository;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    @Transactional
    public TokenDto login(LoginRequest loginRequest){
        setAuthentication(loginRequest); // 인증 & 인가
        return createToken();
    }

    private void setAuthentication(LoginRequest loginRequest) {

        // 1. Login ID/PW 를 기반으로 Authentication 객체 생성
        // 이때 authentication 는 인증 여부를 확인하는 authenticated 값이 false
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword());

        // 2. 실제 검증 (사용자 비밀번호 체크)이 이루어지는 부분
        // authenticate 매서드가 실행될 때 CustomUserDetailsService 에서 만든 loadUserByUsername 메서드가 실행
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        // 해당 객체를 SecurityContextHolder에 저장
        SecurityContextHolder.getContext().setAuthentication(authentication);

    }


    public boolean deleteRefreshToken(){
        Authentication authentication =  SecurityContextHolder.getContext().getAuthentication();
        log.info("authentication.name ={}", authentication.getName());
        return refreshTokenRepository.deleteTokenByEmail(authentication.getName());
    }


    public TokenDto createToken(){
        log.trace("createToken");
        // authentication 객체를 createToken 메소드를 통해서 JWT Token을 생성
        Authentication authentication =  SecurityContextHolder.getContext().getAuthentication();

        //deleteRefreshToken();
        String accessToken = tokenProvider.createToken(authentication, TokenType.ACCESS);
        String refreshToken = tokenProvider.createToken(authentication, TokenType.REFRESH);
        refreshTokenRepository.updateTokenByEmail(refreshToken,authentication.getName());
        return TokenDto.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }
    
}