package te.trueEcho.domain.notification.dto;

public enum NotiType {
    PHOTO_TIME(0, "photo_time"),
    IN_RANK(1, "in_rank"),
    NEW_RANK(2, "new_rank"),
    VOTE_RESULT(3, "vote_result"),
    COMMENT(4, "comment"),
    SUB_COMMENT(5, "sub_comment"),
    POST_LIKE(6, "post_like"),
    FRIEND_REQUEST(7, "friend_request"),
    SERVICE(8, "service");

    private final int code;
    private final String description;

    NotiType(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}