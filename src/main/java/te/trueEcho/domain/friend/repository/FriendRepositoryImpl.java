package te.trueEcho.domain.friend.repository;


import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.friend.entity.FriendStatus;
import te.trueEcho.domain.user.entity.User;

import java.util.List;


@Repository
@Slf4j
@RequiredArgsConstructor
public class FriendRepositoryImpl implements FriendRepository {

    private final EntityManager em;

    public List<User> findMyFriendsByUser(User user) {
        return em.createQuery("select f.targetUser from Friend f where f.user = :user and f.status= :friendStatus", User.class)
                .setParameter("user", user)
                .setParameter("friendStatus", FriendStatus.FRIEND)
                .getResultList();
    }

    @Transactional
    public void save(Friend friend) {
        em.persist(friend);
    }
}
