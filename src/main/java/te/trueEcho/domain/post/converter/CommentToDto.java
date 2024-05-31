package te.trueEcho.domain.post.converter;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.post.dto.CommentListResponse;
import te.trueEcho.domain.post.dto.CommentResponse;
import te.trueEcho.domain.post.dto.ReadCommentRequest;
import te.trueEcho.domain.post.entity.Comment;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@NoArgsConstructor
public class CommentToDto {
    public CommentListResponse converter(List<Comment> commentList,
                                         ReadCommentRequest request,
                                         long requestUserId) {

        Map<Long, CommentResponse> mainCommentsMap = new HashMap<>();
        List<CommentResponse> commentResponseList = new ArrayList<>();
    
        commentList.forEach(comment -> {
            List<CommentResponse> underComments = new ArrayList<>();

            CommentResponse dto = CommentResponse.builder()
                    .commentId(comment.getId())
                    .content(comment.getContent())
                    .isMine(comment.getUser().getId()==requestUserId)
                    .userId(comment.getUser().getId())
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
  
        // 페이징
        int fromIndex = request.getIndex() * request.getPageCount();
        int toIndex = Math.min(fromIndex + request.getPageCount(), 
                                commentResponseList.size());
        List<CommentResponse> pagedCommentList = commentResponseList.subList(fromIndex, toIndex);

        return  CommentListResponse.builder().
                postId(request.getPostId())
                .comments(pagedCommentList)
                .commentCount(pagedCommentList.size())
                .build();
    }
}
