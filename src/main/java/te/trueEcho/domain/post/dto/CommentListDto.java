package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;


@Getter
@Builder
public class CommentListDto {
    private Long id;
    List<CommentListDto> comments;
}
