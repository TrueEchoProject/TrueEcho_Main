package te.trueEcho.domain.post.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PostStatus {


    FREETIME(0),
    ONTIME(1),
    LATE(2);

    private final int value;
}
