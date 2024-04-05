package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.post.entity.Comment;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
public class CommentDto {
    String username;
    String profileURL;
    String comment;
    LocalDate createdAt;
    List<Comment> underComments;
}
