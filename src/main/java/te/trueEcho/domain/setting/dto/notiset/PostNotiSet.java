package te.trueEcho.domain.setting.dto.notiset;


import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PostNotiSet {

    private final boolean newPost;
    private final boolean newComment;
    private final boolean subComment;
}
