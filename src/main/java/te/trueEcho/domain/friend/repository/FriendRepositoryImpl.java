package te.trueEcho.domain.friend.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.user.entity.User;

import java.util.List;


@RequiredArgsConstructor
@Repository
public class FriendRepositoryImpl {
    private final EntityManager em;

    public List<User> findMyFriendsByUser(User user) {
        return em.createQuery("select f.targetUser from Friend f where f.user = :user", User.class)
                .setParameter("user", user)
                .getResultList();
    }
}
