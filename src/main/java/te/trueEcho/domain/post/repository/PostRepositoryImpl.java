package te.trueEcho.domain.post.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.User;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepository{
    private final EntityManager em;


    @Transactional(readOnly = true)
    @Override
    public List<Post> readPost(int pageCount, int index,  List<User> filteredUser) {
        int currentIndex = index * pageCount;

        return em.createQuery("select p from Post p " +
                        "where  (p.user in : filteredUser)" +
                        "order by p.createdAt desc", Post.class)
                .setParameter("filteredUser", filteredUser)
                .setFirstResult(currentIndex)
                .setMaxResults(pageCount)
                .getResultList();
    }

    /**
     *
        먼저 그 게시물에 해당하는 메인 댓글을 조회하고,
     그 댓글을 이용해 서브 댓글 조회하기.

     서브댓글에서 시작해서 조호히하기

     메인 댓글에서 시작해서 조회하기.

     */
    public List<Comment> readCommentWithUnderComments(Long postId) {
        return em.createQuery("SELECT c FROM Comment c " +
                        "JOIN FETCH c.user " +
                        "WHERE c.post.id = :postId " +
                        "ORDER BY c.mainComment.id, c.createdAt", Comment.class)
                .setParameter("postId", postId)
                .getResultList();
    }
}
