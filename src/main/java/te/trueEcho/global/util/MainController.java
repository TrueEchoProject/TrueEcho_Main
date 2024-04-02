package te.trueEcho.global.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Collection;
import java.util.Iterator;


@Controller
@ResponseBody
public class MainController {

    // 메인 페이지 요청 처리 메서드
    @GetMapping("/")
    public String mainPage() {

        // 현재 사용자의 이름
        String name = SecurityContextHolder.getContext().getAuthentication().getName();

        // 현재 사용자의 인증 정보
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 현재 사용자의 권한
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        // 반환 값
        return "Main Controller : " + name;
    }
}
