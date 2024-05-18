package te.trueEcho.domain.post.repository;

import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.User;

import java.util.List;

public interface PostRepository {
    List<Post> readPost(int pageCount, int index,  List<User> filteredUser);

    List<Comment> readCommentWithUnderComments(Long postId);

    void save(Post post);
}
