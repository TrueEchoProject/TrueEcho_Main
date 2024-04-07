package te.trueEcho.domain.post.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.friend.repository.FriendRepositoryImpl;
import te.trueEcho.domain.post.dto.PostGetDto;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.User;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepository{
    private final EntityManager em;


    @Transactional(readOnly = true)
    @Override
    public List<Post> readPost(int pageCount, int index,  List<User> filteredUser, int high, int low) {
        int currentIndex = index * pageCount;

        return em.createQuery("select p from Post p " +
                        "where  (p.user in : filteredUser) and (p.scope between :low and :high)" +
                        "order by p.createdAt desc", Post.class)
                .setParameter("filteredUser", filteredUser)
                .setParameter("low", low)
                .setParameter("high", high)
                .setFirstResult(currentIndex)
                .setMaxResults(pageCount)
                .getResultList();
    }



}
