package te.trueEcho.global.response;



import lombok.AllArgsConstructor;
import lombok.Getter;

/*
 * Response Convention
 * - 도메인 별로 나누어 관리
 * - [동사_목적어_SUCCESS] 형태로 생성
 * - 코드는 도메인명 앞에서부터 1~2글자로 사용
 * - 메시지는 "~니다."로 마무리
 */


@Getter
@AllArgsConstructor
public enum ResponseCode {

    // user
    REGISTER_SUCCESS(200, "U001", "회원가입에 성공했습니다."),
    REGISTER_FAIL(200, "U002", "회원가입에 실패했습니다."),
    NOT_DUPLICATED_SUCCESS(200, "U002", "중복되지 않은 계정입니다."),
    NOT_DUPLICATED_FAIL(200, "U001", "중복된 계정입니다."),
    VERIFY_EMAIL_SUCCESS(200, "U002", "이메일 인증에 성공했습니다."),
    VERIFY_EMAIL_FAIL(200, "U003","이메일 인증에 실패했습니다."),
    SEND_EMAIL_SUCCESS(200, "U004", "이메일을 성공적으로 전송했습니다."),
    SEND_EMAIL_FAIL(200, "U005", "이메일 전송에 실패했습니다."),
    LOGIN_SUCCESS(200, "U009", "로그인에 성공했습니다."),
    LOGIN_FAIL(200, "U009", "로그인에 성공했습니다."),
    LOGOUT_SUCCESS(200, "U0010", "로그아웃에 성공했습니다."),
    LOGOUT_FAIL(200, "U0011", "로그아웃에 실패했습니다."),
    AUTHENTICATION_FAIL(401, "T001", "사용자 인증에 실패했습니다."),
    AUTHORIZATION_FAIL(403, "T002", "사용자 인가에 실패했습니다."),
    REFRESHMENT_SUCCESS(202, "T002", "토큰 재생성에 성공했습니다."),
    REFRESHMENT_FAIL(202, "T002", "토큰 재생성에 실패했습니다.");

    private final int status;
    private final String code;
    private final String message;
}
