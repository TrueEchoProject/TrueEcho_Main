package te.trueEcho.domain.post.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PostStatus {

    ONTIME(0), // noti_time이 발생하고 3분 이내로 post를 작성한 경우
    LATE(1), // noti_time이 발생하고 30분 이후로 post를 작성한 경우
    FREETIME(2); // noti_time과 별개로 post를 작성한 경우, 30분 이후를 의미

    private final int value;

    public static PostStatus fromValue(int value) {
        for (PostStatus status : PostStatus.values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid PostStatus value: " + value);
    }
    public int toValue() {
        return this.value;
    }
}