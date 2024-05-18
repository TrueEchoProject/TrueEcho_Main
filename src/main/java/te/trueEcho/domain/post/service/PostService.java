package te.trueEcho.domain.post.service;


import te.trueEcho.domain.post.dto.AddPostRequest;
import te.trueEcho.domain.post.dto.CommentListResponse;
import te.trueEcho.domain.post.dto.ReadPostRequest;
import te.trueEcho.domain.post.dto.PostListResponse;


public interface PostService {

    PostListResponse getPost(ReadPostRequest readPostRequest);

    CommentListResponse getComment(Long postId);

    boolean writePost(AddPostRequest addPostRequest);
}
