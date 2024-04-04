package te.trueEcho.global.security.jwt.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import te.trueEcho.domain.user.entity.Role;
import te.trueEcho.global.security.jwt.JwtFilter;
import te.trueEcho.global.security.jwt.TokenProvider;
import te.trueEcho.global.security.jwt.exception.JwtAccessDeniedHandler;
import te.trueEcho.global.security.jwt.exception.JwtAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final TokenProvider tokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }



    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // token을 사용하는 방식이기 때문에 csrf를 disable
                .csrf(AbstractHttpConfigurer::disable
                )
                // 인가 오류 403 jwtAccessDeniedHandler
                // 인증 오류 401 jwtAuthenticationEntryPoint
                .exceptionHandling((exceptionHandlingConfigurer) ->
                        exceptionHandlingConfigurer
                                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                //swagger를 위한 H2 콘솔
                // 세션을 사용하지 않기 때문에 STATELESS로 설정
                .sessionManagement((exceptionHandlingCustomizer)->
                        exceptionHandlingCustomizer.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // HttpServletRequest를 사용하는 요청들에 대한 접근제한을 설정
                .authorizeHttpRequests((authorizeRequests) ->
                        authorizeRequests
//                                .requestMatchers(PathRequest.toH2Console()).permitAll()
                                .requestMatchers("/swagger-ui/**", "/accounts/**").permitAll()
                                .requestMatchers("/", "/email/**").hasRole(Role.ADMIN.name()) // 인가 확인
                                .anyRequest().authenticated() // 나머지는 인증 필요.
                ).
                addFilterBefore(new JwtFilter(tokenProvider), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}