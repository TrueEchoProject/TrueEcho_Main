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

    Post getLatestPostByUser(User user);
    List<Comment> readCommentWithUnderComments(Long postId);

    Post getPostById(Long postId);
    Comment getCommentById(Long commentId);

    Like getLikeById(Long likeId);

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

    Comment getCommentByIdAndSender(Long contentId, Long senderId);

    Like getLikeByIdAndSender(Long contentId, Long id);

    Like getLikeByPostIdAndSender(Long contentId, Long senderId);
}
