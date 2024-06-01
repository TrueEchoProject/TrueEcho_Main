package te.trueEcho.domain.post.service;


import org.hibernate.sql.Update;
import te.trueEcho.domain.post.dto.*;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.entity.PostStatus;

import java.util.List;


public interface PostService {

    ReadPostResponse  getSinglePost(Long postId);

    PostListResponse getAllPostByType(ReadPostRequest readPostRequest);

    CommentListResponse getComment(ReadCommentRequest readCommentRequest);

    LikeUpdateResponse updateLikes(UpdateLikesRequest updateLikesRequest);

    PostStatus getPostStatus(String todaySHot);

    boolean writeComment(WriteCommentRequest writeCommentRequest);

    boolean deleteComment(Long commentId);

    boolean deletePost(Long postId);

    boolean writePost(AddPostRequest addPostRequest);
}
