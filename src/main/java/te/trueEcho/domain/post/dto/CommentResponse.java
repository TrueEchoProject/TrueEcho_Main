package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.post.entity.Comment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Getter
public class CommentResponse {
   private final Long commentId;
    private final  String username;
    private final String profileURL;
    private final String content;
    private final LocalDateTime createdAt;
    private int underCommentCount; //final 아님
    private final List<CommentResponse> underComments;

    public void setUnderComments(int i){
        this.underCommentCount = i;
    }
}
