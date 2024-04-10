package te.trueEcho.domain.post.service;


import te.trueEcho.domain.post.dto.CommentListResponse;
import te.trueEcho.domain.post.dto.PostRequest;
import te.trueEcho.domain.post.dto.PostListResponse;


public interface PostService {

    PostListResponse getPost(PostRequest postRequest);

    CommentListResponse getComment(Long postId);
}
