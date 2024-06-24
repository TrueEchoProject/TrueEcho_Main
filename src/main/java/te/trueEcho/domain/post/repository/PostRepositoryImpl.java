package te.trueEcho.domain.post.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.BatchSize;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Like;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.entity.PostStatus;
import te.trueEcho.domain.user.entity.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Slf4j
@Repository
@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepository {
    private final EntityManager em;

    @Transactional(readOnly = true)
    @Override
    @BatchSize(size = 100)
    public List<Post> getAllPost(int pageCount, int index, List<User> filteredUser) {
        int currentIndex = index * pageCount;
        return em.createQuery("select distinct p from Post p " +
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
                            "left join fetch p.likes " +
                            "where p.id = :postId", Post.class)
                    .setParameter("postId", postId)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("getPostById error : {}", e.getMessage());
            return null;
        }
    }

    public Post getLatestPostByUser(User user) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime oneDayAgo = now.minusDays(1);
            return em.createQuery("select p from Post p " +
                            "where p.user = :user and " +
                            "p.createdAt >= :oneDayAgo " +
                            "order by p.createdAt desc", Post.class)
                    .setParameter("user", user)
                    .setParameter("oneDayAgo", oneDayAgo)
                    .setMaxResults(1)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("getLatestPostByUser error : {}", e.getMessage());
            return null;
        }
    }

    /**
     * 먼저 그 게시물에 해당하는 메인 댓글을 조회하고,
     * 그 댓글을 이용해 서브 댓글 조회하기.
     * 
     * 서브댓글에서 시작해서 조회하기
     * 
     * 메인 댓글에서 시작해서 조회하기.
     */
    public List<Comment> readCommentWithUnderComments(Long postId) {

        return em.createQuery("SELECT c FROM Comment c " +
                        "JOIN FETCH c.user " +
                        "WHERE c.post.id = :postId " +
                        "ORDER BY c.mainComment.id, c.createdAt", Comment.class)

                .setParameter("postId", postId)
                .getResultList();
    }

    public List<Post> getRandomPost() {
        try {

            return em.createQuery("select p from Post p " +
                            "join fetch p.user " +
                            "order by p.createdAt desc", Post.class)
                    .setFirstResult(0)
                    .setMaxResults(50)
                    .getResultList();

        } catch (Exception e) {
            log.error("getRandomPost error : {}", e.getMessage());
            return null;
        }
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


    @Override
    public void save(Post post) {
        if (post.getId() == null) {
            em.persist(post);
        } else {
            em.merge(post);
        }
    }


    public boolean deletePost(Long postId) {
        try{
            Post post = em.find(Post.class, postId);
            if (post != null) {
                em.remove(post);
                em.flush();
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
            return em.createQuery("select p from Post p " +
                            "left join fetch p.likes " +
                            "where p.id in :postIdList", Post.class)
                    .setParameter("postIdList", postIdList)
                    .getResultList();
        } catch (Exception e) {
            log.error("getPostByIdList error : {}", e.getMessage());
            return null;
        }

    }



    @Override
    public boolean deleteLike(Like like) {
        try {
            if (like != null) {
                em.remove(like);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("deleteLike error : {}", e.getMessage());
            return false;
        }
    }
    @Transactional
    public void saveLike(Like like) {
        try {
            em.persist(like);
        } catch (Exception e) {
            log.error("saveLike error : {}", e.getMessage());
        }
    }

    @Override
    public Like findLikeByUserAndPost(User user, Post post) {
        try {
            return em.createQuery("select l from Like l " +
                            "where l.user = :user and " +
                            "l.post = :post", Like.class)
                    .setParameter("user", user)
                    .setParameter("post", post)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("findLikeByUserAndPost error : {}", e.getMessage());
            return null;
        }
    }

    @Override
    public Comment findCommentById(Long commentId) {
        try {
            return em.createQuery(
                            "SELECT c FROM Comment c " +
                                    "JOIN FETCH c.user " +
                                    "WHERE c.id = :commentId", Comment.class)
                    .setParameter("commentId", commentId)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("findCommentById error : {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean existsByUserAndCreatedAtIsAfterAndStatus(User user, LocalDateTime createdAt, PostStatus status) {
        Long count = em.createQuery(
                        "SELECT COUNT(p) FROM Post p WHERE p.user = :user AND p.createdAt > :createdAt AND p.status = :status",
                        Long.class)
                .setParameter("user", user)
                .setParameter("createdAt", createdAt)
                .setParameter("status", status)
                .getSingleResult();

        return count > 0;
    }
}
