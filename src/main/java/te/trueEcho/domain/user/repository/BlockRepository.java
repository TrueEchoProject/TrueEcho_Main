package te.trueEcho.domain.user.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.entity.Block;
import te.trueEcho.domain.user.entity.User;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static te.trueEcho.domain.friend.entity.FriendStatus.FRIEND;

@Repository
@Slf4j
@RequiredArgsConstructor
public class BlockRepository {

    private final EntityManager em;

    @Transactional
    public void save(Block block) {
        if (block.getId() == null) {
            em.persist(block);
        } else {
            em.merge(block);
        }
    }

    public boolean removeBlock(User loginUser, User targetUser) {
        try {
            String hql = "delete from Block b where b.user = :loginUser and b.blockUser = :targetUser";
            em.createQuery(hql)
                    .setParameter("loginUser", loginUser)
                    .setParameter("targetUser", targetUser)
                    .executeUpdate();
            return true;
        } catch (Exception e) {
            log.error("Error occurred while rejecting friend request", e);
            return false;
        }
    }

    public List<User> getBlockList(User loginUser) {
        try {
            return em.createQuery("select b.blockUser from Block b where b.user = :loginUser", User.class)
                    .setParameter("loginUser", loginUser)
                    .getResultList();
        } catch (Exception e) {
            log.error("Error occurred while getting block list", e);
            return Collections.emptyList();
        }
    }
}
