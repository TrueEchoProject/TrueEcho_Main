package te.trueEcho.domain.setting.repository;


import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.post.entity.Pin;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
public class SettingRepositoryImpl implements SettingRepository{
    private final EntityManager em;


    @Override
    public List<Post> getMonthlyPosts(int month, User user) {
        log.info("getMontlyPosts called month {}: ",month);
        try{
            return em.createQuery("select p from Post p " +
                            "where p.user =:user and month(p.createdAt) = :month", Post.class)
                    .setParameter("user", user)
                    .setParameter("month", month)
                    .getResultList();

        }catch(Exception e){
            log.error("getMontlyPosts error : {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean deletePinsByUser(User user) {
        try{
          em.createQuery("delete from Pin p where p.user =:user")
                    .setParameter("user", user)
                    .executeUpdate();
          return true;

        }catch(Exception e){
            log.error("deletePinsByUser error : {}", e.getMessage());
            return false;
        }
    }


    @Override
    public List<Pin> getPinsByUser(User user) {
        try {
            return em.createQuery("select p from Pin p where p.user =:user", Pin.class)
                    .setParameter("user", user)
                    .getResultList();
        } catch (Exception e) {
            log.error("getMyPins error : {}", e.getMessage());
        }
        return List.of();
    }

    @Override
    public String getMostVotedTitle(User user) {
        try {
            return em.createQuery(
                            "SELECT v.title " +
                                    "FROM VoteResult vr " +
                                    "JOIN vr.vote v " +
                                    "WHERE vr.userTarget = :user " +
                                    "GROUP BY v.id " +
                                    "ORDER BY COUNT(vr) DESC, MAX(vr.createdAt) DESC",
                            String.class)
                    .setParameter("user", user)
                    .setMaxResults(1)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("getMostVotedTitle error : {}", e.getMessage());
            return null;
        }
    }


}
