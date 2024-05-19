package te.trueEcho.domain.post.service;


import te.trueEcho.domain.post.dto.AddPostRequest;
import te.trueEcho.domain.post.dto.CommentListResponse;
import te.trueEcho.domain.post.dto.ReadPostRequest;
import te.trueEcho.domain.post.dto.PostListResponse;
import te.trueEcho.domain.post.entity.Post;

import java.util.List;


public interface PostService {

    PostListResponse getAllPostByType(ReadPostRequest readPostRequest);

    CommentListResponse getComment(Long postId);

    boolean writePost(AddPostRequest addPostRequest);
}
