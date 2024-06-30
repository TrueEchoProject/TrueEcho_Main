package te.trueEcho.global.security.jwt.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;
import te.trueEcho.global.security.jwt.config.SecurityConfig;

import java.io.IOException;
import java.io.PrintWriter;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        // 유효한 자격증명을 제공하지 않고 접근하려 할때 401
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setCharacterEncoding("UTF-8");
        PrintWriter writer = response.getWriter();
        
        ResponseForm unAuthorizedError = ResponseForm.of(ResponseCode.AUTHENTICATION_FAIL);
        String json = new ObjectMapper().writeValueAsString(unAuthorizedError);
        writer.write(json);
        writer.flush();
    }
}