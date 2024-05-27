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

    // User
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
    GET_EDIT_PROFILE_SUCCESS(200, "U0012", "회원 프로필 수정정보를 조회하였습니다."),
    GET_EDIT_PROFILE_FAIL(200, "U0012", "회원 프로필 수정정보를 실패하였습니다."),
    EDIT_PROFILE_SUCCESS(200, "U0013", "회원 프로필을 수정하였습니다."),
    EDIT_PROFILE_FAIL(200, "U0013", "회원 프로필을 실패하였습니다."),
    DELETE_USER_SUCCESS(200, "U0014", "회원 탈퇴 및 로그아웃에 성공했습니다."),
    DELETE_USER_FAIL(200, "U0014", "회원 탈퇴 및 로그아웃에 실패하였습니다."),
    CANCEL_DELETE_USER_SUCCESS(200, "U0014", "회원 탈퇴 취소 및 로그인에 성공했습니다."),
    CANCEL_DELETE_USER_FAIL(200, "U0014", "회원 탈퇴 취소 및 로그인에 실패했습니다."),

    // 로그인
    AUTHENTICATION_FAIL(401, "T001", "사용자 인증에 실패했습니다."),
    AUTHORIZATION_FAIL(403, "T002", "사용자 인가에 실패했습니다."),
    REFRESHMENT_SUCCESS(202, "T002", "토큰 재생성에 성공했습니다."),
    REFRESHMENT_FAIL(202, "T002", "토큰 재생성에 실패했습니다."),

    // 친구
    ADD_FRIEND_SUCCESS(202, "T002", "친구 추가에 성공했습니다."),
    ADD_FRIEND_FAIL(202, "T002", "친구 추가에 실패했습니다."),
    CONFIRM_REQUEST_SUCCESS(202, "T002", "친구 요청 확인에 성공했습니다."),
    CONFIRM_REQUEST_FAIL(202, "T002", "친구 요청 확인에 실패했습니다."),
    ACCEPT_FRIEND_SUCCESS(202, "T002", "친구 요청 수락에 성공했습니다."),
    ACCEPT_FRIEND_FAIL(202, "T002", "친구 요청 수락에 실패했습니다."),
    REJECT_FRIEND_SUCCESS(202, "T002", "친구 요청 거절에 성공했습니다."),
    REJECT_FRIEND_FAIL(202, "T002", "친구 요청 거절에 실패했습니다."),
    DELETE_FRIEND_SUCCESS(202, "T002", "친구 삭제에 성공했습니다."),
    DELETE_FRIEND_FAIL(202, "T002", "친구 삭제에 실패했습니다."),
    READ_FRIENDLIST_SUCCESS(202, "T002", "친구 목록 조회에 성공했습니다."),
    READ_FRIENDLIST_FAIL(202, "T002", "친구 목록 조회에 실패했습니다."),
    RECOMMEND_FRIEND_SUCCESS(202, "T002", "친구 추천에 성공했습니다."),
    RECOMMEND_FRIEND_FAIL(202, "T002", "친구 추천에 실패했습니다."),

    // 차단
    PUT_BLOCK_SUCCESS(202, "T002", "차단에 성공했습니다."),
    PUT_BLOCK_FAIL(202, "T002", "차단에 실패했습니다."),
    DELETE_BLCOK_SUCCESS(202, "T002", "차단 해제에 성공했습니다."),
    DELETE_BLCOK_FAIL(202, "T002", "차단 해제에 실패했습니다."),

    // 게시물
    GET_POST_SUCCESS(202, "T002", "게시물을 조회를 성공했습니다."),
    GET_POST_FAIL(202, "T002", "게시물을 조회를 실패했습니다."),
    WRITE_POST_SUCCESS(202, "T002", "게시물 작성을 성공했습니다."),
    WRITE_POST_FAIL(202, "T002", "게시물 작성을 실패했습니다."),
    DELETE_POST_SUCCESS(202, "T002", "게시물을 삭제를 성공했습니다."),
    DELETE_POST_FAIL(202, "T002", "게시물을 삭제를 실패했습니다."),

    // 댓글
    GET_COMMENT_SUCCESS(202, "T002", "해당 게시물의 댓글 조회를 성공했습니다."),
    GET_COMMENT_FAIL(202, "T002", "해당 게시물의 댓글 조회를 실패했습니다."),
    POST_COMMENT_SUCCESS(202, "T002", "해당 게시물의 댓글 생성을 성공했습니다."),
    POST_COMMENT_FAIL(202, "T002", "해당 게시물의 댓글 생성을 실패했습니다."),
    DELETE_COMMENT_SUCCESS(202, "T002", "댓글 삭제를 성공했습니다."),
    DELETE_COMMENT_FAIL(202, "T002", "댓글 삭제를 실패했습니다."),


    // 투표
    GET_VOTE_CONTENT_SUCCESS(202, "T002", "투표지 조회를 성공했습니다."),
    GET_VOTE_CONTENT_FAIL(202, "T002", "투표지 조회를 실패했습니다."),
    GET_VOTE_TARGET_SUCCESS(202, "T002", "투표 인원 뽑기를 성공했습니다."),
    GET_VOTE_TARGET_FAIL(202, "T002","투표 인원 뽑기를 실패했습니다."),
    SAVE_VOTE_RESULT_SUCCESS(202, "T002", "투표 결과 저장을 성공했습니다."),
    SAVE_VOTE_RESULT_FAIL(202, "T002","투표 결과 저장을 실패했습니다."),

    // 랭킹
    GET_RANK_SUCCESS(202, "T002", "랭킹 조회를 성공했습니다."),
    GET_RANK_FAIL(202, "T002", "랭킹 조회를 실패했습니다."),

    //// 설정
    // 마이페이지
    GET_MY_PAGE_SUCCESS(202, "T002", "마이페이지 조회를 성공했습니다."),
    GET_MY_PAGE_FAIL(202, "T002", "마이페이지 조회를 실패했습니다."),
    GET_OTHER_PAGE_SUCCESS(202, "T002", "다른 유저의 마이페이지 조회를 성공했습니다."),
    GET_OTHER_PAGE_FAIL(202, "T002", "다른 유저의 마이페이지 조회를 실패했습니다."),

    // 핀
    GET_PINS_SUCCESS(202, "T002", "핀 조회를 성공했습니다."),
    GET_PINS_FAIL(202, "T002", "핀 조회를 실패했습니다."),
    PUT_PINS_SUCCESS(202, "T002", "핀 수정을 성공했습니다."),
    PUT_PINS_FAIL(202, "T002", "핀 수정을 실패했습니다."),

    // 캘린더 - 월별 게시물
    GET_MONTHLY_POST_SUCCESS(202, "T002", "월별 게시물 조회를 성공했습니다."),
    GET_MONTHLY_POST_FAIL(202, "T002", "월별 게시물 조회를 실패했습니다."),

    // 개인정보
    GET_MY_INFO_SUCCESS(202, "T002", "개인정보 조회를 성공했습니다."),
    GET_MY_INFO_FAIL(202, "T002", "개인정보 조회를 실패했습니다."),
    PUT_MY_INFO_SUCCESS(202, "T002", "개인정보 수정를 성공했습니다."),
    PUT_MY_INFO_FAIL(202, "T002", "개인정보 수정를 실패했습니다."),

    // 차단
    GET_BLOCKED_USER_SUCCESS(202, "T002", "차단한 유저 조회를 성공했습니다."),
    GET_BLOCKED_USER_FAIL(202, "T002", "차단한 유저 조회를 실패했습니다."),
    PUT_BLOCKED_USER_SUCCESS(202, "T002", "차단한 유저 수정를 성공했습니다."),
    PUT_BLOCKED_USER_FAIL(202, "T002", "차단한 유저 수정를 실패했습니다."),

    // 포토타임
    GET_NOTIFY_TIME_SUCCESS(202, "T002", "랜덤알림 시간 조회를 성공했습니다."),
    GET_NOTIFY_TIME_FAIL(202, "T002", "랜덤알림 시간 조회를 실패했습니다."),
    PUT_NOTIFY_TIME_SUCCESS(202, "T002", "랜덤알림 시간 수정를 성공했습니다."),
    PUT_NOTIFY_TIME_FAIL(202, "T002", "랜덤알림 시간 수정를 실패했습니다."),

    // 알림창
    GET_NOTIFICATION_OPTION_SUCCESS(202, "T002", "알림 옵션 조회를 성공했습니다."),
    GET_NOTIFICATION_OPTION_FAIL(202, "T002", "알림 옵션 조회를 실패했습니다."),
    PUT_NOTIFICATION_OPTION_SUCCESS(202, "T002", "알림 옵션 수정를 성공했습니다."),
    PUT_NOTIFICATION_OPTION_FAIL(202, "T002", "알림 옵션 수정를 실패했습니다."),

    // 알림
    FCM_TOKEN_SAVED_SUCCESS(202, "T002", "FCM 토큰 저장에 성공했습니다."),
    FCM_TOKEN_SAVED_FAIL(202, "T002", "FCM 토큰 저장에 실패했습니다."),
    FCM_TOKEN_GET_SUCCESS(202, "T002", "FCM 토큰 조회에 성공했습니다."),
    FCM_TOKEN_GET_FAIL(202, "T002", "FCM 토큰 조회에 실패했습니다."),
    SEND_NOTIFICATION_SUCCESS(202, "T002", "알림 전송에 성공했습니다."),
    SEND_NOTIFICATION_FAIL(202, "T002", "알림 전송에 실패했습니다."),
    GET_COMMUNITIFEED_NOTIFICATION_SUCCESS(202, "T002", "커뮤니티 알림 피드 조회에 성공했습니다."),
    GET_COMMUNITIFEED_NOTIFICATION_FAIL(202, "T002", "커뮤니티 알림 피드 조회에 실패했습니다."),
    GET_POST_NOTIFICATION_SUCCESS(202, "T002", "게시물 알림 피드 조회에 성공했습니다."),
    GET_POST_NOTIFICATION_FAIL(202, "T002", "게시물 알림 피드 조회에 실패했습니다.");

    private final int status;
    private final String code;
    private final String message;
}
