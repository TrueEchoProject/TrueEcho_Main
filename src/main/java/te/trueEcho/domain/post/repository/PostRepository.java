package te.trueEcho.domain.post.repository;

import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Like;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.entity.PostStatus;
import te.trueEcho.domain.user.entity.User;
import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository {
    List<Post> getAllPost(int pageCount, int index, List<User> filteredUser);

    Post getPostById(Long postId);

    List<Comment> readCommentWithUnderComments(Long postId);


    List<Post> getRandomPost();
    Comment getParentComment(Long commentId);

    boolean writeComment(Comment comment);
    boolean deletePost(Long postId);
    boolean deleteComment(Long commentId);
    boolean deleteLike(Like like);
    void save(Post post);
    void saveLike(Like like);
    Like findLikeByUserAndPost(User user, Post post);
    List<Post> getPostByIdList(List<Long> postIdList);

    Comment findCommentById(Long commentId);

    boolean existsByUserAndCreatedAtIsAfterAndStatus(User user, LocalDateTime createdAt, PostStatus status);
}
