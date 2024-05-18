package te.trueEcho.domain.setting.dto.notiset;


import jakarta.persistence.Column;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PostNotiSet {
    private final boolean postLike;
    private final boolean newComment;
    private final boolean subComment;
}
