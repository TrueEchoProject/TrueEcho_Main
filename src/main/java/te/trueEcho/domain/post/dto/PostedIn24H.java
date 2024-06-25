package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class PostedIn24H {
    private final boolean postedFront;
    private final boolean postedBack;
    private final LocalDateTime postedAt;
}
