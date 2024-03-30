package te.trueEcho.domain.user.entity;


import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    ADMIN("ROLE_AMDMIN","일반관리자"),
    USER("ROLE_USER", "일반사용자");

    private final String key;
    private final String title;
}