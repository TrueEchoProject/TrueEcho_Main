package te.trueEcho.domain.post.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import te.trueEcho.domain.friend.entity.Friend;


@Getter
@RequiredArgsConstructor
public enum FeedType{

    FRIEND(0),
    PUBLIC(1);

    private final int value;
}