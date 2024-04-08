package te.trueEcho.domain.user.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.entity.SuspendedUser;
import te.trueEcho.domain.user.entity.User;

import java.time.LocalDate;
import java.util.List;

@Repository
@Slf4j
@RequiredArgsConstructor
public class SuspendedUserRepository {

    private final EntityManager em;

    @Transactional
    public void save(SuspendedUser suspendedUser) {
        em.persist(suspendedUser);
    }

    @Transactional
    public void deleteSuspendedUsers() {
        List<SuspendedUser> oldSuspendedUsers = em.createQuery(
                        "select su from SuspendedUser su " +
                                "where su.suspendDate < :sevenDaysAgo", SuspendedUser.class)
                .setParameter("sevenDaysAgo", LocalDate.now().minusDays(7))
                .getResultList();

        for (SuspendedUser oldSuspendedUser : oldSuspendedUsers) {
            User userToDelete = oldSuspendedUser.getUser();
            em.remove(userToDelete);
            em.remove(oldSuspendedUser);
        }
    }
}