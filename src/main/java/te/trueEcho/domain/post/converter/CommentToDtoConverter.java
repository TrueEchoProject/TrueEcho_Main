package te.trueEcho.domain.post.converter;

import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.post.dto.CommentListResponse;
import te.trueEcho.domain.post.dto.CommentResponse;
import te.trueEcho.domain.post.entity.Comment;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class CommentToDtoConverter {
    public static CommentListResponse converter(List<Comment> commentList, Long postId) {

        Map<Long, CommentResponse> mainCommentsMap = new HashMap<>();
        List<CommentResponse> commentResponseList = new ArrayList<>();

        commentList.forEach(comment -> {
            List<CommentResponse> underComments = new ArrayList<>();

            CommentResponse dto = CommentResponse.builder()
                    .commentId(comment.getId())
                    .content(comment.getContent())
                    .username(comment.getUser().getName())
                    .profileURL(comment.getUser().getProfileURL())
                    .createdAt(comment.getCreatedAt())
                    .underCommentCount(0)
                    .underComments(underComments)
                    .build();

            mainCommentsMap.put(dto.getCommentId(), dto);

            if(comment.getMainComment() != null) {
                final CommentResponse mainComment = mainCommentsMap.get(comment.getMainComment().getId());
                mainComment.getUnderComments().add(dto);
                mainComment.setUnderComments(mainComment.getUnderCommentCount()+1);
            }
            else commentResponseList.add(dto);
        });

        return  CommentListResponse.builder().postId(postId).comments(commentResponseList).build();
    }


}
