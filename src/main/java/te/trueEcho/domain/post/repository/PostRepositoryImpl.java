package te.trueEcho.domain.post.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.User;

import java.util.List;


@Slf4j
@Repository
@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepository{
    private final EntityManager em;


    @Transactional(readOnly = true)
    @Override
    public List<Post> getAllPost(int pageCount, int index, List<User> filteredUser) {
        int currentIndex = index * pageCount;

        return em.createQuery("select p from Post p " +
                        "where  (p.user in : filteredUser)" +
                        "order by p.createdAt desc", Post.class)
                .setParameter("filteredUser", filteredUser)
                .setFirstResult(currentIndex)
                .setMaxResults(pageCount)
                .getResultList();
    }

    @Override
    public Post getPostById(Long postId) {
        try {
            return em.createQuery("select p from Post p " +
                            "join fetch p.user " +
                            "where p.id = :postId", Post.class)
                    .setParameter("postId", postId)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("getPostById error : {}", e.getMessage());
            return null;
        }
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

    @Override
    public Comment getParentComment(Long commentId) {
        try {
            return em.createQuery("SELECT c FROM Comment c " +
                            "JOIN FETCH c.user " +
                            "WHERE c.id = :commentId", Comment.class)
                    .setParameter("commentId", commentId)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("getParentComment error : {}", e.getMessage());
            return null;

        }
    }

    @Override
    public boolean writeComment(Comment comment) {
        try {
            em.persist(comment);
            return true;
        } catch (Exception e) {
            log.error("writeComment error : {}", e.getMessage());
            return false;
        }
    }

    @Transactional
    @Override
    public void save(Post post) {
        if (post.getId() == null) {
            em.persist(post);
        } else {
            em.merge(post);
        }
    }

    @Transactional
    public boolean deletePost(Long postId) {
        try{
            Post post = em.find(Post.class, postId);
            if (post != null) {
                em.remove(post);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("deletePost error : {}", e.getMessage());
            return false;
        }
    }

    @Override
    public boolean deleteComment(Long commentId) {
        try {
            Comment comment = em.find(Comment.class, commentId);
            if (comment != null) {
                em.remove(comment);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("deleteComment error : {}", e.getMessage());
            return false;
        }
    }

    @Override
    public List<Post> getPostByIdList(List<Long> postIdList) {
        try {
            return em.createQuery("select p from Post p where p.id in :postIdList", Post.class)
                    .setParameter("postIdList", postIdList)
                    .getResultList();
        } catch (Exception e) {
            log.error("getPostByIdList error : {}", e.getMessage());
            return null;
        }

    }
}
