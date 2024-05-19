package te.trueEcho.domain.post.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


@Getter
@RequiredArgsConstructor
public enum FeedType{

    FRIEND(0),
    PUBLIC(1),
    MINE(2);

    private final int value;
}