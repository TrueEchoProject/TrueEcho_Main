package te.trueEcho.domain.post.service;


import org.hibernate.sql.Update;
import te.trueEcho.domain.post.dto.*;
import te.trueEcho.domain.post.entity.Post;

import java.util.List;


public interface PostService {

    ReadPostResponse  getSinglePost(Long postId);

    PostListResponse getAllPostByType(ReadPostRequest readPostRequest);

    CommentListResponse getComment(Long postId);

    LikeUpdateResponse updateLikes(UpdateLikesRequest updateLikesRequest);

    boolean writeComment(WriteCommentRequest writeCommentRequest);

    boolean deleteComment(Long commentId);

    boolean deletePost(Long postId);

    boolean writePost(AddPostRequest addPostRequest);
}
