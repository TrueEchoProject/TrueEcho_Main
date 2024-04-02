package te.trueEcho.global.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import te.trueEcho.global.security.jwt.Repository.RefreshTokenRepository;
import te.trueEcho.global.security.jwt.dto.TokenType;
import te.trueEcho.global.security.jwt.dto.TokenKeyDto;
import te.trueEcho.global.security.jwt.service.CustomUserDetailsService;

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Component
@Slf4j
public class TokenProvider {

    private final TokenKeyDto accessTokenKeyDto;
    private final TokenKeyDto refreshTokenKeyDto;
    private final RefreshTokenRepository refreshTokenRepository;

    public TokenProvider(
            @Value("${jwt.accessSecret}") String accessSecretKey,
            @Value("${jwt.refreshSecret}") String refreshSecretKey,
            CustomUserDetailsService customUserDetailsService,
            @Value("${jwt.accessToken-validity-in-seconds}") long accessTokenValidityInMilliseconds,
            @Value("${jwt.refreshToken-validity-in-seconds}") long refreshTokenValidityInMilliseconds,
            RefreshTokenRepository refreshTokenRepository
    ) {

        this.refreshTokenRepository = refreshTokenRepository;

        byte[] accessKeyBytes = Decoders.BASE64.decode(accessSecretKey);
        byte[] refreshKeyBytes = Decoders.BASE64.decode(accessSecretKey);
        Key accessKey = Keys.hmacShaKeyFor(accessKeyBytes);
        Key refreshKey =Keys.hmacShaKeyFor(refreshKeyBytes);


        this.accessTokenKeyDto = TokenKeyDto.builder().validityInMilliseconds(accessTokenValidityInMilliseconds * 1000L).key(accessKey).build();
        this.refreshTokenKeyDto = TokenKeyDto.builder().validityInMilliseconds(refreshTokenValidityInMilliseconds * 1000L).key(refreshKey).build();
    }


    private TokenKeyDto getTokenKeyByType(TokenType type){
        return type == TokenType.ACCESS ? accessTokenKeyDto : refreshTokenKeyDto;
    }

    public String createToken(Authentication authentication, TokenType type) {
        String username = authentication.getName();
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        TokenKeyDto tokenKeyDto = getTokenKeyByType(type);

        // 토큰의 expire 시간을 설정
        long now = (new Date()).getTime();
        Date validity = new Date(now + tokenKeyDto.getValidityInMilliseconds());

        return Jwts.builder()
                .claim("role", authorities) // 사용자 role
                .setSubject(username)
                .signWith(tokenKeyDto.getKey(),
                        SignatureAlgorithm.HS512) // 암호화 알고리즘 , 시그니처 서명
                .setIssuedAt(new Date(now))
                .setExpiration(validity) // default :  expire x
                .compact(); // 토큰을 문자열로 변환하여 반환
    }


    // 토큰으로 클레임을 만들고 이를 이용해 유저 객체를 만들어서 최종적으로 authentication 객체를 리턴
    public UsernamePasswordAuthenticationToken getAuthentication(String token, TokenType type) {
        log.warn("=============== this is getAuthentication ");
        TokenKeyDto tokenKeyDto = getTokenKeyByType(type);

        Claims claims = Jwts
                .parserBuilder()
                .setSigningKey(tokenKeyDto.getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get("role").toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(claims.getSubject(), token, authorities);
    }

    // 토큰의 유효성 검증을 수행
    public boolean validateToken(String token, TokenType type) {
        log.warn("=============== this is validateToken ");
        TokenKeyDto tokenKeyDto = getTokenKeyByType(type);
        try {
            Jws<Claims> claims = Jwts.parserBuilder().setSigningKey(tokenKeyDto.getKey()).build().parseClaimsJws(token);

            if(type== TokenType.REFRESH){
                Object result = refreshTokenRepository.findTokenByToken(token);
              return result!=null;
            }

            return true;

        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {

            log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {

            log.info("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {

            log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {

            log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }
}