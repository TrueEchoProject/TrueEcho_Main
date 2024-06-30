package te.trueEcho.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PostFeedNotiResponse {
    List<Object> allNotis;
}
