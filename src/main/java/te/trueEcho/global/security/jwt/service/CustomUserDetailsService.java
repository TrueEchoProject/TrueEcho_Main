package te.trueEcho.global.security.jwt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserRepository;
import te.trueEcho.global.security.jwt.principal.CustomUserDetails;

import java.util.Collections;
import java.util.List;


// 사용자 정보 -> UserDetails 객체로 변환
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // 주어진 사용자 이메일로 해당하는 사용자 정보를 데이터베이스에서 찾아 UserDetails 객체로 반환
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 사용자 이메일로 데이터베이스에서 사용자 정보 가져오기
        User userData = userRepository.findUserByEmail(email);
        if (userData == null) {
            throw new UsernameNotFoundException(email + "로 가입된 유저가 없습니다.");
        }
        // UserDetails 객체로 변환하여 반환
        return new CustomUserDetails(userData);
    }

    private org.springframework.security.core.userdetails.User createUser( User user) {


        List<GrantedAuthority> grantedAuthorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getTitle()));


        return new org.springframework.security.core.userdetails.User(user.getName(),
                user.getPassword(),
                grantedAuthorities);
    }
}
