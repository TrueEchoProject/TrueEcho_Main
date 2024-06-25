package te.trueEcho.domain.post.converter;


import lombok.NoArgsConstructor;
import te.trueEcho.domain.post.dto.WriteCommentRequest;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.User;

@NoArgsConstructor
public class DtoToComment {
    public Comment converter(WriteCommentRequest writeCommentRequest,
                             User writer, Post post, Comment parentComment){
        return Comment.builder()
                .content(writeCommentRequest.getContent())
                .post(post)
                .user(writer)
                .mainComment(parentComment)
                .content(writeCommentRequest.getContent())
                .notificationEntity(null)
                .build();
    }
}
