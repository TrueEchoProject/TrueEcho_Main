package te.trueEcho.domain.friend.repository;


import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.friend.entity.FriendStatus;
import te.trueEcho.domain.user.entity.User;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static te.trueEcho.domain.friend.entity.FriendStatus.FRIEND;


@Repository
@Slf4j
@RequiredArgsConstructor
public class FriendRepositoryImpl implements FriendRepository {

    private final EntityManager em;

    public List<User> getSendUser(User targetUser) {
        return em.createQuery("select f.sendUser from Friend f where f.targetUser = :targetUser and f.status = :friendStatus", User.class)
                .setParameter("targetUser", targetUser)
                .setParameter("friendStatus", FriendStatus.NOT_FRIEND)
                .getResultList();
    }

    public List<User> getTargetuser(User sendUser) {
        return em.createQuery("select f.targetUser from Friend f where f.sendUser = :sendUser and f.status = :friendStatus", User.class)
                .setParameter("sendUser", sendUser)
                .setParameter("friendStatus", FriendStatus.NOT_FRIEND)
                .getResultList();
    }

    public List<User> findMyFriendsByUser(User user) {
        return em.createQuery("select f.targetUser from Friend f where (f.sendUser = :user or f.targetUser =:user)and f.status= :friendStatus", User.class)
                .setParameter("user", user)
                .setParameter("friendStatus", FRIEND)
                .getResultList();
    }

    @Transactional
    public void save(Friend friend) {
        em.persist(friend);
    }

    @Transactional
    public void acceptRequest(User targetUser, Long sendUserId) {
        String hql = "update Friend f set f.status = :friendStatus where f.targetUser = :targetUser and f.sendUser.id = :sendUserId";
        em.createQuery(hql)
                .setParameter("friendStatus", FRIEND)
                .setParameter("targetUser", targetUser)
                .setParameter("sendUserId", sendUserId)
                .executeUpdate();
    }

    @Transactional
    public boolean rejectRequest(User targetUser, User sendUser) {
        try {
            String hql = "delete from Friend f where f.targetUser = :targetUser and f.sendUser = :sendUser";
            em.createQuery(hql)
                    .setParameter("targetUser", targetUser)
                    .setParameter("sendUser", sendUser)
                    .executeUpdate();
            return true;
        } catch (Exception e) {
            log.error("Error occurred while rejecting friend request", e);
            return false;
        }
    }

    public List<User> getFriendList(User loginUser) {
        try {

            List<Friend> friends = em.createQuery("select f from Friend f" +
                            " join fetch f.sendUser" +
                            " join fetch f.targetUser " +
                            "where (f.sendUser = :loginUser or f.targetUser = :loginUser)" +
                            " and f.status = :friendStatus", Friend.class)
                    .setParameter("loginUser", loginUser)
                    .setParameter("friendStatus", FRIEND)
                    .getResultList();

            List<User> allUsers = new ArrayList<>();
            for (Friend friend : friends) {
                if (friend.getSendUser().equals(loginUser)) {
                    allUsers.add(friend.getTargetUser());
                } else {
                    allUsers.add(friend.getSendUser());
                }
            }

            return allUsers;
        } catch (Exception e) {
            log.error("Error occurred while getting friend list", e);
            return Collections.emptyList();
        }
    }
}
