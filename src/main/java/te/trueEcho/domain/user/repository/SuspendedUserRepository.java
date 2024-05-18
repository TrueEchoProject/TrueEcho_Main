package te.trueEcho.domain.user.repository;

import jakarta.persistence.EntityManager;
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

    public List<SuspendedUser> findAll() {
        return em.createQuery("select su from SuspendedUser su", SuspendedUser.class)
                .getResultList();
    }

    public SuspendedUser findSuspendedUserByEmail(String email) {
        try {
            return em.createQuery(
                            "select su.user from SuspendedUser su " +
                                    "where su.user.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult().getSuspendedUser();
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public void cancelSuspend(SuspendedUser suspendedUser) {
        SuspendedUser managedSuspendedUser = em.find(SuspendedUser.class, suspendedUser.getId());
        if (managedSuspendedUser != null) {
            User user = em.find(User.class, managedSuspendedUser.getUser().getId());
            user.removeSuspendedUser();
            em.remove(managedSuspendedUser);
            em.flush();
        } else {
            log.warn("SuspendedUser with id {} not found, cannot cancel suspend", suspendedUser.getId());
        }
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