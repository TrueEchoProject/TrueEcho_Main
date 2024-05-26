package te.trueEcho.global.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;
import te.trueEcho.global.security.jwt.Repository.RefreshTokenRepository;
import te.trueEcho.global.security.jwt.dto.TokenType;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends GenericFilterBean {
    public static final String AUTHORIZATION_HEADER = "Authorization";
    private final TokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    // 가장 먼저 실행되는 필터
    // 토큰의 인증정보를 SecurityContext에 저장
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        log.trace("doFilter");
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        String jwt = resolveToken(httpServletRequest);

        String requestURI = httpServletRequest.getRequestURI();
        TokenType type = isRefreshRequest(requestURI) ? TokenType.REFRESH : TokenType.ACCESS;
        log.info("retrieved jwt in request = {}, token type ={} ",jwt,type);

        if (StringUtils.hasText(jwt) &&
                tokenProvider.validateToken(jwt, type) &&
                !refreshTokenRepository.isInvalidToken(jwt)) { // accessToken이 유효하고, refreshToken이 유효한지 확인
            UsernamePasswordAuthenticationToken authentication = tokenProvider.getAuthentication(jwt,type);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("Security Context에 '{}' 인증 정보를 저장했습니다, uri: {}", authentication.getName(), requestURI);
        } else {
            log.warn("유효한 JWT 토큰이 없습니다, uri: {}", requestURI);
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }

    private boolean isRefreshRequest(String requestUri){
        return requestUri.contains("/refresh");
    }

    // Request Header 에서 토큰 정보를 꺼내오기 위한 메소드
    private String resolveToken(HttpServletRequest request) {
        log.trace("resolveToken, requestURI : {} ",request.getRequestURI());

        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }


}